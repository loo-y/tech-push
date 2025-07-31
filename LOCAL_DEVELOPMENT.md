# 本地开发环境配置指南

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动完整开发环境
```bash
npm run dev:full
```

这个命令会同时启动：
- Vite 开发服务器 (端口 5173)
- Wrangler 本地 Worker (端口 8787)

### 3. 访问应用
- **主页面**: http://localhost:5173/
- **音频上传页面**: http://localhost:5173/audio-upload
- **Worker API**: http://localhost:8787/

## 🔧 开发环境配置

### 环境变量配置

在本地开发时，你可以在 `wrangler.dev.toml` 中配置环境变量：

```toml
[vars]
ENVIRONMENT = "development"
R2_BASE_URL = "http://localhost:8787"  # 本地开发时的R2访问URL
DEBUG = "true"
```

### R2 存储配置

#### 方案1：使用真实的 R2 Bucket（推荐）
1. 确保你有 Cloudflare 账户和 R2 存储桶
2. 在 `wrangler.dev.toml` 中配置真实的 bucket 名称
3. 运行 `wrangler dev --local` 时会连接到真实的 R2

#### 方案2：使用本地模拟存储
1. 创建一个本地文件存储模拟
2. 修改 `AudioUploadService` 以支持本地文件系统
3. 适合快速原型开发

## 📁 文件结构说明

```
tech-push/
├── wrangler.json          # 生产环境配置
├── wrangler.dev.toml      # 本地开发配置
├── src/
│   ├── worker/
│   │   ├── audio/
│   │   │   ├── upload.ts      # 音频上传服务
│   │   │   └── routes.ts      # API路由
│   │   └── index.ts           # Worker入口
│   └── react-app/
│       ├── components/
│       │   └── AudioUpload.tsx # 音频上传组件
│       └── pages/
│           └── AudioUploadPage.tsx # 音频上传页面
```

## 🌐 网络请求流程

### 本地开发环境
```
浏览器 → localhost:5173 (React App)
           ↓
        localhost:8787 (Worker)
           ↓
        Cloudflare R2 (或本地存储)
```

### 生产环境
```
浏览器 → your-worker.workers.dev
           ↓
        Cloudflare R2
```

## 🔍 调试技巧

### 1. 查看 Worker 日志
```bash
npm run dev:worker
```
Worker 日志会显示在终端中。

### 2. 查看网络请求
在浏览器开发者工具的 Network 标签中查看：
- API 请求到 `/api/audio/*`
- 文件上传请求
- 静态资源加载

### 3. 调试 R2 存储
```bash
# 查看 R2 bucket 内容
wrangler r2 object list insightcast-bucket

# 上传测试文件
wrangler r2 object put insightcast-bucket/test.txt --file ./test.txt
```

## 🐛 常见问题

### 1. R2 访问权限问题
**问题**: 无法访问 R2 bucket
**解决**: 
- 确保已登录 Cloudflare 账户
- 检查 bucket 名称是否正确
- 验证 API 令牌权限

### 2. 端口冲突
**问题**: 端口 8787 被占用
**解决**: 
```bash
# 使用自定义端口
wrangler dev --local --port 8788
```

### 3. 文件上传失败
**问题**: 上传时出现错误
**解决**:
- 检查文件大小限制（50MB）
- 验证文件类型（MP3, WAV, OGG, AAC, M4A）
- 查看 Worker 日志获取详细错误信息

### 4. 跨域问题
**问题**: 浏览器阻止跨域请求
**解决**:
- 确保 React 应用和 Worker 使用正确的端口
- 检查 CORS 配置

## 📝 开发脚本说明

```json
{
  "scripts": {
    "dev": "vite",                    // 只启动 React 开发服务器
    "dev:worker": "wrangler dev --local", // 只启动 Worker
    "dev:full": "concurrently \"npm run dev\" \"npm run dev:worker\"", // 同时启动两者
    "build": "tsc -b && vite build",  // 构建项目
    "deploy": "wrangler deploy"       // 部署到生产环境
  }
}
```

## 🔄 开发工作流

1. **启动开发环境**:
   ```bash
   npm run dev:full
   ```

2. **修改代码**:
   - React 组件: `src/react-app/`
   - Worker 逻辑: `src/worker/`
   - 样式文件: `*.css`

3. **测试功能**:
   - 访问 http://localhost:5173/audio-upload
   - 测试文件上传功能
   - 检查 API 响应

4. **构建和部署**:
   ```bash
   npm run build
   npm run deploy
   ```

## 🎯 最佳实践

1. **环境分离**: 使用不同的配置文件管理开发和生产环境
2. **错误处理**: 在开发环境中启用详细错误日志
3. **测试数据**: 使用真实的音频文件进行测试
4. **版本控制**: 确保配置文件中的敏感信息不被提交到版本控制

## 📚 相关文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Vite 开发服务器文档](https://vitejs.dev/guide/) 