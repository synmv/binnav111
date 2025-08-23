/**
 * EdgeOne Functions - 更新配置文件
 * 路由: /api/update-config
 * 用途: 更新websiteData.js文件内容，触发EdgeOne Pages重新部署
 */

// Base64 编码函数（纯JavaScript实现，兼容所有环境）
function base64Encode(str) {
  try {
    // 尝试使用标准btoa函数
    if (typeof btoa !== 'undefined') {
      return btoa(unescape(encodeURIComponent(str)));
    }
    
    // 尝试使用Node.js Buffer
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64');
    }
    
    // 纯JavaScript实现的Base64编码
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    
    // 先处理UTF-8编码
    const utf8Str = unescape(encodeURIComponent(str));
    let result = '';
    let i = 0;
    
    while (i < utf8Str.length) {
      const a = utf8Str.charCodeAt(i++);
      const b = i < utf8Str.length ? utf8Str.charCodeAt(i++) : 0;
      const c = i < utf8Str.length ? utf8Str.charCodeAt(i++) : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += chars.charAt((bitmap >> 6) & 63);
      result += chars.charAt(bitmap & 63);
    }
    
    // 添加填充
    const padLength = str.length % 3;
    if (padLength === 1) {
      result = result.slice(0, -2) + '==';
    } else if (padLength === 2) {
      result = result.slice(0, -1) + '=';
    }
    
    return result;
    
  } catch (error) {
    throw new Error(`Base64编码失败: ${error.message}`);
  }
}

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 处理POST请求
export async function onRequestPost({ request, env }) {
  const { GITHUB_TOKEN, GITHUB_REPO } = env;
  
  if (!GITHUB_TOKEN) {
    return new Response(JSON.stringify({
      success: false,
      error: 'GITHUB_TOKEN未配置',
      message: '请在EdgeOne项目中配置GITHUB_TOKEN环境变量'
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
      message: '请在EdgeOne项目中配置GITHUB_REPO环境变量'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    // 解析请求数据
    const requestData = await request.json();
    const { config, sha } = requestData;
    
    if (!config) {
      throw new Error('配置内容不能为空');
    }

    if (!sha) {
      throw new Error('文件SHA值缺失，请先获取最新配置');
    }

    // 使用兼容的base64编码
    const encodedContent = base64Encode(config);

    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/src/websiteData.js`;

    // 更新GitHub文件
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'EdgeOne-Functions/1.0'
      },
      body: JSON.stringify({
        message: '🔧 Auto-update website config via EdgeOne Functions',
        content: encodedContent,
        sha: sha // 必须提供当前文件的SHA
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      throw new Error(`GitHub API错误: ${response.status} ${response.statusText} - ${errorData.message || errorText}`);
    }

    const result = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: '配置更新成功！EdgeOne Pages正在自动重新部署，1-2分钟后生效',
      commit: {
        sha: result.commit.sha,
        url: result.commit.html_url,
        message: result.commit.message
      },
      file: {
        sha: result.content.sha,
        size: result.content.size,
        path: result.content.path
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: '更新配置失败',
      message: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        errorName: error.name,
        stack: error.stack
      }
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 