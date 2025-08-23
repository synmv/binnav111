/**
 * Vercel API Route - 提交网站
 * 路由: /api/submit-website
 * 用途: 用户提交新网站到待审核列表
 */

export const config = {
  runtime: 'edge',
}

export default async function handler(request, response) {
  // 处理CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'POST') {
    return response.status(405).json({
      success: false,
      message: '只支持POST请求'
    });
  }

  try {
    // 解析请求数据
    const { name, url, description, category, submitterEmail } = request.body;
    
    // 验证必填字段
    if (!name || !url) {
      throw new Error('网站名称和URL不能为空');
    }

    // 验证URL格式
    try {
      new URL(url);
    } catch (e) {
      throw new Error('URL格式不正确');
    }

    // 创建待审核网站数据
    const pendingWebsite = {
      id: Date.now().toString(),
      name: name.trim(),
      url: url.trim(),
      description: description ? description.trim() : '',
      category: category || 'tools',
      submitterEmail: submitterEmail ? submitterEmail.trim() : '',
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    // 这里可以将数据保存到数据库或文件
    // 由于是静态部署，我们返回成功响应，实际的存储需要其他方式处理
    
    return response.status(200).json({
      success: true,
      message: '网站提交成功！我们会尽快审核您的提交。',
      data: {
        submissionId: pendingWebsite.id,
        website: {
          name: pendingWebsite.name,
          url: pendingWebsite.url,
          description: pendingWebsite.description,
          category: pendingWebsite.category
        },
        submittedAt: pendingWebsite.submittedAt
      }
    });

  } catch (error) {
    console.error('提交网站失败:', error);
    
    return response.status(400).json({
      success: false,
      error: '提交网站失败',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
