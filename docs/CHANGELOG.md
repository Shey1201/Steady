# 变更记录

本文档记录项目重要变化。当前项目尚未正式发布版本，因此先使用 `Unreleased` 记录。

## Unreleased

### Changed

- 将项目整理为多端 workspace 结构：
  - `apps/web`
  - `apps/api`
  - `apps/desktop`
  - `packages/ui`
  - `packages/core`
  - `packages/shared`
  - `packages/prompts`
- 更新根目录脚本，使 Web、API、Desktop 路径与新结构一致。
- 将 README 改为中文项目入口文档。
- 新增 `docs/` 文档体系。

### Added

- 产品说明文档。
- 架构说明文档。
- 开发指南。
- 环境变量文档。
- API 文档。
- 部署指南。
- 贡献指南。
- 路线图。

### Known Issues

- 认证接口仍是 mock 实现。
- `read-url` 中存在历史编码异常文本，后续需要清理。
- Prisma 持久化闭环尚未完全完成。
- README 展示图尚未补充。
