/**
 * EdgeOne Functions - 获取图标列表
 * 路由: /api/list-icons
 * 用途: 从GitHub仓库获取public/assets目录下的图标文件列表
 */

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 处理GET请求
export async function onRequestGet({ request, env }) {
  const { GITHUB_TOKEN, GITHUB_REPO } = env;

  // 检查必要的环境变量
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return new Response(JSON.stringify({
      success: false,
      message: 'GitHub配置未完成，请检查环境变量',
      icons: []
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    // 获取public/assets目录的内容
    const assetsUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/public/assets`;
    
    const response = await fetch(assetsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'EdgeOne-Functions/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // assets目录不存在，返回空列表
        return new Response(JSON.stringify({
          success: true,
          message: 'assets目录不存在，返回空图标列表',
          icons: []
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      throw new Error(`GitHub API请求失败: ${response.status} ${response.statusText}`);
    }

    const files = await response.json();
    
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

    return new Response(JSON.stringify({
      success: true,
      message: `成功获取${iconFiles.length}个图标文件`,
      icons: iconFiles,
      total: iconFiles.length
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('获取图标列表失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: `获取图标列表失败: ${error.message}`,
      icons: []
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
