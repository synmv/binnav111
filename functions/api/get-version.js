// 获取GitHub仓库版本信息的API
// 支持Cloudflare Pages Functions格式

// Cloudflare Pages Functions 格式
export async function onRequest(context) {
  const { request, env } = context;

  // 只允许 GET 请求
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({
      success: false,
      message: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 获取环境变量
  const GITHUB_TOKEN = env?.GITHUB_TOKEN;
  const GITHUB_REPO = env?.GITHUB_REPO;

  if (!GITHUB_TOKEN) {
    return new Response(JSON.stringify({
      success: false,
      error: 'GITHUB_TOKEN未配置',
      message: '请在部署平台中配置GITHUB_TOKEN环境变量'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  if (!GITHUB_REPO) {
    return new Response(JSON.stringify({
      success: false,
      error: 'GITHUB_REPO未配置',
      message: '请在部署平台中配置GITHUB_REPO环境变量'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    // 获取当前项目版本（从GitHub仓库的package.json读取）
    const packageUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/package.json`;
    const packageResponse = await fetch(packageUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BinNav-Functions/1.0'
      }
    });

    let currentVersion = '1.0.0'; // 默认版本
    if (packageResponse.ok) {
      const packageData = await packageResponse.json();
      try {
        const packageContent = atob(packageData.content);
        const packageJson = JSON.parse(packageContent);
        currentVersion = packageJson.version || '1.0.0';
      } catch (parseError) {
        // 解析package.json失败，使用默认版本
      }
    }

    // 获取仓库的最新release信息
    const releasesUrl = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

    const releaseResponse = await fetch(releasesUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BinNav-Functions/1.0'
      }
    });

    let latestRelease = null;
    let hasNewVersion = false;

    if (releaseResponse.ok) {
      latestRelease = await releaseResponse.json();
      // 比较版本号，去掉可能的v前缀
      const latestVersion = latestRelease.tag_name.replace(/^v/, '');
      hasNewVersion = compareVersions(currentVersion, latestVersion) < 0;
    }

    // 构建返回数据
    const versionInfo = {
      currentVersion,
      latestVersion: latestRelease ? latestRelease.tag_name.replace(/^v/, '') : null,
      hasNewVersion,
      latestRelease: latestRelease ? {
        version: latestRelease.tag_name,
        name: latestRelease.name,
        publishedAt: latestRelease.published_at,
        htmlUrl: latestRelease.html_url,
        body: latestRelease.body,
        prerelease: latestRelease.prerelease
      } : null
    };

    return new Response(JSON.stringify({
      success: true,
      data: versionInfo
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // 缓存5分钟
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: '获取版本信息失败，请稍后重试'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 简单的版本比较函数
function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  const maxLength = Math.max(v1parts.length, v2parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  
  return 0;
}
