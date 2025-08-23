# Cloudflare Pages 部署指南

## 🚀 快速部署

### 1. 一键部署

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sindricn/BinNav_Public)

### 2. 手动部署

#### 方法一：通过Cloudflare Dashboard

1. **登录Cloudflare Dashboard**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 选择 "Pages" 服务

2. **连接GitHub仓库**
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 授权GitHub并选择 `BinNav_Public` 仓库

3. **配置构建设置**
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (默认)

4. **部署项目**
   - 点击 "Save and Deploy"
   - 等待构建完成

#### 方法二：使用Wrangler CLI

```bash
# 1. 安装Wrangler CLI
npm install -g wrangler

# 2. 登录Cloudflare
wrangler login

# 3. 克隆项目
git clone https://github.com/sindricn/BinNav_Public.git
cd BinNav_Public

# 4. 构建项目
npm install
npm run build

# 5. 部署到Cloudflare Pages
wrangler pages deploy dist
```

## ⚙️ 环境变量配置

部署完成后，需要在Cloudflare Dashboard中配置环境变量：

### 配置步骤

1. **进入项目设置**
   - 在Cloudflare Dashboard中找到你的Pages项目
   - 点击项目名称进入详情页

2. **配置环境变量**
   - 点击 "Settings" 标签
   - 在左侧菜单中选择 "Environment variables"
   - 点击 "Add variable" 添加变量

3. **添加以下环境变量**

| 变量名 | 描述 | 示例值 | 必需 |
|--------|------|--------|------|
| `ADMIN_PASSWORD` | 管理后台登录密码 | `your_secure_password` | 否* |
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` | 否* |
| `GITHUB_REPO` | GitHub仓库名 | `username/BinNav_Public` | 否* |
| `RESEND_API_KEY` | Resend邮件服务API密钥 | `re_xxxxxxxxxxxx` | 否* |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@yourdomain.com` | 否* |
| `RESEND_DOMAIN` | 邮件发送域名 | `yourdomain.com` | 否* |

> *标记为"否"的变量不是必需的，但会影响对应功能的使用

4. **重新部署**
   - 配置完环境变量后，触发重新部署
   - 在 "Deployments" 标签中点击 "Retry deployment"

## 🔧 功能说明

### 基础功能（无需配置）
- ✅ 网站导航展示
- ✅ 分类浏览
- ✅ 搜索功能
- ✅ 管理后台访问（默认密码：admin）

### 高级功能（需要配置对应环境变量）

#### 自动保存到GitHub
**需要配置**: `GITHUB_TOKEN` + `GITHUB_REPO`
- 管理后台修改配置后自动保存到GitHub
- 触发自动重新部署

#### 邮件通知功能
**需要配置**: `RESEND_API_KEY` + `ADMIN_EMAIL` + `RESEND_DOMAIN`
- 用户提交网站时发送邮件通知
- 审核结果邮件通知

## 🚨 常见问题

### Q: 一键部署时提示"无法获取存储库内容"？
**A:** 可能的原因和解决方案：
- 确保GitHub仓库是公开的
- 检查仓库名是否正确：`sindricn/BinNav_Public`
- 尝试手动在Cloudflare Dashboard中连接仓库
- 清除浏览器缓存后重试

### Q: 部署时出现"Multiple environments"警告？
**A:** 现在使用的是单环境配置，不应该出现此问题：
```toml
name = "bin-nav"
compatibility_date = "2024-07-01"
pages_build_output_dir = "./dist"

[build]
command = "npm install && npm run build"
```

### Q: 部署时出现"Missing entry-point"错误？
**A:** 这是Cloudflare Pages配置问题：
- 确保 `pages_build_output_dir = "dist"` 配置正确
- **不要使用** `_routes.json` 文件（会导致一键部署失败）
- 检查 `functions` 目录结构是否正确
- 如果问题持续，尝试删除 `wrangler.toml` 让Cloudflare自动检测

### Q: 部署后Functions不工作？
**A:** 检查以下几点：
- 确保 `functions` 目录存在且包含API文件
- Cloudflare Pages会自动检测 `functions` 目录中的API
- 确认环境变量配置正确
- Functions路径应该是 `/api/function-name`

### Q: 环境变量不生效？
**A:** 
- 确保在Cloudflare Dashboard中正确配置了环境变量
- 重新部署项目使环境变量生效
- 检查变量名是否正确（不需要VITE_前缀）

### Q: 部署后无法访问管理后台？
**A:** 
- 访问地址：`https://your-project.pages.dev/admin`
- 默认密码：`admin`
- 如果设置了 `ADMIN_PASSWORD`，使用自定义密码

## 📝 注意事项

- Cloudflare Pages会自动检测Vite项目并配置构建设置
- Functions功能需要 `functions` 目录中的API文件
- 环境变量修改后需要重新部署才能生效
- 建议在生产环境中修改默认管理密码

## 🔍 故障排除

### 构建失败
1. 检查 `package.json` 中的构建脚本
2. 确保所有依赖都在 `package.json` 中声明
3. 查看构建日志获取详细错误信息

### Functions不工作
1. 检查 `functions/api/` 目录结构
2. 确保API文件使用正确的导出格式
3. 检查环境变量配置

---

**💡 提示**: 如果遇到部署问题，可以查看Cloudflare Pages的部署日志获取详细错误信息。
