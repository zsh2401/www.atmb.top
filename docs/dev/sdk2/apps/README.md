---
title: App
---

# App

## 概念

App 是 AutumnBox 插件系统中最核心的 UI 单元。每个 App 是一个独立的标签页（Tab），用户通过主界面的应用列表点击图标来打开它。打开后，App 以完整的标签页形式呈现在内容区域，与浏览器的多标签体验类似：用户可以同时打开多个 App，在标签之间自由切换。

在 UI 层面，App 出现在两个位置：

1. **应用列表（桌面）**：以图标 + 名称的网格形式展示所有已注册的 App，支持按 `tags` 分类筛选
2. **标签页内容区**：用户点击图标后，App 的界面渲染在一个新的标签页中

一个 App 可以是纯信息展示工具、设备管理面板、终端模拟器，或者任何需要独立工作区的功能。

## 创建一个 App

### 约定

AutumnBox SDK 采用**约定优于配置**的自动发现机制。只需遵循以下规则，构建工具会自动扫描、注册你的 App：

1. 将文件放在 `src/apps/` 目录下
2. 导出一个以 `App` 结尾的 `const` 常量（如 `export const HelloApp`）
3. 运行 `autumnbox-sdk build`，构建器自动生成注册代码

### 目录结构

```
my-plugin/
├── src/
│   ├── apps/
│   │   ├── HelloApp.tsx              # 单文件 App
│   │   ├── DeviceInfoApp.tsx         # 另一个 App
│   │   └── FileManagerApp/           # 目录形式的 App
│   │       └── index.tsx
│   ├── cards/
│   ├── services/
│   ├── assets/
│   │   ├── hello.png
│   │   └── device_info.png
│   └── main.ts                       # 可选：额外初始化逻辑
├── resources/
│   └── lang/
│       ├── en-US.json
│       └── zh-CN.json
├── package.json
└── tsconfig.json
```

### 最小完整示例

```tsx
// src/apps/HelloApp.tsx
import type { AutumnApp } from '@autumnbox/sdk';
import helloIcon from '../assets/hello.png';

const HelloAppView: React.FC = () => {
  return <div style={{ padding: 24 }}>Hello, AutumnBox!</div>;
};

export const HelloApp: AutumnApp = {
  id: 'hello',
  name: 'app.name.hello',
  icon: helloIcon,
  singleton: true,
  tags: ['tools'],
  component: HelloAppView,
};
```

这就是创建一个 App 所需的全部代码。`autumnbox-sdk build` 会自动发现 `HelloApp`，将其注册到应用列表中。

## 完整 AutumnApp 类型定义

`AutumnApp` 是一个**判别联合类型（Discriminated Union）**，支持两种渲染模式：React 组件模式和自定义 DOM 模式。

```typescript
/** Base fields shared by all app definitions. */
interface IAppBase {
  /** App 唯一标识符 */
  id: string;

  /** 显示名称（i18n key） */
  name: string;

  /** 图标（data URI 或 URL） */
  icon: string;

  /** 是否为全局单实例（true = 只能打开一个标签页）。默认：false */
  singleton?: boolean;

  /** 为 true 时，打开标签页前提示用户选择设备 */
  shallSelectAdbDevice?: boolean;

  /** 分类标签，用于桌面筛选，如 ['tools', 'device'] */
  tags?: string[];

  /** 为 true 时，图标以 cover 模式填满整个圆角矩形。默认：false */
  iconFit?: boolean;
}

/** Props passed to React-mode app components. */
interface AppProps {
  targetDevice?: AdbDeviceHandle;
  route?: IRouteInfo;
}

/**
 * AutumnApp — 统一的 App 定义类型。
 * 提供 `component`（React 模式）或 `mount`（自定义 DOM 模式），二选一。
 */
type AutumnApp = IAppBase &
  (
    | { component: React.FC<AppProps>; mount?: undefined }   // React 模式
    | { mount: (container: HTMLElement) => () => void; component?: undefined }  // 自定义 DOM 模式
  );
```

两个分支是互斥的：如果提供了 `component`，则 `mount` 必须为 `undefined`（或不提供）；反之亦然。TypeScript 编译器会通过判别联合确保类型安全。

## 字段参考表

| 字段 | 类型 | 必须 | 默认值 | 说明 |
|------|------|:----:|:------:|------|
| `id` | `string` | **是** | — | App 全局唯一标识符。推荐使用 kebab-case，如 `'file-manager'` |
| `name` | `string` | **是** | — | 显示名称。通常是 i18n key，如 `'app.name.file_manager'`，通过语言文件解析为本地化文本 |
| `icon` | `string` | **是** | — | 图标的 data URI 或 URL。推荐 import PNG 文件（Vite 自动内联），也支持 SVG data URI |
| `component` | `React.FC<AppProps>` | 二选一 | — | React 组件模式：提供一个接收 `AppProps` 的 React 函数组件 |
| `mount` | `(container: HTMLElement) => () => void` | 二选一 | — | 自定义 DOM 模式：接收容器元素，返回清理函数 |
| `singleton` | `boolean` | 否 | `false` | 为 `true` 时，全局最多只打开一个标签页。再次点击图标会切换到已有标签页而非新建 |
| `shallSelectAdbDevice` | `boolean` | 否 | `undefined` | 为 `true` 时，打开 App 前弹出设备选择对话框，选中的设备通过 `AppProps.targetDevice` 传入 |
| `tags` | `string[]` | 否 | `undefined` | 分类标签数组。桌面视图可按标签筛选 App，如 `['tools']`、`['device', 'display']` |
| `iconFit` | `boolean` | 否 | `false` | 为 `true` 时，图标以 cover 模式填满圆角矩形区域，适用于已包含圆角的图标 |

## AppProps 接口

当 App 使用 React 组件模式时，组件接收 `AppProps` 作为 props：

```typescript
interface AppProps {
  /** 用户选择的 ADB 设备。仅当 shallSelectAdbDevice: true 时由系统传入 */
  targetDevice?: AdbDeviceHandle;

  /** 通过 URI 导航打开时传入的路由信息 */
  route?: IRouteInfo;
}

interface IRouteInfo {
  /** URI 中的路径部分，如 '/detail' */
  path: string;
  /** URI 中的查询参数，如 { sn: 'abc123' } */
  params: Record<string, string>;
}
```

`AdbDeviceHandle` 是一个不可变的 readonly 类型，是所有 ADB 操作的句柄：

```typescript
type AdbDeviceHandle = Readonly<{
  sn: string;  // 设备序列号
}>;
```

## React 模式 - 完整示例

以下是一个完整的、具有实际功能的 DPI 编辑器 App，展示了设备交互、Shell 命令执行和状态管理：

```tsx
// src/apps/DpiEditorApp.tsx
import { useState, useCallback, useEffect } from 'react';
import { Button, Card, InputNumber, Space, Tag, Spin, message } from 'antd';
import { useService, useT } from '@autumnbox/sdk/app';
import { ShellService } from '@autumnbox/sdk/core';

import type { AutumnApp, AppProps } from '@autumnbox/sdk';
import type { AdbDeviceHandle } from '@autumnbox/sdk/core';

import dpiIcon from '../assets/dpi_editor.png';

// ---- 辅助函数 ----

interface DensityInfo {
  physical: number;
  override: number | null;
}

function parseDensity(output: string): DensityInfo | null {
  const physicalMatch = /Physical density:\s*(\d+)/i.exec(output);
  if (!physicalMatch) return null;
  const physical = Number(physicalMatch[1]);
  const overrideMatch = /Override density:\s*(\d+)/i.exec(output);
  const override = overrideMatch ? Number(overrideMatch[1]) : null;
  return { physical, override };
}

// ---- React 组件 ----

const DpiEditorAppView: React.FC<AppProps> = ({ targetDevice }) => {
  const shell = useService(ShellService);
  const tNoDevice = useT('dpi_editor.no_device');
  const tApply = useT('dpi_editor.apply');
  const tReset = useT('dpi_editor.reset');

  const [physicalDpi, setPhysicalDpi] = useState<number | null>(null);
  const [overrideDpi, setOverrideDpi] = useState<number | null>(null);
  const [inputDpi, setInputDpi] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载当前 DPI
  const loadDensity = useCallback(async () => {
    if (!targetDevice) return;
    setLoading(true);
    try {
      const output = await shell.exec(targetDevice, 'wm density');
      const density = parseDensity(output);
      if (density) {
        setPhysicalDpi(density.physical);
        setOverrideDpi(density.override);
      }
    } catch (err: unknown) {
      void message.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [targetDevice, shell]);

  useEffect(() => {
    void loadDensity();
  }, [loadDensity]);

  // 应用新 DPI
  const handleApply = useCallback(async () => {
    if (!targetDevice || inputDpi == null) return;
    try {
      await shell.exec(targetDevice, `wm density ${inputDpi}`);
      void message.success(`DPI 已设置为 ${inputDpi}`);
      setInputDpi(null);
      await loadDensity();
    } catch (err: unknown) {
      void message.error(err instanceof Error ? err.message : String(err));
    }
  }, [targetDevice, inputDpi, shell, loadDensity]);

  // 重置 DPI
  const handleReset = useCallback(async () => {
    if (!targetDevice) return;
    try {
      await shell.exec(targetDevice, 'wm density reset');
      void message.success('DPI 已重置');
      await loadDensity();
    } catch (err: unknown) {
      void message.error(err instanceof Error ? err.message : String(err));
    }
  }, [targetDevice, shell, loadDensity]);

  if (!targetDevice) {
    return <div style={{ padding: 24 }}>{tNoDevice}</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
      <Spin spinning={loading}>
        <Card>
          <p>物理 DPI: {physicalDpi ?? '--'}</p>
          <p>
            当前 DPI: {overrideDpi ?? physicalDpi ?? '--'}
            {overrideDpi != null && <Tag color="orange" style={{ marginLeft: 8 }}>已修改</Tag>}
          </p>
          <InputNumber
            value={inputDpi}
            onChange={(v) => setInputDpi(v)}
            min={72}
            max={960}
            placeholder={String(overrideDpi ?? physicalDpi ?? '')}
            style={{ width: '100%', marginBottom: 16 }}
          />
          <Space>
            <Button type="primary" disabled={inputDpi == null} onClick={() => void handleApply()}>
              {tApply}
            </Button>
            <Button disabled={overrideDpi == null} onClick={() => void handleReset()}>
              {tReset}
            </Button>
          </Space>
        </Card>
      </Spin>
    </div>
  );
};

// ---- App 定义 ----

export const DpiEditorApp: AutumnApp = {
  id: 'dpi-editor',
  name: 'app.name.dpi_editor',
  icon: dpiIcon,
  singleton: false,
  shallSelectAdbDevice: true,
  tags: ['tools', 'display'],
  component: DpiEditorAppView,
};
```

关键要点：

- `shallSelectAdbDevice: true` 确保打开时弹出设备选择对话框，选中的设备通过 `targetDevice` prop 传入
- `singleton: false` 允许对不同设备打开多个 DPI 编辑器标签页
- 通过 `useService(ShellService)` 获取 Shell 服务，在设备上执行 ADB 命令
- 通过 `useT(key)` 获取本地化文本

## 自定义 DOM 模式 - 完整示例

当不希望使用 React 时，可以通过 `mount` 函数直接操作 DOM。`mount` 接收一个容器元素，必须返回一个清理函数，在标签页关闭时被调用。

```typescript
// src/apps/VanillaApp.ts
import type { AutumnApp } from '@autumnbox/sdk';
import vanillaIcon from '../assets/vanilla.png';

export const VanillaApp: AutumnApp = {
  id: 'vanilla',
  name: 'app.name.vanilla',
  icon: vanillaIcon,
  mount(container: HTMLElement) {
    // 创建 UI
    const title = document.createElement('h1');
    title.textContent = 'Hello from Vanilla JS';
    title.style.padding = '24px';
    container.appendChild(title);

    const counter = document.createElement('p');
    counter.style.padding = '0 24px';
    container.appendChild(counter);

    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      counter.textContent = `计数器: ${count}`;
    }, 1000);

    // 返回清理函数（必须）
    return () => {
      clearInterval(interval);
      container.innerHTML = '';
    };
  },
};
```

自定义 DOM 模式适用于：

- 集成第三方非 React 库（如 Canvas 引擎、WebGL 框架）
- 性能敏感的场景（避免 React 虚拟 DOM 开销）
- 移植已有的原生 JavaScript 代码

::: warning
`mount` 函数必须返回一个清理函数。如果不清理 DOM 和事件监听，会导致内存泄漏。
:::

## Hooks 详解

SDK 提供了一套完整的 React Hooks，供 App 组件在运行时访问宿主服务、设备、国际化等能力。所有 Hooks 均从 `@autumnbox/sdk/app`（实际映射到 `@autumnbox/app`）导入。

### useService

从 IoC 容器中获取服务单例。

```typescript
function useService<T>(Clazz: ServiceClass<T>): T;
```

**参数：**

- `Clazz` — 服务类的构造函数，作为类型 token 用于从容器中解析实例

**返回值：** 服务实例 `T`

**用法：**

```tsx
import { useService } from '@autumnbox/sdk/app';
import { ShellService, DevicesService, LanguageService } from '@autumnbox/sdk/core';

const MyComponent: React.FC = () => {
  const shell = useService(ShellService);
  const devices = useService(DevicesService);
  const lang = useService(LanguageService);

  // shell.exec(device, command) — 执行 ADB 命令
  // devices.devices — 已连接设备列表的响应式状态
  // lang.getT(key) — 获取翻译文本的响应式状态
};
```

**可用的核心服务：**

| 服务 | 说明 |
|------|------|
| `ShellService` | ADB Shell 命令执行（`exec`, `spawn`） |
| `DevicesService` | 设备列表管理（`devices` 响应式状态） |
| `LanguageService` | 国际化服务（`getT`, `switchLocale`, `locale`） |
| `DeviceFileSystemService` | 设备端文件操作（push/pull） |
| `PackageService` | APK 包管理（安装、卸载、查询） |
| `RebootService` | 设备重启（system, recovery, bootloader） |
| `NotificationService` | 宿主通知推送 |
| `LocalFileSystemService` | 宿主文件系统（OPFS / 本地） |
| `DriverService` | 底层驱动访问（获取 AdbDriver 实例） |

### useServiceState

将服务上的 `IReadonlyState<V>` 或 `IState<V>` 桥接到 React 状态，自动订阅并触发重渲染。提供三个重载：

#### 重载 1：可变状态 (IState) → [value, setter]

```typescript
function useServiceState<V>(state: IState<V>): [V, (v: V) => void];
```

当传入一个可写的 `IState<V>` 时，返回当前值和 setter 函数，类似 `useState`。

```tsx
import { useServiceState } from '@autumnbox/sdk/app';

// 假设 myService.count 是 IState<number>
const [count, setCount] = useServiceState(myService.count);
```

#### 重载 2：只读状态 (IReadonlyState) → [value]

```typescript
function useServiceState<V>(state: IReadonlyState<V>): [V];
```

当传入一个只读的 `IReadonlyState<V>` 时，仅返回当前值（单元素元组）。

```tsx
const [devices] = useServiceState(devicesService.devices);
// devices: readonly AdbDeviceHandle[]
```

#### 重载 3：从服务属性名访问 → 自动推断

```typescript
function useServiceState<T, K extends StateKeysOf<T>>(
  service: T | ServiceClass<T>,
  stateName: K,
): UseServiceStateReturn<T[K]>;
```

通过传入服务实例（或服务类）+ 属性名，自动解析对应的 State 属性。返回类型根据属性是 `IState` 还是 `IReadonlyState` 自动推断。

```tsx
import { useService, useServiceState } from '@autumnbox/sdk/app';
import { DevicesService, LanguageService } from '@autumnbox/sdk/core';

const MyComponent: React.FC = () => {
  const devicesService = useService(DevicesService);
  const langService = useService(LanguageService);

  // 传入实例 + 属性名
  const [devices] = useServiceState(devicesService, 'devices');

  // 也可以传入服务类（自动从容器获取实例）
  const [locale] = useServiceState(LanguageService, 'locale');
};
```

**相关类型工具：**

```typescript
/** 提取类型 T 上所有 IReadonlyState 属性的键 */
type StateKeysOf<T> = {
  [K in keyof T]: T[K] extends IReadonlyState<unknown> ? K : never;
}[keyof T];

/** 提取 State 的值类型 V */
type StateValueOf<S> = S extends IReadonlyState<infer V> ? V : never;

/** 根据 State 的可变性决定返回元组类型 */
type UseServiceStateReturn<S> =
  S extends IState<infer V>
    ? [V, (v: V) => void]
    : S extends IReadonlyState<infer V>
      ? [V]
      : never;
```

### useT

获取国际化翻译文本，当语言切换时自动触发重渲染。

```typescript
function useT(key: string): string;
```

**参数：**

- `key` — 翻译 key，对应 `resources/lang/{locale}.json` 中的键

**返回值：** 当前语言下的翻译文本。如果 key 不存在，回退链为：当前语言 -> `en-US` -> key 本身。

**用法：**

```tsx
import { useT } from '@autumnbox/sdk/app';

const MyComponent: React.FC = () => {
  const title = useT('app.name.my_tool');
  const noDevice = useT('my_tool.no_device');

  return (
    <div>
      <h1>{title}</h1>
      <p>{noDevice}</p>
    </div>
  );
};
```

### useRequiredDevice

获取一个保证非 null 的 `AdbDeviceHandle`。适用于设置了 `shallSelectAdbDevice: true` 的 App。

```typescript
function useRequiredDevice(): AdbDeviceHandle;
```

**返回值：** 当前选中的 `AdbDeviceHandle`

**异常：** 如果没有可用设备，抛出异常（会被插件 ErrorBoundary 捕获并展示友好的错误提示）。

**用法：**

```tsx
import { useRequiredDevice } from '@autumnbox/sdk/app';
import { useService } from '@autumnbox/sdk/app';
import { ShellService } from '@autumnbox/sdk/core';

const MyDeviceApp: React.FC = () => {
  const device = useRequiredDevice();
  const shell = useService(ShellService);
  const [info, setInfo] = useState('');

  useEffect(() => {
    shell.exec(device, 'getprop ro.product.model').then(setInfo).catch(console.error);
  }, [device, shell]);

  return <div>设备型号: {info}</div>;
};

export const MyDeviceApp_: AutumnApp = {
  id: 'my-device-app',
  name: 'app.name.my_device',
  icon: myIcon,
  shallSelectAdbDevice: true,  // 保证 useRequiredDevice() 不会抛出
  component: MyDeviceApp,
};
```

### useShell

返回一个增强的 Shell 辅助对象，相比直接使用 `ShellService.exec()`，它能保留 exit code 信息。

```typescript
interface ShellResult {
  /** 命令的标准输出 */
  stdout: string;
  /** 进程退出码。null 表示进程被信号终止 */
  exitCode: number | null;
}

interface ShellHelper {
  /** 执行命令，返回 stdout + exitCode */
  exec(device: AdbDeviceHandle, command: string | string[]): Promise<ShellResult>;
  /** 执行命令。如果 exitCode 非零则抛出异常 */
  execOrThrow(device: AdbDeviceHandle, command: string | string[]): Promise<string>;
}

function useShell(): ShellHelper;
```

内部通过 `ShellService.spawn()` + 流式读取实现，而非 `ShellService.exec()`（后者不保留 exit code）。

**用法：**

```tsx
import { useShell, useRequiredDevice } from '@autumnbox/sdk/app';

const MyComponent: React.FC = () => {
  const shell = useShell();
  const device = useRequiredDevice();
  const [result, setResult] = useState<string>('');

  const runCheck = async () => {
    // exec：不论命令成功与否都不抛异常
    const res = await shell.exec(device, 'ls /sdcard/Download');
    if (res.exitCode === 0) {
      setResult(res.stdout);
    } else {
      setResult(`命令失败，退出码: ${res.exitCode}`);
    }
  };

  const runStrict = async () => {
    try {
      // execOrThrow：退出码非零时自动抛异常
      const output = await shell.execOrThrow(device, 'cat /system/build.prop');
      setResult(output);
    } catch (err) {
      setResult(`错误: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div>
      <button onClick={() => void runCheck()}>列出文件</button>
      <button onClick={() => void runStrict()}>读取 build.prop</button>
      <pre>{result}</pre>
    </div>
  );
};
```

### usePluginHome

返回当前插件的专属数据目录路径。

```typescript
function usePluginHome(): string;
```

**返回值：** 路径字符串，格式为 `{autumnHome}/plugins/data/{pluginId}/`

**用法：**

```tsx
const home = usePluginHome();
// 例如: "/autumnbox/plugins/data/my-plugin/"
```

### usePluginFs

返回宿主的文件系统接口 `IFileSystem`，用于在插件数据目录中读写文件。

```typescript
function usePluginFs(): IFileSystem;
```

`IFileSystem` 接口：

```typescript
interface IFileSystem {
  readonly description: string;
  autumnHome(): string;
  readFile(path: string): Promise<ReadableStream<Uint8Array>>;
  writeFile(path: string, data: Blob): Promise<void>;
  stat(path: string): Promise<IFileStat>;
  remove(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  readdir(path: string): Promise<string[]>;
  resolve(...segments: string[]): string;
  tmpdir(): string;
}
```

**用法：**

```tsx
import { usePluginHome, usePluginFs } from '@autumnbox/sdk/app';

const MyComponent: React.FC = () => {
  const home = usePluginHome();
  const fs = usePluginFs();

  const saveData = async () => {
    const filePath = fs.resolve(home, 'config.json');
    const data = JSON.stringify({ theme: 'dark' });
    await fs.writeFile(filePath, new Blob([data]));
  };

  const loadData = async () => {
    const filePath = fs.resolve(home, 'config.json');
    if (await fs.exists(filePath)) {
      const stream = await fs.readFile(filePath);
      const text = await new Response(stream).text();
      return JSON.parse(text) as unknown;
    }
    return null;
  };

  // ...
};
```

### usePluginResource

异步加载插件 `.atmb` 包中 `resources/` 目录下的资源文件。

```typescript
function usePluginResource(name: string): {
  data: Blob | null;
  loading: boolean;
  error: Error | null;
};
```

**参数：**

- `name` — 相对于 `resources/` 目录的路径，如 `'images/logo.png'`

**返回值：**

- `data` — 加载完成后的 Blob 对象，未加载完或不存在时为 `null`
- `loading` — 是否正在加载
- `error` — 加载过程中的错误

**用法：**

```tsx
import { usePluginResource } from '@autumnbox/sdk/app';

const MyComponent: React.FC = () => {
  const { data, loading, error } = usePluginResource('templates/default.html');

  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error.message} />;
  if (!data) return <div>资源不存在</div>;

  // 使用 data (Blob)
  // ...
};
```

::: tip
`resources/lang/*.json` 文件由系统自动加载，无需手动使用 `usePluginResource` 加载语言文件。
:::

### useCurrentPluginContext

获取当前 App 所属插件的 `PluginContext` 对象。

```typescript
function useCurrentPluginContext(): PluginContext;
```

**返回值：** 当前插件的 `PluginContext` 实例

**异常：** 在非插件 App 组件中调用会抛出异常

**用法：**

```tsx
import { useCurrentPluginContext } from '@autumnbox/sdk/app';

const MyComponent: React.FC = () => {
  const ctx = useCurrentPluginContext();

  console.log('Plugin ID:', ctx.pluginId);
  console.log('Plugin Home:', ctx.pluginHome);

  // 直接调用 context 上的便捷方法
  const translation = ctx.t('some.key');

  // 通过 serviceContainer 访问更底层的服务
  const appService = ctx.serviceContainer.getService(AppService);
};
```

### useTabName

读取和设置当前标签页的标题。

```typescript
function useTabName(): [string, (name: string) => void];
```

**返回值：** `[当前标题, 设置标题函数]`，类似 `useState` 的解构模式

**异常：** 在标签页上下文之外调用会抛出异常

**用法：**

```tsx
import { useTabName } from '@autumnbox/sdk/app';

const MyComponent: React.FC<AppProps> = ({ targetDevice }) => {
  const [tabName, setTabName] = useTabName();

  useEffect(() => {
    if (targetDevice) {
      setTabName(`设备详情 - ${targetDevice.sn}`);
    }
  }, [targetDevice, setTabName]);

  return <div>当前标签: {tabName}</div>;
};
```

### useTabCloser

获取一个关闭当前标签页的回调函数。

```typescript
function useTabCloser(): () => void;
```

**返回值：** 关闭当前标签页的函数

**异常：** 在标签页上下文之外调用会抛出异常

**用法：**

```tsx
import { useTabCloser } from '@autumnbox/sdk/app';

const MyComponent: React.FC = () => {
  const closeTab = useTabCloser();

  const handleDone = () => {
    // 任务完成后自动关闭标签页
    closeTab();
  };

  return <Button onClick={handleDone}>完成并关闭</Button>;
};
```

### useNavigation

获取应用内 URI 导航能力，通过 `autumnbox://` 协议打开 App。

```typescript
function useNavigation(): { open: (uri: string) => void };
```

URI 格式为 `autumnbox://{appId}/{path}?{params}`。如果目标 App 是 singleton 且已打开，会切换到已有标签页并触发导航事件。

**用法：**

```tsx
import { useNavigation } from '@autumnbox/sdk/app';

const MyComponent: React.FC = () => {
  const nav = useNavigation();

  const openDeviceDetail = (sn: string) => {
    nav.open(`autumnbox://device-detail/detail?sn=${sn}`);
  };

  return (
    <Button onClick={() => openDeviceDetail('abc123')}>
      查看设备详情
    </Button>
  );
};
```

### useNavigationEvent

监听当一个已打开的 singleton App 收到新的导航请求时触发的事件。适用于 singleton App 需要响应路由变化的场景。

```typescript
interface NavigationRequest {
  appId: string;
  path: string;
  params: Record<string, string>;
}

function useNavigationEvent(callback: (req: NavigationRequest) => void): void;
```

**参数：**

- `callback` — 收到导航请求时的回调。在 singleton App 已打开且再次被导航时触发

**用法：**

```tsx
import { useNavigationEvent } from '@autumnbox/sdk/app';
import { useCallback } from 'react';

const DeviceDetailView: React.FC<AppProps> = ({ route }) => {
  const [selectedSn, setSelectedSn] = useState(route?.params.sn ?? null);

  // 当已打开的标签页收到新导航，更新选中的设备
  const handleNav = useCallback((req: NavigationRequest) => {
    if (req.params.sn) {
      setSelectedSn(req.params.sn);
    }
  }, []);
  useNavigationEvent(handleNav);

  // ...
};

export const DeviceDetailApp: AutumnApp = {
  id: 'device-detail',
  name: 'app.name.device_detail',
  icon: deviceDetailIcon,
  singleton: true,   // 必须是 singleton 才能收到导航事件
  component: DeviceDetailView,
};
```

### useRequestDevice

获取请求用户选择/授权设备的回调。在 WebUSB 环境中触发浏览器设备选择对话框。

```typescript
type RequestDeviceFn = () => Promise<void>;

function useRequestDevice(): RequestDeviceFn | null;
```

**返回值：** 请求设备的异步函数，如果当前环境不支持（如原生桌面端），则返回 `null`

**用法：**

```tsx
import { useRequestDevice } from '@autumnbox/sdk/app';

const MyComponent: React.FC = () => {
  const requestDevice = useRequestDevice();

  return (
    <Button
      disabled={!requestDevice}
      onClick={() => void requestDevice?.()}
    >
      连接新设备
    </Button>
  );
};
```

### useConnectWiFi

获取通过 WiFi ADB 连接设备的回调。仅在原生桌面端（Tauri）可用。

```typescript
type ConnectWiFiFn = (address: string) => Promise<string>;

function useConnectWiFi(): ConnectWiFiFn | null;
```

**返回值：** 连接函数或 `null`（浏览器环境中不可用）

**用法：**

```tsx
import { useConnectWiFi } from '@autumnbox/sdk/app';

const WiFiConnector: React.FC = () => {
  const connectWiFi = useConnectWiFi();
  const [address, setAddress] = useState('192.168.1.100:5555');

  if (!connectWiFi) return <div>当前环境不支持 WiFi 连接</div>;

  return (
    <Space>
      <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      <Button onClick={() => void connectWiFi(address)}>连接</Button>
    </Space>
  );
};
```

### useLoadPlugin

获取运行时加载插件的回调。

```typescript
type LoadPluginFn = (file: File) => Promise<void>;

function useLoadPlugin(): LoadPluginFn | null;
```

**返回值：** 加载函数或 `null`（当插件加载功能不可用时）

**用法：**

```tsx
import { useLoadPlugin } from '@autumnbox/sdk/app';

const PluginLoader: React.FC = () => {
  const loadPlugin = useLoadPlugin();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && loadPlugin) {
      await loadPlugin(file);
    }
  };

  return <input type="file" accept=".atmb" onChange={(e) => void handleFileChange(e)} />;
};
```

## 图标处理

### PNG 导入

推荐使用 PNG 文件。将图标放在 `src/assets/` 目录下，通过 import 引入。Vite 构建时会根据 `assetsInlineLimit: 100000`（约 100KB）配置，将小于此阈值的文件自动内联为 Base64 data URI：

```tsx
import myIcon from '../assets/my_icon.png';
// myIcon 的值类似：'data:image/png;base64,iVBORw0KGgo...'

export const MyApp: AutumnApp = {
  id: 'my-app',
  name: 'app.name.my',
  icon: myIcon,  // data URI 字符串
  component: MyAppView,
};
```

### 内联 SVG data URI

对于矢量图标，可以直接构造 SVG data URI：

```typescript
const icon = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>`
)}`;
```

### iconFit 模式

默认情况下，图标以 contain 模式渲染在圆角矩形内，留有内边距。当 `iconFit: true` 时，图标以 cover 模式填满整个区域：

```typescript
export const MyApp: AutumnApp = {
  id: 'my-app',
  name: 'app.name.my',
  icon: myIcon,
  iconFit: true,   // 图标填满圆角矩形
  component: MyAppView,
};
```

适用于图标本身已经包含圆角和背景的场景，避免双重圆角的视觉问题。

## 国际化 (i18n)

### 语言文件结构

在插件根目录下的 `resources/lang/` 放置 JSON 文件，文件名为 BCP 47 语言代码：

```
my-plugin/
└── resources/
    └── lang/
        ├── en-US.json
        ├── zh-CN.json
        ├── ja-JP.json
        └── ...
```

每个文件是一个扁平的 key-value 映射：

```json
{
  "<name>": "我的插件",
  "<description>": "一个示例插件",
  "<author>": "AutumnBox 贡献者",
  "app.name.dpi_editor": "DPI 编辑器",
  "dpi_editor.no_device": "未连接设备",
  "dpi_editor.apply": "应用",
  "dpi_editor.reset": "重置"
}
```

### 特殊元数据 key

以下三个特殊 key 用于插件自身的元数据展示，在插件管理界面中使用：

| Key | 说明 | 回退值 |
|-----|------|--------|
| `<name>` | 插件显示名称 | `package.json` 的 `name` 字段 |
| `<description>` | 插件描述 | `package.json` 的 `description` 字段 |
| `<author>` | 作者 | `package.json` 的 `author` 字段 |

### 在组件中使用 useT

```tsx
const MyComponent: React.FC = () => {
  const title = useT('app.name.dpi_editor');
  // 当语言从 en-US 切换到 zh-CN 时，title 自动更新为 "DPI 编辑器"
  return <h1>{title}</h1>;
};
```

### name 字段作为 i18n key

App 定义中的 `name` 字段本身就是 i18n key。系统在应用列表中显示 App 名称时，会通过 `LanguageService.getT(name)` 解析为当前语言的文本：

```typescript
export const DpiEditorApp: AutumnApp = {
  id: 'dpi-editor',
  name: 'app.name.dpi_editor',  // 这是 i18n key，不是直接显示的文字
  // ...
};
```

### 构建时 key 校验

`autumnbox-sdk build` 在构建时会校验 i18n key 的一致性：

1. 检查每个发现的 App/Card 导出名是否在至少一个语言文件中存在
2. 检查不同语言文件之间的 key 一致性（如果 `en-US.json` 有某个 key 但 `zh-CN.json` 缺失，会输出警告）

```
[i18n] Key "DpiEditorApp" not found in any language file.
[i18n] Key "app.settings.title" present in en-US.json but missing in zh-CN.json.
```

## 一个文件导出多个 App

一个源文件可以导出多个 App 定义，构建扫描器会识别所有以 `App` 结尾的 `export const`：

```tsx
// src/apps/NetworkTools.tsx

const PingAppView: React.FC = () => <div>Ping Tool</div>;
const TracerouteAppView: React.FC = () => <div>Traceroute Tool</div>;

export const PingApp: AutumnApp = {
  id: 'ping',
  name: 'app.name.ping',
  icon: pingIcon,
  component: PingAppView,
};

export const TracerouteApp: AutumnApp = {
  id: 'traceroute',
  name: 'app.name.traceroute',
  icon: tracerouteIcon,
  component: TracerouteAppView,
};
```

两个 App 都会被自动发现并注册。

## 命名约定

| 规则 | 说明 | 示例 |
|------|------|------|
| **文件位置** | `src/apps/` 目录下，支持单文件和子目录两种形式 | `src/apps/HelloApp.tsx` 或 `src/apps/HelloApp/index.tsx` |
| **导出名** | 必须以 `App` 结尾 | `export const HelloApp` |
| **React 组件名** | **不能**以 `App` 结尾，否则会被扫描器误识别为 App 定义 | 用 `HelloAppView`、`HelloAppComponent` 等 |
| **id** | 推荐 kebab-case | `'hello'`、`'file-manager'`、`'dpi-editor'` |
| **name** | 推荐使用 i18n key 格式 | `'app.name.hello'`、`'app.name.file_manager'` |

构建扫描器使用的正则表达式：

```
/export\s+const\s+(\w+App)\b/g
```

这意味着：

- `export const HelloApp` — 被发现
- `export const myHelperApp` — 被发现（只要以 `App` 结尾）
- `const HelloApp` — **不会**被发现（缺少 `export`）
- `export default HelloApp` — **不会**被发现（不是 named export）
- `export const HelloAppView` — **不会**被发现（以 `View` 结尾，不匹配 `\b` 在 `App` 后）

::: warning
正则 `\w+App\b` 要求 `App` 后面是单词边界。`HelloApp` 匹配因为之后是空格/分号，而 `HelloAppView` 不匹配因为 `App` 后面紧跟 `V`。这就是组件名不能以 `App` 结尾的原因。
:::

实际上更准确地说：`export const HelloAppView` 中 `HelloAppView` 以 `App` 为子串但不以 `App` 结尾，所以正则组 `(\w+App)` 在贪婪匹配下会匹配到 `HelloAppView`，但尾部的 `\b` 确保匹配结果是完整单词。需要注意的是，如果导出名为 `export const HelloAppV`，正则仍然不会匹配 `HelloApp` 因为贪婪模式会尝试匹配最长的 `\w+App`。总之，遵循规范即可：**App 定义以 `App` 结尾，React 组件不以 `App` 结尾。**

## 自动发现机制

### 构建扫描器工作原理

`autumnbox-sdk build` 执行以下步骤：

1. **扫描目录**：检查 `src/apps/`、`src/cards/`、`src/services/` 是否存在
2. **发现导出**：对每个目录，遍历文件和一级子目录（`{Name}/index.tsx`），用正则从源文件中提取匹配的 named export
3. **校验 i18n**：检查 `resources/lang/*.json` 中的 key 一致性
4. **生成入口**：将所有发现的实体写入 `src/__entry__.ts`
5. **Vite 构建**：以生成的入口文件为起点，执行 UMD 构建
6. **打包**：输出 `dist/index.js` + `dist/package.json`（含 autumnbox metadata），然后打包为 `.atmb`

支持的文件扩展名：`.tsx`、`.ts`（按优先级探测）。

### 生成的 src/\_\_entry\_\_.ts 示例

```typescript
// 此文件由 autumnbox-sdk build 自动生成，请勿手动修改。
// 一切修改将在下次构建时被覆盖。

import type { PluginContext } from '@autumnbox/sdk';

import { MyService } from './services/MyService';
import { HelloApp, GoodbyeApp } from './apps/HelloApp';
import { StatusCard } from './cards/StatusCard';
import { main } from './main';

/**
 * 此函数由 autumnbox-sdk build 自动生成，请勿手动修改。
 * 任何手动修改都会在下次构建时被覆盖。
 */
export function __autumnbox_entry__(context: PluginContext): () => void {
  const disposers: Array<() => void> = [];

  // Services
  context.serviceContainer.registerService(MyService);

  // Apps
  disposers.push(context.registerApp(HelloApp, GoodbyeApp));

  // Cards
  disposers.push(context.registerCard(StatusCard));

  // Plugin initialization
  const mainDispose = main(context);
  if (mainDispose) disposers.push(mainDispose);

  return () => {
    for (const dispose of disposers) dispose();
  };
}
```

### \_\_autumnbox\_entry\_\_ 函数

这是生成的标准入口函数签名：

```typescript
function __autumnbox_entry__(context: PluginContext): () => void;
```

宿主的 `PluginService` 在加载 `.atmb` 后，会检查 UMD 模块的 exports 中是否存在 `__autumnbox_entry__`。如果存在，优先调用它（约定模式）；否则回退到寻找 `main` / `pluginMain` / `default` 导出（传统模式）。

## 生命周期

### 注册

1. **构建时**：`autumnbox-sdk build` 扫描 `src/apps/` 目录，发现所有 App 定义，生成 `__entry__.ts` 中的注册代码
2. **运行时加载**：宿主通过 `PluginService.loadPlugin()` 加载 `.atmb` 文件
3. **语言加载**：系统自动从 `.atmb` 中的 `resources/lang/*.json` 加载翻译文本
4. **入口执行**：调用 `__autumnbox_entry__(context)`，其中 `context.registerApp(...)` 将 App 注册到 `AppService`
5. **UI 更新**：`AppService.apps` 响应式状态更新，应用列表自动渲染新 App

`context.registerApp()` 返回一个取消注册函数：

```typescript
registerApp(...apps: AutumnApp[]): () => void;
```

### 销毁

当插件被卸载时，销毁过程如下：

1. **dispose 调用**：宿主调用 `__autumnbox_entry__` 返回的 dispose 函数
2. **App 注销**：dispose 函数内部调用之前 `registerApp` 返回的取消注册函数
3. **来源清理**：`AppService.unregisterBySource(pluginId)` 移除该插件注册的所有 App
4. **翻译卸载**：`LanguageService.unload(pluginId)` 移除该插件加载的翻译文本
5. **资源释放**：插件的资源 Blob、Context 等引用被清除

此外，宿主在 `window.beforeunload` 事件中会尽力调用所有插件的 dispose 函数（best-effort，无保证）。

### main.ts 的角色

如果 `src/main.ts` 存在且导出了 `main` 函数，它会在自动注册代码之后被调用：

```typescript
// src/main.ts
import type { PluginContext } from '@autumnbox/sdk';

export function main(context: PluginContext): (() => void) | void {
  // 额外的初始化逻辑
  // 例如：注册全局事件监听、启动后台任务等

  return () => {
    // 可选的清理逻辑
  };
}
```

`main` 函数的返回值（如果有）会被纳入 dispose 链中，在插件卸载时一并调用。

## PluginContext 参考

`PluginContext` 是传递给插件入口函数的上下文对象，提供插件运行所需的全部能力。在自动发现模式下，由生成的 `__entry__` 函数接收并使用。

```typescript
interface PluginContext {
  /** 插件唯一标识符（来自 package.json "name"） */
  pluginId: string;

  /** 插件专属数据目录路径，如 {autumnHome}/plugins/data/{pluginId}/ */
  pluginHome: string;

  /** 宿主文件系统实例，用于读写插件数据 */
  fs: IFileSystem;

  /**
   * 获取插件 .atmb 包中 resources/ 目录下的资源。
   * 不存在时返回 null。
   */
  getResource(name: string): Promise<Blob | null>;

  // ── 便捷方法 ──

  /**
   * 注册一个或多个 App。source 自动填入 pluginId。
   * @returns 取消注册函数
   */
  registerApp(...apps: AutumnApp[]): () => void;

  /**
   * 注册一个或多个 Card。source 自动填入 pluginId。
   * @returns 取消注册函数
   */
  registerCard(...cards: AutumnCard[]): () => void;

  /**
   * 获取翻译 key 的响应式状态。
   * 快捷方式等价于 LanguageService.getT(key)
   */
  t(key: string): IReadonlyState<string>;

  /**
   * 从 IoC 容器中获取服务。
   * 快捷方式等价于 serviceContainer.getService(token)
   */
  getService<T>(token: ServiceClass<T>): T;

  // ── 底层访问 ──

  /** IoC 服务容器。便捷方法无法满足需求时的逃生舱口 */
  serviceContainer: ServiceContainer;
}
```

在 React 组件中，可以通过 `useCurrentPluginContext()` hook 获取当前 App 所属插件的 `PluginContext`。

## defineApp 辅助函数

SDK 还导出了 `defineApp` 辅助函数，提供更好的类型推断和默认值填充：

```typescript
function defineApp(options: AutumnApp): AutumnApp & { __type: 'app' };
```

```tsx
import { defineApp } from '@autumnbox/sdk';

export const HelloApp = defineApp({
  id: 'hello',
  name: 'app.name.hello',
  icon: helloIcon,
  component: HelloAppView,
});
// HelloApp.singleton 自动设为 false
// HelloApp.__type === 'app'（标记字段）
```

`defineApp` 在语义上等价于直接定义 `AutumnApp` 对象，但会自动填充 `singleton` 的默认值并添加类型标记。使用哪种方式都可以。

## 共享模块

插件的 UMD 构建会将以下模块标记为 external，由宿主在运行时提供，不打包到插件 bundle 中：

| 模块 | UMD 全局变量 |
|------|-------------|
| `react` | `React` |
| `react-dom` | `ReactDOM` |
| `react/jsx-runtime` | `ReactJSXRuntime` |
| `@autumnbox/app` | `AutumnboxApp` |
| `@autumnbox/interfaces` | `AutumnboxInterfaces` |
| `@autumnbox/core` | `AutumnboxCore` |
| `@autumnbox/common` | `AutumnboxCommon` |
| `antd` | `Antd` |
| `@ant-design/icons` | `AntDesignIcons` |
| `@xterm/xterm` | `XtermXterm` |
| `@xterm/addon-fit` | `XtermAddonFit` |

在插件代码中，通过 SDK 子路径导入会被构建工具自动重写：

| 插件中的导入 | 实际映射到 |
|-------------|----------|
| `@autumnbox/sdk` | `@autumnbox/app` |
| `@autumnbox/sdk/app` (或 `hooks`) | `@autumnbox/app` |
| `@autumnbox/sdk/core` (或 `services`) | `@autumnbox/core` |
| `@autumnbox/sdk/types` | `@autumnbox/interfaces` |
