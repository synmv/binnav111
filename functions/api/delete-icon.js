/**
 * EdgeOne Functions - 删除图标文件
 * 路由: /api/delete-icon
 * 用途: 从GitHub仓库删除指定的图标文件
 */

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 处理DELETE请求
export async function onRequestDelete({ request, env }) {
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
    const { fileName } = requestData;
    
    if (!fileName) {
      throw new Error('文件名不能为空');
    }

    // 确保文件名安全
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `public/assets/${safeFileName}`;
    
    // 首先获取文件信息（需要SHA值来删除）
    const checkUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
    
    const checkResponse = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'EdgeOne-Functions/1.0'
      }
    });
    
    if (!checkResponse.ok) {
      if (checkResponse.status === 404) {
        throw new Error('文件不存在');
      }
      throw new Error(`无法获取文件信息: ${checkResponse.status} ${checkResponse.statusText}`);
    }

    const fileInfo = await checkResponse.json();
    
    // 删除文件
    const deleteResponse = await fetch(checkUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'EdgeOne-Functions/1.0'
      },
      body: JSON.stringify({
        message: `🗑️ Delete icon: ${safeFileName}`,
        sha: fileInfo.sha
      })
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      throw new Error(`GitHub API错误: ${deleteResponse.status} ${deleteResponse.statusText} - ${errorData.message || errorText}`);
    }

    const result = await deleteResponse.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: '图标删除成功！',
      deletedFile: {
        fileName: safeFileName,
        path: `/assets/${safeFileName}`,
        fullPath: filePath
      },
      commit: {
        sha: result.commit.sha,
        url: result.commit.html_url
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
      error: '删除图标失败',
      message: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        errorName: error.name
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