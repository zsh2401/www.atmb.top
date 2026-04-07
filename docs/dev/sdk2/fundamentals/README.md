---
title: 基础知识
---

# 基础知识

本文档涵盖秋之盒插件开发的核心概念。理解这些基础知识，你就能掌握整个插件系统的运作原理。

## 响应式状态（State）

秋之盒采用自研的轻量级响应式状态原语，贯穿整个框架——从底层服务到 UI 层绑定。所有状态变化都通过 State 系统传播，无论是设备列表更新、语言切换还是自定义业务状态。

### IReadonlyState\<V\>

`IReadonlyState<V>` 是只读的响应式状态接口。消费者只能读取当前值和订阅变化通知：

```typescript
interface IReadonlyState<V> {
  readonly value: V;
  subscribe(listener: (value: V) => void): () => void;
}
```

| 成员 | 说明 |
|------|------|
| `value` | 当前值，只读。同步访问，不涉及异步。 |
| `subscribe(listener)` | 注册变化监听器。每次值变化时调用 `listener(newValue)`。返回取消订阅函数。 |

用法示例：

```typescript
import type { IReadonlyState } from '@autumnbox/sdk/common';

function watchDeviceCount(devices: IReadonlyState<readonly string[]>): void {
  // 同步读取当前值
  console.log('当前设备数:', devices.value.length);

  // 订阅变化
  const unsubscribe = devices.subscribe((newDevices) => {
    console.log('设备列表已更新:', newDevices.length);
  });

  // 不再需要时取消订阅
  // unsubscribe();
}
```

::: tip
`subscribe` 返回的取消订阅函数是防止内存泄漏的关键。在 React 组件中，`useServiceState` 会自动管理订阅的生命周期。
:::

### IState\<V\>

`IState<V>` 继承自 `IReadonlyState<V>`，增加了写入能力：

```typescript
interface IState<V> extends IReadonlyState<V> {
  value: V; // 可读可写
}
```

直接赋值 `state.value = newValue` 即可触发所有订阅者的回调。这是 Service 内部管理状态的方式。

```typescript
import type { IState } from '@autumnbox/sdk/common';

function example(counter: IState<number>): void {
  console.log(counter.value); // 读取: 0

  counter.value = 42; // 写入并通知所有订阅者
  console.log(counter.value); // 42
}
```

### createState

```typescript
function createState<V>(initial: V): IState<V>;
```

创建一个可变的响应式状态。通常用于 Service 的 **内部实现**——不对外暴露 setter 的场景很少，大多数情况应使用 `createReadonlyState`。

```typescript
import { createState } from '@autumnbox/sdk/common';

const counter = createState(0);

counter.subscribe((value) => {
  console.log('counter 变为:', value);
});

counter.value = 1; // 输出: "counter 变为: 1"
counter.value = 2; // 输出: "counter 变为: 2"
```

### createReadonlyState

```typescript
function createReadonlyState<V>(initial: V): [IReadonlyState<V>, (value: V) => void];
```

创建一个只读视图和私有 setter 的组合，类似于 React 的 `useState` 解构模式：

```typescript
import { createReadonlyState } from '@autumnbox/sdk/common';

const [count, setCount] = createReadonlyState(0);

// count 是 IReadonlyState<number>，外部只能读和订阅
console.log(count.value); // 0

// setCount 是私有 setter，只有创建者持有
setCount(42);
console.log(count.value); // 42
```

核心设计意图：**只读视图对外公开，setter 留在 Service 内部**。这确保了状态变更的单一来源，消费者无法绕过 Service 的业务逻辑直接修改状态。

### 在 Service 中使用 State

一个完整的 Service 示例，展示 `createReadonlyState` 的典型用法：

```typescript
// src/services/CounterService.ts
import { createReadonlyState } from '@autumnbox/sdk/common';

import type { ServiceContainer } from '@autumnbox/sdk/common';
import type { IReadonlyState } from '@autumnbox/sdk/common';

export class CounterService {
  /** 当前计数（只读，UI 可订阅） */
  readonly count: IReadonlyState<number>;

  /** 是否已达上限（只读，UI 可订阅） */
  readonly isMaxed: IReadonlyState<boolean>;

  // 私有 setter——只有 Service 自己能修改
  private readonly setCount: (v: number) => void;
  private readonly setIsMaxed: (v: boolean) => void;

  private static readonly MAX = 100;

  constructor(_container: ServiceContainer) {
    const [count, setCount] = createReadonlyState(0);
    const [isMaxed, setIsMaxed] = createReadonlyState(false);

    this.count = count;
    this.isMaxed = isMaxed;
    this.setCount = setCount;
    this.setIsMaxed = setIsMaxed;
  }

  increment(): void {
    const next = this.count.value + 1;
    this.setCount(next);
    this.setIsMaxed(next >= CounterService.MAX);
  }

  reset(): void {
    this.setCount(0);
    this.setIsMaxed(false);
  }
}
```

这个 Service 的 `count` 和 `isMaxed` 属性是 `IReadonlyState`，任何消费者——无论是其他 Service 还是 React 组件——都只能读取和订阅，不能直接修改。状态的变更必须通过 `increment()` 或 `reset()` 方法。

### 在 React 中使用 State（useServiceState）

`useServiceState` 是连接 State 系统和 React 渲染的桥梁。它订阅 State 变化，在值更新时触发组件重渲染。

`useServiceState` 提供三种重载形式，覆盖不同使用场景：

#### 重载 1：直接传入 IReadonlyState

```typescript
function useServiceState<V>(state: IReadonlyState<V>): [V];
```

传入只读状态，返回 `[当前值]` 单元素元组。没有 setter——因为状态是只读的。

```tsx
import { useService, useServiceState } from '@autumnbox/sdk/hooks';

import { CounterService } from '../services/CounterService';

const CounterDisplay: React.FC = () => {
  const counterService = useService(CounterService);

  // counterService.count 是 IReadonlyState<number>
  const [count] = useServiceState(counterService.count);
  const [isMaxed] = useServiceState(counterService.isMaxed);

  return (
    <div>
      <span>计数: {count}</span>
      {isMaxed && <span style={{ color: 'red' }}>已达上限!</span>}
      <button onClick={() => counterService.increment()}>+1</button>
      <button onClick={() => counterService.reset()}>重置</button>
    </div>
  );
};
```

#### 重载 2：直接传入 IState

```typescript
function useServiceState<V>(state: IState<V>): [V, (v: V) => void];
```

传入可写状态，返回 `[当前值, setter]` 二元组。类似 React `useState` 的返回格式。

```tsx
import { useServiceState } from '@autumnbox/sdk/hooks';

import type { IState } from '@autumnbox/sdk/common';

interface Props {
  // 某个可写的 IState，例如 TabManager.state
  title: IState<string>;
}

const TitleEditor: React.FC<Props> = ({ title }) => {
  const [value, setValue] = useServiceState(title);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};
```

::: warning
框架中大多数公开的 State 属性都是 `IReadonlyState`。只有少数内部状态（如 `TabManager.state`）是 `IState`。插件开发时，你拿到的几乎总是只读状态。
:::

#### 重载 3：通过 Service + 属性名

```typescript
function useServiceState<T, K extends StateKeysOf<T>>(
  service: T | ServiceClass<T>,
  stateName: K,
): UseServiceStateReturn<T[K]>;
```

传入 Service 实例（或 Service 类）和属性名字符串，自动解析对应的 State 属性。返回类型取决于该属性是 `IState` 还是 `IReadonlyState`：

```tsx
import { useServiceState } from '@autumnbox/sdk/hooks';
import { DevicesService } from '@autumnbox/sdk/services';

const DeviceList: React.FC = () => {
  // 方式 A：传入 Service 类 + 属性名（自动从容器解析 Service）
  const [devices] = useServiceState(DevicesService, 'devices');

  // 方式 B：传入 Service 实例 + 属性名
  // const devicesService = useService(DevicesService);
  // const [devices] = useServiceState(devicesService, 'devices');

  return (
    <ul>
      {devices.map((device) => (
        <li key={device.sn}>{device.sn}</li>
      ))}
    </ul>
  );
};
```

`StateKeysOf<T>` 类型工具会自动提取 Service 中所有 `IReadonlyState` / `IState` 类型的属性名，确保只能传入有效的状态属性名——传错名字会在编译期报错。

#### 选择哪种重载？

| 场景 | 推荐写法 |
|------|----------|
| 已经持有 State 对象引用 | `useServiceState(state)` |
| 需要从 Service 读取某个状态属性 | `useServiceState(service, 'propName')` |
| 不想先 useService 再访问属性 | `useServiceState(ServiceClass, 'propName')` |

## ServiceContainer IoC 容器

ServiceContainer 是秋之盒的依赖注入（IoC）容器，管理所有 Service 的注册、解析和生命周期。

### 核心概念

- **懒实例化**：Service 在首次被 `getService()` 请求时才创建实例，而非注册时
- **默认单例**：同一个 Service 类在整个应用生命周期中只有一个实例
- **构造函数注入**：Service 的构造函数接收 `ServiceContainer`，从中获取依赖

```typescript
import type { ServiceContainer } from '@autumnbox/sdk/common';

export class MyService {
  private readonly shellService: ShellService;

  constructor(container: ServiceContainer) {
    // 从容器中获取其他 Service
    this.shellService = container.getService(ShellService);
  }
}
```

### 注册

```typescript
// 类注册（推荐）——懒实例化，默认单例
container.registerService(MyService);

// 带选项注册
container.registerService(MyService, {
  name: 'customName',   // 覆盖自动派生的名称
  singleton: true,       // 默认 true
});

// 实例注册——用于外部创建的对象（驱动、文件系统等）
container.registerInstance('adbDriver', driverInstance);
```

**名称自动派生规则**：

| 类名 | 派生名称 |
|------|----------|
| `DevicesService` | `'devices'`（去掉 `Service` 后缀，首字母小写） |
| `ShellService` | `'shell'` |
| `MyHelper` | `'myHelper'`（无 `Service` 后缀时直接首字母小写） |

### 获取

```typescript
// 按类获取——类型安全，推荐
const devices: DevicesService = container.getService(DevicesService);

// 按名称获取——返回 unknown，需要断言
const driver = container.getService('adbDriver') as IAdbDriver;

// 获取所有同名注册（非单例场景）
const allDrivers = container.getServices('driver');
```

### 在插件中的用法

插件通常不需要直接操作容器。构建系统会自动注册你的 Service，UI 组件通过 `useService()` hook 获取：

```tsx
import { useService } from '@autumnbox/sdk/hooks';
import { ShellService } from '@autumnbox/sdk/services';

const MyApp: React.FC = () => {
  const shell = useService(ShellService);
  // ...
};
```

如果需要直接访问容器（高级用法），可通过 `PluginContext`：

```typescript
export function main(context: PluginContext): void {
  const container = context.serviceContainer;
  const shell = container.getService(ShellService);
}
```

::: tip
更多 Service 系统的细节，请参考 [Service 详解](/dev/sdk2/services/)。
:::

## PluginContext

`PluginContext` 是传递给插件入口函数 `main()` 的上下文对象，也可以在 React 组件中通过 `useCurrentPluginContext()` 获取。它提供了插件运行所需的全部能力。

### 完整接口

```typescript
interface PluginContext {
  /** 插件唯一标识（来自 package.json "name"） */
  pluginId: string;

  /** 插件专属数据目录路径（如 {autumnHome}/plugins/data/{pluginId}/） */
  pluginHome: string;

  /** 文件系统实例，用于读写插件数据 */
  fs: IFileSystem;

  /** 从插件的 resources/ 目录获取打包资源。不存在时返回 null */
  getResource(name: string): Promise<Blob | null>;

  /** 注册一个或多个 App。返回取消注册函数 */
  registerApp(...apps: AutumnApp[]): () => void;

  /** 注册一个或多个 Card。返回取消注册函数 */
  registerCard(...cards: AutumnCard[]): () => void;

  /** 获取响应式翻译（语言切换时自动更新） */
  t(key: string): IReadonlyState<string>;

  /** 从容器中获取 Service（getService 的快捷方式） */
  getService<T>(token: ServiceClass<T>): T;

  /** IoC 容器（高级用法的逃生门） */
  serviceContainer: ServiceContainer;
}
```

### 各成员详解

#### pluginId

插件的唯一标识，直接取自 `package.json` 的 `name` 字段。它在框架内部用于关联 App、Card、翻译文本和数据目录。

```typescript
export function main(context: PluginContext): void {
  console.log(`插件 ${context.pluginId} 已加载`);
  // 输出: "插件 @myplugins/hello-world 已加载"
}
```

#### pluginHome 与 fs

每个插件拥有独立的数据目录。`pluginHome` 是路径字符串，`fs` 是操作该路径的文件系统接口：

```typescript
export function main(context: PluginContext): void {
  const configPath = context.fs.resolve(context.pluginHome, 'config.json');

  // 写入配置
  const data = JSON.stringify({ theme: 'dark' });
  await context.fs.writeFile(configPath, new Blob([data]));

  // 读取配置
  if (await context.fs.exists(configPath)) {
    const stream = await context.fs.readFile(configPath);
    // 处理 ReadableStream...
  }
}
```

#### getResource

从 `.atmb` 包内的 `resources/` 目录懒加载静态资源（图片、JSON 等）：

```typescript
const iconBlob = await context.getResource('icons/my-icon.png');
if (iconBlob) {
  const url = URL.createObjectURL(iconBlob);
  // 使用 url 作为 <img> 的 src
}
```

在 React 中可使用 `usePluginResource` hook：

```tsx
import { usePluginResource } from '@autumnbox/sdk/hooks';

const MyComponent: React.FC = () => {
  const { data, loading, error } = usePluginResource('icons/logo.png');

  if (loading) return <span>加载中...</span>;
  if (!data) return <span>资源不存在</span>;

  const url = URL.createObjectURL(data);
  return <img src={url} alt="logo" />;
};
```

#### registerApp / registerCard

注册 App 和 Card 到宿主应用。返回取消注册函数，用于清理：

```typescript
export function main(context: PluginContext): (() => void) | void {
  const unregisterApps = context.registerApp(myApp1, myApp2);
  const unregisterCards = context.registerCard(myCard);

  return () => {
    unregisterApps();
    unregisterCards();
  };
}
```

::: tip
如果使用约定式目录结构（`src/apps/`、`src/cards/`），构建系统会自动生成注册代码，你不需要在 `main()` 中手动注册。
:::

#### t(key)

获取响应式翻译文本。返回 `IReadonlyState<string>`，在用户切换语言时自动更新：

```typescript
const title = context.t('app.title');
console.log(title.value); // "秋之盒"（中文环境）

// 翻译值的回退链: 当前语言 → en-US → key 本身
```

在 React 中推荐使用 `useT` hook：

```tsx
import { useT } from '@autumnbox/sdk/hooks';

const Header: React.FC = () => {
  const title = useT('app.title');
  return <h1>{title}</h1>; // 语言切换时自动重渲染
};
```

#### useCurrentPluginContext

在 React 组件中获取当前插件的 `PluginContext`：

```tsx
import { useCurrentPluginContext } from '@autumnbox/sdk/hooks';

const MyApp: React.FC = () => {
  const ctx = useCurrentPluginContext();
  console.log(ctx.pluginId); // 当前插件 ID
  // ...
};
```

此 hook 依赖 React Context，只能在插件注册的 App/Card 组件树内部使用。

## Handle-first API 设计

秋之盒的所有设备操作 API 都采用 **Handle-first** 设计：设备句柄（Handle）作为第一参数传入，而非绑定在某个"当前设备"全局变量上。

### AdbDeviceHandle

```typescript
type AdbDeviceHandle = Readonly<{
  sn: string; // 设备序列号
}>;
```

`AdbDeviceHandle` 是一个不可变的轻量对象，仅包含设备序列号。它由 `DevicesService.devices` 状态提供，是所有设备操作的入口凭证。

### 为什么采用 Handle-first

传统设计中，工具通常维护一个"当前选中设备"的全局状态：

```typescript
// 反面示例（不是秋之盒的做法）
deviceManager.setCurrentDevice(device);
shell.exec('ls /sdcard'); // 隐式使用"当前设备"
```

这种设计在多设备场景下会导致竞态条件和混乱。秋之盒选择了显式传递：

```typescript
// 秋之盒的做法
const shell = useService(ShellService);
const output = await shell.exec(device, 'ls /sdcard');
```

优势：

- **天然支持多设备**：不同的 App 标签页可以同时操作不同设备，互不干扰
- **无歧义**：每次调用都明确指定目标设备，不存在"当前设备到底是哪个"的困惑
- **类型安全**：TypeScript 编译器确保你不会忘记传入设备参数

### API 使用示例

#### ShellService

```typescript
import { useService, useRequiredDevice } from '@autumnbox/sdk/hooks';
import { ShellService } from '@autumnbox/sdk/services';

const MyApp: React.FC = () => {
  const device = useRequiredDevice();
  const shell = useService(ShellService);

  const handleCheck = async () => {
    // exec: 执行命令并返回 stdout 字符串
    const output = await shell.exec(device, 'getprop ro.build.version.sdk');
    console.log('SDK 版本:', output.trim());

    // spawn: 更底层的 API，返回 IAdbShellProcess，支持流式 I/O
    const proc = await shell.spawn(device, ['logcat', '-d']);
    // proc.stdout 是 AsyncIterable<Uint8Array>
  };

  return <button onClick={handleCheck}>检查设备</button>;
};
```

#### DeviceFileSystemService

```typescript
import { useService } from '@autumnbox/sdk/hooks';
import { DeviceFileSystemService } from '@autumnbox/sdk/services';

// 列出目录
const entries = await fileService.listDir(device, '/sdcard/');

// 推送文件到设备
await fileService.push(device, '/sdcard/Download/', fileData);

// 从设备拉取文件
await fileService.pull(device, '/sdcard/photo.jpg', {
  type: 'reader',
  chunkCallback: async (chunk) => { /* 处理数据块 */ },
});
```

#### PackageService

```typescript
import { PackageService } from '@autumnbox/sdk/services';

// 列出已安装的包名
const packages = await packageService.listPackages(device);

// 安装 APK
await packageService.installApk(device, apkFileData);
```

#### RebootService

```typescript
import { RebootService } from '@autumnbox/sdk/services';

// 正常重启
await rebootService.reboot(device);

// 重启到 recovery
await rebootService.reboot(device, 'recovery');

// 重启到 bootloader
await rebootService.reboot(device, 'bootloader');
```

### useRequiredDevice

对于需要设备的 App，在定义时设置 `shallSelectAdbDevice: true`，宿主会在打开标签页前提示用户选择设备。在组件内通过 `useRequiredDevice()` 获取保证非空的设备句柄：

```tsx
import { useRequiredDevice } from '@autumnbox/sdk/hooks';

import type { AutumnApp } from '@autumnbox/sdk';

const MyDeviceApp: React.FC = () => {
  const device = useRequiredDevice(); // 保证非 null
  return <div>设备: {device.sn}</div>;
};

export const MyApp: AutumnApp = {
  id: 'my-device-app',
  name: 'app.my-device-app',
  icon: '...',
  shallSelectAdbDevice: true, // 打开前提示选择设备
  component: MyDeviceApp,
};
```

## 共享模块

插件以 UMD bundle 的形式运行在宿主环境中。以下模块由宿主应用提供，插件 **不需要也不应该** 打包它们：

| 模块 | 说明 |
|------|------|
| `react` | React 核心 |
| `react-dom` | React DOM 渲染器 |
| `react/jsx-runtime` | JSX 转换运行时 |
| `antd` | Ant Design 组件库 |
| `@ant-design/icons` | Ant Design 图标库 |
| `@autumnbox/common` | State、ServiceContainer |
| `@autumnbox/core` | 内置 Service（DevicesService 等） |
| `@autumnbox/interfaces` | 接口类型（IAdbDriver、IFileSystem 等） |
| `@autumnbox/app` | 应用层（Hooks、PluginContext、App/Card 类型等） |
| `@xterm/xterm` | 终端模拟器 |
| `@xterm/addon-fit` | xterm 自适应尺寸插件 |

在插件代码中正常 `import` 即可，构建时 SDK 会自动将它们标记为 external。运行时宿主通过 `ModuleRegistry` 提供这些模块的实例。

```typescript
// 正常写法——构建时自动 external 化
import { useState } from 'react';
import { Button } from 'antd';
import { useService } from '@autumnbox/sdk/hooks';
```

::: danger
不要尝试将上述模块安装为 `dependencies` 并打包进插件。这会导致运行时出现两份不同的 React 实例（hooks 错误）或两份不同的 ServiceContainer（服务找不到）。它们只应出现在 `devDependencies` 中用于类型检查。
:::

## SDK 导入路径

`@autumnbox/sdk` 提供了多个子路径入口，按职责组织导出内容。理解这些路径能帮助你准确导入所需的类型和函数。

### `@autumnbox/sdk`

SDK 主入口，导出插件开发最常用的**类型**：

```typescript
import type {
  AutumnApp,       // App 定义类型
  AutumnCard,      // Card 定义类型
  PluginContext,   // 插件上下文
  PluginMain,      // 插件入口函数类型
  PluginMetadata,  // 插件元数据
  AppProps,        // App 组件接收的 Props
  IRouteInfo,      // 路由信息
} from '@autumnbox/sdk';
```

### `@autumnbox/sdk/hooks`

所有 React Hooks，在组件中使用：

```typescript
import {
  useService,              // 从容器获取 Service
  useServiceState,         // 订阅 State 变化
  useT,                    // 获取翻译文本
  useCurrentPluginContext,  // 获取插件上下文
  useRequiredDevice,       // 获取当前设备（保证非空）
  usePluginHome,           // 获取插件数据目录
  usePluginFs,             // 获取插件文件系统
  usePluginResource,       // 加载插件资源
  useShell,                // 增强的 Shell 操作
  useNavigation,           // 应用内导航
  useNavigationEvent,      // 监听导航事件
  useTabCloser,            // 关闭当前标签页
  useTabName,              // 读写标签页标题
  useRequestDevice,        // 请求用户选择设备
  useConnectWiFi,          // WiFi ADB 连接
  useLoadPlugin,           // 加载插件
} from '@autumnbox/sdk/hooks';
```

### `@autumnbox/sdk/services`

所有内置 Service 类，用于 `useService()` 或 `container.getService()`：

```typescript
import {
  DevicesService,       // 设备列表管理
  ShellService,         // Shell 命令执行
  DeviceFileSystemService,          // 文件传输
  PackageService,       // APK 安装/包管理
  RebootService,        // 设备重启
  LanguageService,      // 国际化
  NotificationService,  // 通知
  LocalFileSystemService,    // 文件系统
  DriverService,        // 驱动管理
} from '@autumnbox/sdk/services';
```

### `@autumnbox/sdk/common`

基础工具类型和函数——State 原语和 IoC 容器：

```typescript
import { createState, createReadonlyState, ServiceContainer } from '@autumnbox/sdk/common';

import type {
  IReadonlyState,
  IState,
  ServiceClass,
  ServiceFeats,
} from '@autumnbox/sdk/common';
```

### `@autumnbox/sdk/interfaces`

底层接口类型——设备句柄、驱动接口、文件系统等：

```typescript
import type {
  AdbDeviceHandle,      // 设备句柄
  IAdbDriver,           // ADB 驱动接口
  IAdbShellProcess,     // Shell 进程
  IAdbFileEntry,        // 文件列表项
  IFileSystem,          // 文件系统
  IFileStat,            // 文件状态
  AdbRebootTarget,      // 重启目标
  DeviceState,          // 设备状态
  PushSource,           // 推送来源
  PullDest,             // 拉取目标
} from '@autumnbox/sdk/interfaces';
```

### 导入路径选择指南

| 我需要... | 从哪里导入 |
|-----------|-----------|
| 定义 App/Card 的类型 | `@autumnbox/sdk` |
| React Hook | `@autumnbox/sdk/hooks` |
| 内置 Service 类 | `@autumnbox/sdk/services` |
| State 创建函数或 ServiceContainer | `@autumnbox/sdk/common` |
| 设备、驱动、文件系统等接口类型 | `@autumnbox/sdk/interfaces` |

::: tip
经验法则：如果你在写 React 组件，大部分导入来自 `hooks` 和 `services`。如果你在写 Service，大部分导入来自 `common` 和 `interfaces`。主入口 `@autumnbox/sdk` 只用于类型导入（`import type`）。
:::

## 总结

| 概念 | 核心要点 |
|------|----------|
| **State** | `IReadonlyState` 只读 + 订阅；`IState` 可读写；`createReadonlyState` 分离视图与 setter |
| **ServiceContainer** | 懒实例化单例容器；`registerService(Clazz)` 注册，`getService(Clazz)` 获取 |
| **PluginContext** | 插件入口上下文；提供 `pluginId`、`fs`、`registerApp`、`t()` 等便捷方法 |
| **Handle-first** | 所有设备操作以 `AdbDeviceHandle` 为首参数，天然支持多设备 |
| **共享模块** | React、antd、@autumnbox/* 由宿主提供，插件不打包 |
| **SDK 路径** | 5 个子入口按职责划分：主类型 / hooks / services / common / interfaces |

掌握这些基础后，你可以继续阅读以下文档：

- [App 详解](/dev/sdk2/apps/) — AutumnApp 完整用法
- [Card 详解](/dev/sdk2/cards/) — AutumnCard 完整用法
- [Service 详解](/dev/sdk2/services/) — IoC 容器、内置服务
- [Shell 操作](/dev/sdk2/guide-shell/) — 命令执行与进程管理
- [文件操作](/dev/sdk2/guide-filesystem/) — 设备文件传输
- [国际化](/dev/sdk2/i18n/) — 多语言支持
