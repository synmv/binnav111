/**
 * Vercel API Route - 处理网站提交
 * 路由: /api/process-website-submission
 * 用途: 管理员审核和处理用户提交的网站
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
      message: '只支持POST请求'
    });
  }

  try {
    // 解析请求数据
    const { action, submissionId, website, reason } = request.body;
    
    if (!action || !submissionId) {
      throw new Error('操作类型和提交ID不能为空');
    }

    if (!['approve', 'reject'].includes(action)) {
      throw new Error('无效的操作类型');
    }

    if (action === 'approve' && !website) {
      throw new Error('批准操作需要提供网站数据');
    }

    // 处理审核结果
    const result = {
      submissionId,
      action,
      processedAt: new Date().toISOString(),
      processedBy: 'admin'
    };

    if (action === 'approve') {
      result.website = website;
      result.message = '网站已批准并添加到导航';
    } else {
      result.reason = reason || '未通过审核';
      result.message = '网站提交已被拒绝';
    }

    // 这里可以将处理结果保存到数据库
    // 由于是静态部署，实际的数据处理需要其他方式
    
    return response.status(200).json({
      success: true,
      message: `网站提交已${action === 'approve' ? '批准' : '拒绝'}`,
      data: result
    });

  } catch (error) {
    console.error('处理网站提交失败:', error);
    
    return response.status(400).json({
      success: false,
      error: '处理网站提交失败',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
