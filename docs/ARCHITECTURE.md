# 架构说明

Steady 采用多应用 workspace 结构，适合同时承载 Web 应用、桌面端壳、Serverless API 和未来共享包。

## 总体结构

```text
apps/
  web/       Vue Web 应用
  desktop/   Tauri 桌面端壳
  api/       Vercel Serverless Functions

packages/
  ui/        通用 UI 组件
  core/      通用业务逻辑
  shared/    类型、工具函数、常量
  prompts/   AI 提示词与任务模板

prisma/      数据库 schema
docs/        项目文档
assets/      静态展示资源
```

## 应用边界

### apps/web

负责用户可见的 Web 阅读体验，包括页面、组件、路由、Pinia 状态、前端服务封装和样式。

适合放在这里的内容：

- 页面组件
- 阅读器 UI
- 查词浮层
- 前端状态管理
- 浏览器可用的 API client

### apps/desktop

负责 Tauri 桌面端配置和桌面端专属能力。

适合放在这里的内容：

- Tauri 配置
- Rust 命令
- 桌面端权限配置
- 应用图标和打包配置
- 系统剪贴板、系统级取词等能力

### apps/api

负责服务端能力，尤其是不能放到浏览器中的密钥、模型调用、网页解析和数据库访问。

适合放在这里的内容：

- AI 生成
- 翻译
- URL 内容抓取
- 用户认证
- 文章数据接口
- Prisma 访问 helper

## packages 规划

当前 `packages/*` 主要是预留结构，后续可以逐步抽取：

- `packages/ui`：跨页面或跨应用复用的 UI 组件。
- `packages/core`：阅读、查词、AI 任务、复习算法等业务逻辑。
- `packages/shared`：类型、常量、纯工具函数。
- `packages/prompts`：AI prompt、任务模板、模型路由元数据。

## 数据流

典型阅读流程：

```text
用户导入文章
  -> apps/web 前端服务
  -> /api/read-url 或本地文本处理
  -> 阅读器展示
  -> 用户选词
  -> /api/generate 或 /api/translate
  -> Quick Lookup / Analysis Panel 展示结果
  -> 生词和文章上下文进入后续持久化流程
```

## 当前技术债

- 认证接口仍是 mock，需要接入真实用户系统。
- URL 解析中有部分历史编码异常文本，应在后续清理。
- `packages/*` 尚未真正抽取共享逻辑。
- Prisma schema 已存在，但持久化闭环仍需继续完善。
