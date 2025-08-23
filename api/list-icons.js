/**
 * Vercel API Route - 获取图标列表
 * 路由: /api/list-icons
 * 用途: 获取public/assets目录中的图标文件列表
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

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!GITHUB_TOKEN) {
    return response.status(500).json({
      success: false,
      error: 'GITHUB_TOKEN未配置',
      message: '请在Vercel项目中配置GITHUB_TOKEN环境变量'
    });
  }

  if (!GITHUB_REPO) {
    return response.status(500).json({
      success: false,
      error: 'GITHUB_REPO未配置',
      message: '请在Vercel项目中配置GITHUB_REPO环境变量'
    });
  }

  try {
    // 获取public/assets目录的内容
    const assetsUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/public/assets`;
    
    const githubResponse = await fetch(assetsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vercel-Functions/1.0'
      }
    });

    if (!githubResponse.ok) {
      if (githubResponse.status === 404) {
        // assets目录不存在，返回空列表
        return response.status(200).json({
          success: true,
          message: 'assets目录不存在，返回空图标列表',
          icons: []
        });
      }
      
      throw new Error(`GitHub API请求失败: ${githubResponse.status} ${githubResponse.statusText}`);
    }

    const files = await githubResponse.json();
    
    // 过滤出图标文件（支持的图片格式）
    const supportedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    const iconFiles = files
      .filter(file => {
        // 只处理文件，不处理目录
        if (file.type !== 'file') return false;
        
        // 检查文件扩展名
        const extension = file.name.toLowerCase().match(/\.[^.]+$/);
        return extension && supportedExtensions.includes(extension[0]);
      })
      .map(file => ({
        name: file.name,
        path: `/assets/${file.name}`,
        size: file.size,
        downloadUrl: file.download_url,
        sha: file.sha,
        type: 'file'
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // 按名称排序

    return response.status(200).json({
      success: true,
      message: `成功获取 ${iconFiles.length} 个图标文件`,
      icons: iconFiles,
      total: iconFiles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取图标列表失败:', error);
    
    return response.status(500).json({
      success: false,
      error: '获取图标列表失败',
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
