/**
 * EdgeOne Functions - 获取配置文件
 * 路由: /api/get-config
 * 用途: 获取当前websiteData.js文件内容，用于管理后台编辑
 */

// 简化的Base64解码函数
function base64Decode(str) {
  try {
    // 方法1：标准 atob
    if (typeof atob !== 'undefined') {
      return atob(str);
    }
    
    // 方法2：Node.js Buffer
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'base64').toString('utf-8');
    }
    
    // 方法3：最简单的纯JS实现
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    
    // 移除换行和空格
    const cleanStr = str.replace(/[\r\n\s]/g, '');
    
    // 简单的4字符->3字节转换
    for (let i = 0; i < cleanStr.length; i += 4) {
      const chunk = cleanStr.substr(i, 4);
      if (chunk.length < 4) break;
      
      const a = chars.indexOf(chunk[0]);
      const b = chars.indexOf(chunk[1]); 
      const c = chunk[2] === '=' ? 0 : chars.indexOf(chunk[2]);
      const d = chunk[3] === '=' ? 0 : chars.indexOf(chunk[3]);
      
      if (a === -1 || b === -1 || (chunk[2] !== '=' && c === -1) || (chunk[3] !== '=' && d === -1)) {
        throw new Error(`无效的Base64字符: ${chunk}`);
      }
      
      const bitmap = (a << 18) | (b << 12) | (c << 6) | d;
      
      result += String.fromCharCode((bitmap >> 16) & 255);
      if (chunk[2] !== '=') result += String.fromCharCode((bitmap >> 8) & 255);
      if (chunk[3] !== '=') result += String.fromCharCode(bitmap & 255);
    }
    
    return result;
    
  } catch (error) {
    return null; // 返回null而不是抛出异常，让调用者处理
  }
}

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
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/src/websiteData.js`;
    
    // 获取文件内容
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BinNav-Functions/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API错误: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // 尝试Base64解码
    const decodedContent = base64Decode(data.content);
    
    if (decodedContent === null) {
      // 解码失败，但不影响功能，返回原始内容让前端处理
      return new Response(JSON.stringify({
        success: true,
        content: data.content, // 返回原始base64内容
        contentType: 'base64', // 标记内容类型
        sha: data.sha,
        path: data.path,
        size: data.size,
        timestamp: new Date().toISOString(),
        warning: 'Base64解码失败，返回原始内容'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS', 
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      content: decodedContent,
      contentType: 'text',
      sha: data.sha, // 用于后续更新
      path: data.path,
      size: data.size,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: '获取配置失败',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// EdgeOne Functions 兼容格式
export async function onRequestGet(context) {
  return onRequest(context);
}