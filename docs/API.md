# API 文档

API handler 位于 `apps/api`，部署后通过 `/api/*` 暴露。本地开发时由 Vite 中间件挂载到同样路径。

## 通用说明

- 请求和响应默认使用 JSON。
- 错误响应通常包含 `error` 字段。
- AI 相关接口需要配置 `DEEPSEEK_API_KEY` 或对应模型服务变量。

## POST /api/generate

AI 文本生成接口，支持普通响应和流式响应。

请求体：

```json
{
  "prompt": "Summarize this article",
  "task": "analysis",
  "stream": false,
  "maxTokens": 1000,
  "temperature": 0.7
}
```

字段说明：

- `prompt`：必填，用户输入内容。
- `task`：可选，支持 `translation`、`summary`、`analysis`、`chat`、`coding`，默认 `analysis`。
- `stream`：可选，是否返回流式响应，默认 `false`。
- `maxTokens`：可选，默认 `1000`，最大 `4096`。
- `temperature`：可选，默认 `0.7`。

普通响应：

```json
{
  "text": "生成结果"
}
```

## POST /api/translate

翻译接口。

请求体：

```json
{
  "prompt": "Text to translate",
  "sourceLang": "en",
  "targetLang": "zh"
}
```

当前实现主要使用 `prompt`，`sourceLang` 和 `targetLang` 已在 schema 中预留。

响应：

```json
{
  "text": "翻译结果"
}
```

## GET /api/read-url

从 URL 抓取并解析文章正文。

请求示例：

```text
/api/read-url?url=https://example.com/article
```

响应：

```json
{
  "url": "https://example.com/article",
  "title": "文章标题",
  "content": "文章正文",
  "summary": "正文前 200 字摘要..."
}
```

说明：

- 当前使用 Cheerio 提取网页正文。
- 对微信公众号文章有额外解析逻辑。
- 部分历史解析规则中存在编码异常文本，后续需要清理。

## POST /api/auth/login

登录接口。

请求体：

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

响应：

```json
{
  "token": "mock-jwt-token",
  "user": {
    "id": "mock-user-id",
    "email": "user@example.com",
    "name": "user"
  }
}
```

当前状态：mock 实现，尚未接入真实数据库和密码校验。

## POST /api/auth/register

注册接口。

请求体：

```json
{
  "email": "user@example.com",
  "password": "password",
  "name": "User"
}
```

当前状态：mock 实现，尚未接入真实用户系统。

## GET /api/articles

获取当前用户的文章列表。

要求：

- 需要认证。
- 依赖 Prisma 数据层。

响应为文章数组，按创建时间倒序返回，最多 50 条。

## POST /api/articles

保存或更新文章。

要求：

- 需要认证。
- 依赖 Prisma 数据层。

请求体：

```json
{
  "url": "https://example.com/article",
  "title": "文章标题",
  "content": "文章正文",
  "summary": "文章摘要"
}
```

当前实现使用 `userId + url` 做 upsert。
