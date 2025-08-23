/**
 * Vercel API Route - 获取配置文件
 * 路由: /api/get-config
 * 用途: 获取当前websiteData.js文件内容，用于管理后台编辑
 */

export const config = {
  runtime: 'edge',
}

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
    console.error('Base64解码失败:', error);
    throw new Error(`Base64解码失败: ${error.message}`);
  }
}

export default async function handler(request, response) {
  // 处理CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'GET') {
    return response.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: '只支持GET请求'
    });
  }

  // 获取环境变量
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
    // 获取websiteData.js文件内容
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/src/data/websiteData.js`;
    
    const githubResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vercel-Functions/1.0'
      }
    });

    if (!githubResponse.ok) {
      if (githubResponse.status === 404) {
        throw new Error('websiteData.js文件不存在');
      }
      throw new Error(`GitHub API请求失败: ${githubResponse.status} ${githubResponse.statusText}`);
    }

    const fileData = await githubResponse.json();
    
    // 解码Base64内容
    const content = base64Decode(fileData.content);
    
    return response.status(200).json({
      success: true,
      message: '配置文件获取成功',
      data: {
        content: content,
        sha: fileData.sha,
        path: fileData.path,
        size: fileData.size,
        lastModified: fileData.last_modified || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取配置文件失败:', error);
    
    return response.status(500).json({
      success: false,
      error: '获取配置文件失败',
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
