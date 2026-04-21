# 路线图

本文档记录 Steady 后续推荐迭代方向。

## 近期优先级

- 修复 `read-url` 中历史编码异常文本。
- 将 AI prompt 从页面和 service 中抽到 `packages/prompts`。
- 将阅读、查词、分析相关纯逻辑抽到 `packages/core`。
- 补充 README 展示图：`assets/readme/hero.png`、`reader-lookup.png`、`review-flow.png`。
- 完善真实认证流程，替换当前 mock 登录和注册。

## 中期目标

- 接入 Prisma 持久化文章、生词、复习记录。
- 设计统一的用户词库模型。
- 增加更清晰的模型路由配置。
- 完善桌面端剪贴板监听和系统级取词体验。
- 增加端到端测试或关键用户流程测试。

## 长期目标

- 支持多语言阅读和学习。
- 支持更丰富的文章导入来源。
- 支持个性化复习策略。
- 支持多模型 Provider 配置。
- 建立更完整的离线或本地优先能力。
