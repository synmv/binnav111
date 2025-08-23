/**
 * Cloudflare Pages Function - 健康检查
 * 路由: /api/health
 * 用途: 检查 Cloudflare Pages Functions 服务状态和配置
 * 兼容: EdgeOne Functions / Vercel Functions / Cloudflare Pages Functions
 */

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

  try {
    // 获取环境变量
    const GITHUB_TOKEN = env?.GITHUB_TOKEN;
    const GITHUB_REPO = env?.GITHUB_REPO;
    const ADMIN_PASSWORD = env?.ADMIN_PASSWORD;
    const RESEND_API_KEY = env?.RESEND_API_KEY;
    const ADMIN_EMAIL = env?.ADMIN_EMAIL;
    const RESEND_DOMAIN = env?.RESEND_DOMAIN;

    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'BinNav API',
      platform: 'Cloudflare Pages Functions',
      version: '1.0.0',
      config: {
        hasGitHubToken: Boolean(GITHUB_TOKEN),
        hasGitHubRepo: Boolean(GITHUB_REPO),
        hasAdminPassword: Boolean(ADMIN_PASSWORD),
        hasResendApiKey: Boolean(RESEND_API_KEY),
        hasAdminEmail: Boolean(ADMIN_EMAIL),
        hasResendDomain: Boolean(RESEND_DOMAIN),
        repoName: GITHUB_REPO || 'not configured'
      },
      endpoints: [
        '/api/health',
        '/api/verify-password',
        '/api/get-config',
        '/api/update-config',
        '/api/submit-website',
        '/api/process-website-submission',
        '/api/upload-icon',
        '/api/delete-icon',
        '/api/list-icons',
        '/api/get-version'
      ]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error',
      error: error.message
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