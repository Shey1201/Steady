# 部署指南

Steady 当前主要面向 Vercel 部署 Web 应用和 Serverless API。桌面端由 Tauri 独立构建。

## Vercel 部署

项目根目录包含 `vercel.json`：

```json
{
  "outputDirectory": "apps/web/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/apps/api/$1"
    }
  ]
}
```

构建产物位于：

```text
apps/web/dist
```

API 位于：

```text
apps/api
```

## 部署前检查

1. 在 Vercel 中配置必要环境变量。
2. 确认 `npm run build` 可以通过。
3. 确认 API handler 不依赖本地-only 配置。
4. 如果启用数据库，确认 `DATABASE_URL` 可用。

## 本地构建

```bash
npm run build
```

## 桌面端构建

```bash
npm run tauri build
```

桌面端构建依赖本机 Tauri 环境。Windows 下通常需要：

- Rust
- Cargo
- WebView2
- Visual Studio Build Tools with MSVC/SDK

可以用以下命令检查：

```bash
npm run tauri -- info
```

## 注意事项

- 不要把真实 API Key 提交到仓库。
- 认证接口当前仍是 mock，正式部署前需要替换为真实实现。
- 文章持久化依赖 Prisma 和数据库配置，部署前需要补齐数据库迁移流程。
