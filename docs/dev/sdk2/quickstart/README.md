---
title: 快速开始
---

# 快速开始

5 分钟创建你的第一个秋之盒插件——包含一个 App、一个 Card 和一个 Service。

## 前置条件

- Node.js 20+
- pnpm 9+
- 已克隆 [AutumnBoxRevive](https://github.com/zsh2401/AutumnBoxRevive) 并执行过 `pnpm install`

## 从模板创建项目

```bash
git clone https://github.com/zsh2401/AutumnBoxPluginTemplate.git my-plugin
cd my-plugin
pnpm install
```

模板已包含示例 App、Card、Service 和国际化文件，开箱即用。

::: tip
`package.json` 的 `name` 字段就是插件的唯一标识（pluginId），不需要额外字段。创建项目后，请先修改 `name` 为你自己的包名。
:::

## 项目结构

```
my-plugin/
├── src/
│   ├── apps/
│   │   └── ExampleApp.tsx          ← App：标签页应用
│   ├── cards/
│   │   └── ExampleCard.tsx         ← Card：首页卡片
│   ├── services/
│   │   └── ExampleService.ts       ← Service：共享服务
│   └── main.ts                     ← 可选：插件初始化逻辑
├── resources/
│   └── lang/
│       ├── zh-CN.json
│       └── en-US.json
├── package.json
└── tsconfig.json
```

**核心约定**：
- `src/apps/` — ���出 `export const *App: AutumnApp`
- `src/cards/` — 导出 `export const *Card: AutumnCard`
- `src/services/` — 导出 `export class *Service`
- `src/main.ts` — 导出 `export function main(context): void`（可选）

构建时 SDK 自动扫描这三个目录，生成注册代码。**不需要手动注册任何东西**。

## 编写 Service

Service 是共享的业务逻辑单元，通过 IoC 容器管理。

```typescript
// src/services/ExampleService.ts
import { createReadonlyState } from '@autumnbox/sdk/common';

import type { ServiceContainer } from '@autumnbox/sdk/common';
import type { IReadonlyState } from '@autumnbox/sdk/common';

export class ExampleService {
  /** 插件包名（响应式状态，UI 可订阅） */
  readonly packageName: IReadonlyState<string>;

  constructor(container: ServiceContainer) {
    const [packageName] = createReadonlyState('@myplugins/hello-world');
    this.packageName = packageName;
  }

  getInfo(): string {
    return `当前插件包名: ${this.packageName.value}`;
  }
}
```

构建后自动注册为 `'example'`（类名去掉 `Service` 后缀，首字母小写）。

## 编写 App

App 是用户从应用列表打开的标签页。

```tsx
// src/apps/ExampleApp.tsx
import { Alert, Card, Typography } from 'antd';
import { useService, useServiceState } from '@autumnbox/sdk/hooks';

import { ExampleService } from '../services/ExampleService';

import type { AutumnApp } from '@autumnbox/sdk';

const { Title, Text, Paragraph } = Typography;

const exampleIcon = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#4f46e5"/>
  <text x="64" y="80" text-anchor="middle" font-size="48" fill="white" font-family="system-ui">Ex</text>
</svg>`)}`;

const ExampleAppView: React.FC = () => {
  const exampleService = useService(ExampleService);
  const [packageName] = useServiceState(exampleService.packageName);

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <Title level={3}>Example App</Title>

      <Alert
        type="warning"
        showIcon
        message="开发者演示"
        description="这是一个开发者演示用途的 App，请勿发布到用户，否则将导致插件被下架整改。"
        style={{ marginBottom: 16 }}
      />

      <Card title="插件信息">
        <Paragraph>
          包名: <Text code>{packageName}</Text>
        </Paragraph>
        <Paragraph>
          来源: <Text code>ExampleService.getInfo()</Text> → {exampleService.getInfo()}
        </Paragraph>
      </Card>
    </div>
  );
};

export const ExampleApp: AutumnApp = {
  id: 'example',
  name: 'app.name.example',
  icon: exampleIcon,
  singleton: true,
  tags: ['tools'],
  component: ExampleAppView,
};
```

## 编写 Card

Card 是首页的小组件，展示摘要信息。

```tsx
// src/cards/ExampleCard.tsx
import { Card, Typography } from 'antd';
import { useService, useServiceState } from '@autumnbox/sdk/hooks';

import { ExampleService } from '../services/ExampleService';

import type { AutumnCard } from '@autumnbox/sdk';

const ExampleCardView: React.FC = () => {
  const exampleService = useService(ExampleService);
  const [packageName] = useServiceState(exampleService.packageName);

  return (
    <Card title="Example Card" size="small">
      <Typography.Text>
        包名: <Typography.Text code>{packageName}</Typography.Text>
      </Typography.Text>
      <br />
      <Typography.Text type="warning" style={{ fontSize: 12 }}>
        该卡片仅做展示，请删除。
      </Typography.Text>
    </Card>
  );
};

export const ExampleCard: AutumnCard = {
  id: 'example',
  name: 'card.name.example',
  component: ExampleCardView,
};
```

::: tip
Card 和 App 共享同一个 `ExampleService` 实例（单例）。这就是 IoC 容器的核心价值——跨组件共享状态。
:::

::: warning
模板中的 ExampleApp、ExampleCard、ExampleService 仅用于演示插件开发流程。在开发你自己的插件时，请删除这些��例文件，替换为你的实际业务逻辑。
:::

## 添加国际化

```json
// resources/lang/zh-CN.json
{
  "app.name.example": "示例应用",
  "card.name.example": "示例卡片"
}
```

```json
// resources/lang/en-US.json
{
  "app.name.example": "Example App",
  "card.name.example": "Example Card"
}
```

语言文件由宿主在加载插件时自动导入，无需手动操作。`name` 字段中的值会被当作 i18n key 查找。

## 添加 main.ts（可选）

如果插件需要在加载时做初始化（不是注册 App/Card/Service，那些是自动的），可以创建 `src/main.ts`：

```typescript
// src/main.ts
import type { PluginContext } from '@autumnbox/sdk';

export function main(context: PluginContext): (() => void) | void {
  console.log(`插件 ${context.pluginId} 已加载`);

  // 返回清理函数（可选）
  return () => {
    console.log(`插件 ${context.pluginId} 已卸载`);
  };
}
```

大多数插件不需要 `main.ts`。所有的注册都由构建系统自动处理。

## 构建

```bash
pnpm run build
```

输出：

```
Discovered 1 service(s), 1 app(s), and 1 card(s).
  Services: ExampleService
  Apps: ExampleApp
  Cards: ExampleCard
Generated entry: src/__entry__.ts
Building plugin...
✓ built in 230ms
Build complete: dist/index.js
Generated dist/package.json with autumnbox metadata.
Packaged: myplugins-hello-world.atmb
```

SDK 会：
1. 扫描 `src/services/`、`src/apps/`、`src/cards/` 发现命名导出
2. 生成 `src/__entry__.ts`（自动注册代码，不要手动修改）
3. 用 Vite 打包为 UMD bundle
4. 写入 `dist/package.json`（含 autumnbox 元数据）
5. 打包为 `.atmb` 文件

### 生成的 `src/__entry__.ts`

```typescript
// 此文件由 autumnbox-sdk build 自动生成，请勿手动修改。一切修改将在下次构建时被覆盖。

import type { PluginContext } from '@autumnbox/sdk';

import { ExampleService } from './services/ExampleService';
import { ExampleApp } from './apps/ExampleApp';
import { ExampleCard } from './cards/ExampleCard';
import { main } from './main';

/**
 * 此函数由 autumnbox-sdk build 自动生成，请勿手动修改。
 * 任何手动修改都会在下次构建时被覆盖。
 */
export function __autumnbox_entry__(context: PluginContext): () => void {
  const disposers: Array<() => void> = [];

  // Services
  context.serviceContainer.registerService(ExampleService);

  // Apps
  disposers.push(context.registerApp(ExampleApp));

  // Cards
  disposers.push(context.registerCard(ExampleCard));

  // Plugin initialization
  const mainDispose = main(context);
  if (mainDispose) disposers.push(mainDispose);

  return () => {
    for (const dispose of disposers) dispose();
  };
}
```

这就是构建系统为你做的一切——一目了然。

## 安装到秋之盒

将 `.atmb` 文件复制到秋之盒的 `packages/app/builtin-plugins/` 目录：

```bash
cp *.atmb /path/to/AutumnBoxRevive/packages/app/builtin-plugins/
```

启动（或刷新）应用，插件自动加载。你会看到：
- 应用列表中出现 **"示例应用"** App
- 首页出现 **"示例卡片"** Card
- 两者共享同一个 ExampleService 实例

## 开发工作流

推荐的日常开发流程：

```bash
# 1. 修改代码
# 2. 构建
pnpm run build

# 3. 复制到秋之盒（可以写成脚本）
cp *.atmb /path/to/AutumnBoxRevive/packages/app/builtin-plugins/

# 4. 刷新浏览器
```

::: tip
如果使用 AutumnBoxReviveWorkingSpace，`make plugins` 会自动构建所有插件并复制到 builtin-plugins/。
:::

## 下一步

- [App 详解](/dev/sdk2/apps/) — 完整的 AutumnApp 类型、所有 Hooks、React/Custom 模式
- [Card 详解](/dev/sdk2/cards/) — AutumnCard 类型、响应式状态订阅
- [Service 详解](/dev/sdk2/services/) — IoC 容器、内置服务、名称派生规则
- [插件结构](/dev/sdk2/plugin-structure/) — .atmb 格式、共享模块、资源管理
- [构建与部署](/dev/sdk2/build-deploy/) — 构建配置、发布到插件商店
