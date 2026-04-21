# 开发指南

本文档说明如何在本地开发 Steady。

## 环境准备

需要安装：

- Node.js 18 或更高版本
- npm
- 如需运行 Tauri：Rust、Cargo、对应平台的构建工具

Windows 下运行 Tauri 还需要 WebView2 和 Visual Studio Build Tools 的 MSVC/SDK 组件。

## 安装依赖

在仓库根目录执行：

```bash
npm install
```

项目使用 npm workspaces，根目录安装会同时处理 `apps/web` 和 `apps/desktop` 的依赖。

## 常用脚本

```bash
npm run dev
```

启动 Web 开发服务。

```bash
npm run tauri dev
```

启动桌面端开发模式。该命令从 `apps/desktop` 启动 Tauri，并使用 `apps/web` 的开发服务。

```bash
npm run build
```

构建 Web 产物。

```bash
npm run preview
```

预览 Web 构建产物。

```bash
npm test
```

运行 Vitest 测试。

## 本地 API

本地开发时，`apps/web/vite.config.ts` 会把 `/api/*` 请求转发到 `apps/api` 中的 handler。这样前端开发和部署后的 API 路径保持一致。

## 测试说明

当前测试包含：

- Web 侧 AI service 测试
- API generate handler 测试

API 测试会 mock AI SDK，并在测试中注入必要环境变量，避免依赖真实模型服务。

## Tauri 注意事项

如果 `npm run tauri dev` 失败，请先检查：

- Rust 是否安装
- Cargo 是否可用
- Windows 是否安装 MSVC/SDK
- WebView2 是否可用

可以运行：

```bash
npm run tauri -- info
```

查看 Tauri 环境诊断信息。
