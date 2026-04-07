---
title: 秋之盒插件开发
---

# 秋之盒插件开发文档

秋之盒采用基于 `.atmb` 的插件架构。插件使用 TypeScript + React 编写，通过 `@autumnbox/sdk` 提供的 CLI 工具构建为 UMD bundle 并打包为 `.atmb` 归档文件。

## 技术栈

- **语言**: TypeScript（严格模式）
- **UI 框架**: React 19 + Ant Design 6
- **构建工具**: Vite（由 SDK CLI 封装）
- **打包格式**: UMD → `.atmb`（ZIP 归档）

## 插件能做什么

| 能力 | 说明 |
|------|------|
| **App** | 注册为标签页，用户可从应用列表打开 |
| **Card** | 注册为首页卡片小组件 |
| **ADB 交互** | 通过 `ServiceContainer` 获取 `ShellService`、`DeviceFileSystemService` 等操作设备 |
| **持久化存储** | 通过 `IPluginContext.fs` 在插件专属目录读写数据 |
| **静态资源** | 在 `.atmb` 中内嵌 `resources/` 目录，运行时懒加载 |

## 共享模块

以下模块由宿主应用提供，插件**不需要也不应该**打包它们：

```
react, react-dom, react/jsx-runtime
antd, @ant-design/icons
@autumnbox/app, @autumnbox/interfaces, @autumnbox/core, @autumnbox/common
@xterm/xterm, @xterm/addon-fit
```

在插件代码中正常 `import` 即可，构建时 SDK 会自动将它们标记为 external。
