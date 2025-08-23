/**
 * Vercel API Route - 上传图标文件
 * 路由: /api/upload-icon
 * 用途: 上传图标文件到GitHub仓库的public/assets目录
 */

export const config = {
  runtime: 'edge',
}

export default async function handler(request, response) {
  // 处理CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'POST') {
    return response.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: '只支持POST请求'
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
    // 解析请求数据
    const { fileName, fileContent, fileType } = request.body;
    
    if (!fileName || !fileContent) {
      throw new Error('文件名和文件内容不能为空');
    }

    // 验证文件类型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (fileType && !allowedTypes.includes(fileType)) {
      throw new Error('不支持的文件类型');
    }

    // 确保文件名安全
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `public/assets/${safeFileName}`;
    
    // 检查文件是否已存在
    const checkUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
    
    const checkResponse = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vercel-Functions/1.0'
      }
    });
    
    if (checkResponse.ok) {
      throw new Error('文件已存在，请使用不同的文件名');
    }

    // 上传文件到GitHub
    const uploadData = {
      message: `📁 Upload icon: ${safeFileName}`,
      content: fileContent // 应该是base64编码的内容
    };

    const uploadResponse = await fetch(checkUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Functions/1.0'
      },
      body: JSON.stringify(uploadData)
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      throw new Error(`GitHub API错误: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorData.message || errorText}`);
    }

    const result = await uploadResponse.json();
    
    return response.status(200).json({
      success: true,
      message: '图标上传成功！',
      uploadedFile: {
        fileName: safeFileName,
        path: `/assets/${safeFileName}`,
        fullPath: filePath,
        size: result.content.size,
        downloadUrl: result.content.download_url
      },
      commit: {
        sha: result.commit.sha,
        url: result.commit.html_url
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('上传图标失败:', error);
    
    return response.status(500).json({
      success: false,
      error: '上传图标失败',
      message: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        errorName: error.name
      }
    });
  }
}
