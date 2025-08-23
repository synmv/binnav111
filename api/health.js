/**
 * Vercel API Route - 健康检查
 * 路由: /api/health
 * 用途: 检查服务状态和环境变量配置
 */

export const config = {
  runtime: 'edge',
}

export default async function handler(request, response) {
  // 处理CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'GET') {
    return response.status(405).json({
      success: false,
      message: '只支持GET请求'
    });
  }

  try {
    // 获取环境变量
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    // 检查环境变量配置状态
    const envStatus = {
      GITHUB_TOKEN: GITHUB_TOKEN ? '已配置' : '未配置',
      GITHUB_REPO: GITHUB_REPO ? '已配置' : '未配置',
      ADMIN_PASSWORD: ADMIN_PASSWORD ? '已配置' : '未配置'
    };

    // 检查GitHub连接（如果配置了）
    let githubStatus = '未测试';
    if (GITHUB_TOKEN && GITHUB_REPO) {
      try {
        const testUrl = `https://api.github.com/repos/${GITHUB_REPO}`;
        const testResponse = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Vercel-Functions/1.0'
          }
        });
        
        githubStatus = testResponse.ok ? '连接正常' : `连接失败: ${testResponse.status}`;
      } catch (error) {
        githubStatus = `连接异常: ${error.message}`;
      }
    }

    return response.status(200).json({
      success: true,
      message: 'Vercel Functions 服务运行正常',
      data: {
        service: 'Vercel Functions',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: {
          variables: envStatus,
          github: githubStatus
        },
        features: {
          configManagement: GITHUB_TOKEN && GITHUB_REPO ? '可用' : '需要配置GitHub',
          adminAccess: ADMIN_PASSWORD ? '可用' : '需要配置密码'
        }
      }
    });

  } catch (error) {
    console.error('健康检查失败:', error);
    
    return response.status(500).json({
      success: false,
      message: '健康检查失败',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
