---
title: 插件结构
---

# 插件结构

## 入口文件

插件的入口是 `src/index.ts`，需要导出三个命名变量：

```typescript
import type { IPlugin, IAppDefinition, ICardDefinition, IPluginContext } from '@autumnbox/sdk/app';
import type { ServiceContainer } from '@autumnbox/sdk/common';

// 必须导出
export const mainPlugin: IPlugin = { /* ... */ };

// 可选导出
export const mainApps: IAppDefinition[] = [];
export const mainCards: ICardDefinition[] = [];
```

| 导出名 | 类型 | 必须 | 说明 |
|--------|------|------|------|
| `mainPlugin` | `IPlugin` | 是 | 插件元数据和生命周期 |
| `mainApps` | `IAppDefinition[]` | 否 | 注册的 App 列表 |
| `mainCards` | `ICardDefinition[]` | 否 | 注册的 Card 列表 |

## IPlugin 接口

```typescript
interface IPlugin {
  id: string;           // 唯一标识，如 "com.example.myplugin"
  name: string;         // 显示名称
  description?: string; // 描述
  version?: string;     // 版本号
  author?: string;      // 作者

  onInit(services: ServiceContainer, context: IPluginContext): void;
  onEnable(): void;
  onDisable(): void;
}
```

### 生命周期

```
加载 .atmb → 解析 manifest.json → 执行 UMD bundle
  → onInit(services, context)    ← 只调用一次
    → onEnable()                 ← 可多次调用（用户启用/禁用）
    ← onDisable()
    → onEnable()
    ...
```

- **`onInit`**: 接收 `ServiceContainer`（IoC 容器）和 `IPluginContext`（插件上下文）。在此阶段注册自定义服务、初始化状态。
- **`onEnable`** / **`onDisable`**: 用户切换插件开关时触发。适合启动/停止轮询、注册/移除事件监听器等。

## IPluginContext

每个插件在 `onInit` 时收到一个独立的 context：

```typescript
interface IPluginContext {
  readonly pluginHome: string;   // 插件专属数据目录路径
  readonly fs: IFileSystem;      // 文件系统实例
  getResource(name: string): Promise<Blob | null>;  // 从 .atmb 内的 resources/ 加载资源
}
```

### 示例：读取 & 写入持久化数据

```typescript
onInit(services: ServiceContainer, context: IPluginContext) {
  const { fs, pluginHome } = context;

  // 写入配置
  const encoder = new TextEncoder();
  await fs.writeFile(`${pluginHome}/config.json`, encoder.encode(JSON.stringify({ theme: 'dark' })));

  // 读取配置
  const data = await fs.readFile(`${pluginHome}/config.json`);
  const config = JSON.parse(new TextDecoder().decode(data));
}
```

### 示例：加载内嵌资源

将文件放入插件项目的 `resources/` 目录，构建后它们会被打包进 `.atmb`：

```typescript
onInit(_services, context) {
  const icon = await context.getResource('logo.png');
  if (icon) {
    const url = URL.createObjectURL(icon);
    // 使用这个 URL
  }
}
```

## .atmb 文件结构

`.atmb` 是 ZIP 格式的归档文件，内部结构：

```
my-plugin.atmb (ZIP)
├── manifest.json     # 插件元信息（自动生成）
├── index.js          # UMD bundle
├── icon.png          # 可选：插件图标
├── resources/        # 可选：静态资源目录
│   └── ...
└── assets/           # 可选：构建产物中的额外资源
    └── ...
```

`manifest.json` 由 SDK 根据 `package.json` 自动生成，格式：

```json
{
  "id": "autumnbox.my-plugin",
  "name": "@autumnbox/my-plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",
  "main": "index.js"
}
```

## TypeScript 配置

插件的 `tsconfig.json` 需要配置路径映射以获得类型支持：

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "paths": {
      "~/*": ["src/*"],
      "@autumnbox/sdk/app": ["../packages/sdk/types/app.d.ts"],
      "@autumnbox/sdk/core": ["../packages/sdk/types/core.d.ts"],
      "@autumnbox/sdk/common": ["../packages/sdk/types/common.d.ts"],
      "@autumnbox/sdk/interfaces": ["../packages/sdk/types/interfaces.d.ts"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

SDK 的构建插件会在编译时自动将 `@autumnbox/sdk/*` 的导入重写为 `@autumnbox/*`，因此你在开发时使用 `@autumnbox/sdk/app`，运行时实际引用的是宿主提供的 `@autumnbox/app`。
