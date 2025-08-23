/**
 * Vercel API Route - 获取版本信息
 * 路由: /api/get-version
 * 用途: 获取当前项目版本和GitHub最新版本信息
 */

export const config = {
  runtime: 'edge',
}

export default async function handler(request, response) {
  // 处理CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'GET') {
    return response.status(405).json({
      success: false,
      message: '只支持GET请求'
    });
  }

  // 获取环境变量
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  try {
    let currentVersion = 'unknown';
    let latestVersion = 'unknown';
    let hasUpdate = false;
    let error = null;

    // 获取当前版本（从package.json）
    try {
      if (GITHUB_TOKEN && GITHUB_REPO) {
        const packageUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/package.json`;
        
        const packageResponse = await fetch(packageUrl, {
          method: 'GET',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Vercel-Functions/1.0'
          }
        });

        if (packageResponse.ok) {
          const packageData = await packageResponse.json();
          const packageContent = Buffer.from(packageData.content, 'base64').toString('utf-8');
          const packageJson = JSON.parse(packageContent);
          currentVersion = packageJson.version || 'unknown';
        }
      }
    } catch (err) {
      console.warn('获取当前版本失败:', err.message);
    }

    // 获取GitHub最新版本
    try {
      if (GITHUB_REPO) {
        const releasesUrl = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
        
        const headers = {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Vercel-Functions/1.0'
        };
        
        if (GITHUB_TOKEN) {
          headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        }

        const releaseResponse = await fetch(releasesUrl, {
          method: 'GET',
          headers: headers
        });

        if (releaseResponse.ok) {
          const releaseData = await releaseResponse.json();
          latestVersion = releaseData.tag_name || 'unknown';
          
          // 简单的版本比较
          if (currentVersion !== 'unknown' && latestVersion !== 'unknown') {
            hasUpdate = currentVersion !== latestVersion;
          }
        }
      }
    } catch (err) {
      console.warn('获取最新版本失败:', err.message);
      error = err.message;
    }

    return response.status(200).json({
      success: true,
      message: '版本信息获取成功',
      data: {
        current: currentVersion,
        latest: latestVersion,
        hasUpdate: hasUpdate,
        repository: GITHUB_REPO || 'unknown',
        error: error
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取版本信息失败:', error);
    
    return response.status(500).json({
      success: false,
      error: '获取版本信息失败',
      message: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        errorName: error.name,
        githubRepo: GITHUB_REPO ? '已配置' : '未配置',
        githubToken: GITHUB_TOKEN ? '已配置' : '未配置'
      }
    });
  }
}
