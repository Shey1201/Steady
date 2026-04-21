# 贡献指南

本文档记录参与 Steady 开发时推荐遵守的约定。

## 开发前准备

1. 阅读根目录 `README.md`。
2. 阅读 [开发指南](./DEVELOPMENT.md) 和 [架构说明](./ARCHITECTURE.md)。
3. 执行 `npm install` 安装依赖。
4. 配置 `.env`，至少保证当前开发任务需要的变量可用。

## 分支建议

推荐使用有语义的分支名：

```text
feature/reader-lookup
fix/api-generate-error
docs/update-readme
refactor/platform-boundary
```

如果由自动化工具创建分支，可以使用 `codex/` 前缀。

## 提交前检查

提交前建议至少运行：

```bash
npm test
npm run build
```

如果修改了桌面端能力，还应运行：

```bash
npm run tauri -- info
```

能完整构建桌面端时，再运行：

```bash
npm run tauri build
```

## 代码约定

- 保持 Web、API、Desktop 的边界清晰。
- 不要把服务端密钥或数据库访问逻辑放入前端。
- AI prompt 应优先沉淀到 `packages/prompts`。
- 可复用业务逻辑应优先沉淀到 `packages/core`。
- 跨端类型和常量应优先沉淀到 `packages/shared`。

## 文档约定

- 新增或变更功能时，同步更新相关文档。
- README 只保留项目入口信息。
- 具体开发、API、部署和架构细节放在 `docs/`。
- 文档要描述真实状态，不要把规划中的能力写成已完成能力。
