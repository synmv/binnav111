/**
 * EdgeOne Functions - 密码验证
 * 路由: /api/verify-password
 * 用途: 验证管理后台登录密码
 */

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 处理POST请求
export async function onRequestPost({ request, env }) {
  const { ADMIN_PASSWORD } = env;
  
  // 检查环境变量
  if (!ADMIN_PASSWORD) {
    return new Response(JSON.stringify({
      success: false,
      message: '管理密码未配置，请在EdgeOne项目中配置ADMIN_PASSWORD环境变量'
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
    const { password } = requestData;
    
    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        message: '密码不能为空'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 验证密码
    const isValid = password === ADMIN_PASSWORD;
    
    return new Response(JSON.stringify({
      success: isValid,
      message: isValid ? '密码验证成功' : '密码错误'
    }), {
      status: isValid ? 200 : 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('密码验证失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: '密码验证失败，请重试'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 