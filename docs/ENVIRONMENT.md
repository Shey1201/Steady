# 环境变量

Steady 使用根目录 `.env` 管理本地环境变量。可以从 `.env.example` 复制一份：

```bash
cp .env.example .env
```

Windows PowerShell 可使用：

```powershell
Copy-Item .env.example .env
```

## 当前变量

### DEEPSEEK_API_KEY

DeepSeek 或 OpenAI-compatible Provider 的 API Key。

当前 `/api/generate` 会检查该变量；缺失时 AI 生成功能会失败。

### GOOGLE_GENERATIVE_AI_API_KEY

Google Generative AI 的 API Key。项目依赖中已包含相关 SDK，用于后续或部分 AI 能力集成。

### DASHSCOPE_API_KEY

DashScope API Key。当前作为可选 AI Provider 配置预留。

## 后续可能增加的变量

### DATABASE_URL

Prisma 数据库连接地址。启用真实数据库持久化后需要配置。

### JWT_SECRET

用户认证签名密钥。当前认证接口仍为 mock，实现真实认证时需要增加。

### AI_BASE_URL

OpenAI-compatible Provider 的接口地址。当前模型配置中已有默认值，可按部署环境覆盖。

### AI_MODEL

默认 AI 模型名称。可用于切换不同供应商或不同模型。

## 部署环境

部署到 Vercel 时，需要在 Vercel Project Settings 中配置同名环境变量。不要把真实密钥提交到仓库。
