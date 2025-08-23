/**
 * Vercel API Route - 密码验证
 * 路由: /api/verify-password
 * 用途: 验证管理后台登录密码
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

  const { ADMIN_PASSWORD } = process.env;
  
  // 检查环境变量
  if (!ADMIN_PASSWORD) {
    return response.status(500).json({
      success: false,
      message: '管理密码未配置，请在Vercel项目中配置ADMIN_PASSWORD环境变量'
    });
  }

  try {
    // 解析请求数据
    const { password } = request.body;
    
    if (!password) {
      return response.status(400).json({
        success: false,
        message: '密码不能为空'
      });
    }

    // 验证密码
    const isValid = password === ADMIN_PASSWORD;
    
    if (isValid) {
      return response.status(200).json({
        success: true,
        message: '密码验证成功'
      });
    } else {
      return response.status(401).json({
        success: false,
        message: '密码错误'
      });
    }

  } catch (error) {
    console.error('密码验证失败:', error);
    
    return response.status(500).json({
      success: false,
      message: '密码验证失败',
      error: error.message
    });
  }
}
