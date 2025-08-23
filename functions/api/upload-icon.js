/**
 * EdgeOne Functions - 上传图标文件
 * 路由: /api/upload-icon
 * 用途: 上传图标文件到GitHub仓库的public/assets目录
 */

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions() {
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
    const { fileName, fileContent, fileType } = requestData;
    
    if (!fileName) {
      throw new Error('文件名不能为空');
    }
    
    if (!fileContent) {
      throw new Error('文件内容不能为空');
    }

    // 验证文件类型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(fileType)) {
      throw new Error('不支持的文件类型，仅支持PNG、JPG、GIF、SVG格式');
    }

    // 验证文件名格式
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
    const hasValidExtension = validExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
    if (!hasValidExtension) {
      throw new Error('文件名必须包含有效的图片扩展名');
    }

    // 确保文件名安全
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `public/assets/${safeFileName}`;
    
    // 首先检查文件是否已存在
    const checkUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
    
    let existingFileSha = null;
    try {
      const checkResponse = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'EdgeOne-Functions/1.0'
        }
      });
      
      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        existingFileSha = existingFile.sha;
      }
    } catch (e) {
      // 文件不存在，继续上传
    }

    // 提取base64内容（移除data:image/xxx;base64,前缀）
    const base64Content = fileContent.split(',')[1] || fileContent;

    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

    // 上传或更新GitHub文件
    const requestBody = {
      message: `📸 ${existingFileSha ? 'Update' : 'Add'} icon: ${safeFileName}`,
      content: base64Content
    };

    // 如果文件已存在，需要提供SHA值
    if (existingFileSha) {
      requestBody.sha = existingFileSha;
    }

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'EdgeOne-Functions/1.0'
      },
      body: JSON.stringify(requestBody)
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
      message: `图标${existingFileSha ? '更新' : '上传'}成功！`,
      icon: {
        fileName: safeFileName,
        path: `/assets/${safeFileName}`,
        fullPath: filePath,
        sha: result.content.sha,
        size: result.content.size,
        downloadUrl: result.content.download_url
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
      error: '上传图标失败',
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

