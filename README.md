Steady
======

一个面向「精读 + 记忆」场景的英语学习桌面应用，基于 Vue 3 + Tauri 构建。  
你可以在文章中选词入库，通过遗忘曲线驱动的学习队列，逐步把生词和句型变成长期记忆。

## 功能概览

- **阅读与选词**
  - 在文章中选中单词、短语或句子，一键加入词库（Corpus）
  - 集成快速释义窗口（Quick Lookup），自动翻译并可补充备注、笔记
- **词库管理（Corpus）**
  - 按 word / phrase / sentence 分类浏览
  - 支持收藏、删除、查看详细分析（搭配、语法、逻辑模板等）
- **学习队列（Learning）**
  - Daily Goal 卡片展示当前需要学习与到期复习的数量
  - 从 Corpus 导入学习内容后，自动标记为 *learning* 状态
  - 根据艾宾浩斯遗忘曲线（SM‑2 思路）调整每个条目的复习间隔、稳定度与状态
  - 顶部展示 Retention（保留率）和 Mastered（已掌握数量）
- **学习卡片**
  - 隐藏释义，鼓励先回忆再揭示
  - 在显示释义后，可点击：
    - **掌握**：记忆牢固，拉长复习间隔
    - **模糊**：有印象但不稳定，适度缩短间隔
    - **忘记**：完全想不起来，重置间隔并降低稳定度
- **会话完成反馈**
  - 完成一轮学习后展示 Session Complete 面板，可返回队列或继续从 Corpus 导入
- **登录与设置**
  - 登录页支持邮箱登录，并预留微信登录入口（演示功能）
  - 设置中可以开启/关闭微信相关推送开关（UI 侧），用于未来接入推送服务

## 技术栈

- 框架：Vue 3 + TypeScript
- 路由：Vue Router 4
- 状态管理：Pinia（带持久化插件）
- 样式：Tailwind CSS
- 桌面应用：Tauri 2
- 其它：Heroicons、Headless UI、Google Generative AI SDK（预留智能分析能力）

## 快速开始

> 下面命令默认工作目录为 `d:\Project\Steady\steady`（或你本地的项目根目录）。

### 安装依赖

```bash
npm install
```

### 启动前端开发服务器

```bash
npm run dev
```

默认会在浏览器打开 Vite 开发服务器；你也可以在 Tauri 模式下运行。

### 以 Tauri 方式运行（桌面应用）

```bash
npm run tauri dev
```

构建桌面安装包（实际命令需根据本机 Tauri 环境调整）：

```bash
npm run tauri build
```

### 生产构建

仅构建前端产物：

```bash
npm run build
```

## 目录结构

只列出与前端/学习逻辑相关的关键部分：

- `src/App.vue`：应用根组件与整体布局
- `src/main.ts`：应用入口、Pinia 与路由初始化
- `src/pages/`
  - `Login.vue`：登录页面，包含微信登录入口
  - `Reading.vue`：阅读与选词页面
  - `Article.vue`：文章内容展示
  - `CorpusOverview.vue`：词库总览与管理
  - `ReviewSession.vue`：学习/复习会话核心页面
- `src/components/`
  - `QuickLookup.vue`：选词后的浮动释义与保存面板
  - `ImportArticleModal.vue`：导入文章的弹窗
  - `SettingsModal.vue`：应用设置与微信推送开关
  - 其它布局与导航组件
- `src/stores/`
  - `corpus.ts`：词库与遗忘曲线复习逻辑（SM‑2 风格实现）
  - `library.ts`：文章与段落解析、选词数据
  - `ui.ts` / `user.ts` / `writing.ts`：界面与用户状态
- `src-tauri/`：Tauri 后端 Rust 工程与配置

## 学习算法简要说明

`src/stores/corpus.ts` 中的 `updateReview` 使用类似 SM‑2 的算法：

- 根据用户反馈（easy / good / hard / again）计算质量分数
- 调整每条记录的：
  - `interval`：下一次复习间隔（天）
  - `ef`：易记度因子
  - `stability`：稳定度（0–100）
  - `nextReviewAt`：下一次复习的时间戳
- 当稳定度或复习次数达到一定阈值时，将条目标记为 `mastered`

在界面上，学习卡片使用「掌握 / 模糊 / 忘记」三种中文选项，分别映射到不同的质量等级，从而驱动下一次出现的时间。

## GitHub 仓库

本项目托管于：<https://github.com/Shey1201/Steady>  
如需提交 Issue 或 PR，可以在仓库中直接创建。

## English Summary

Steady is a reading‑first English learning app built with Vue 3 and Tauri.  
You highlight words, phrases, or sentences while reading, save them into a corpus, and then review them through an Ebbinghaus‑style spaced repetition system. The app tracks item stability and automatically schedules future reviews, helping you move from short‑term recognition to long‑term mastery.

