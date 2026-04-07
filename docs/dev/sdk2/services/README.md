---
title: Service
---

# Service 系统

## 1. 概念

Service 是 AutumnBox 插件体系中的核心抽象。它是一个注册在 **IoC（控制反转）容器** 中的类，任何插件或宿主代码都可以通过容器获取其实例。

### IoC 容器模式

AutumnBox 采用经典的 IoC 容器模式管理 Service 的生命周期与依赖关系。其核心思想是：

- **Service 不主动创建自己的依赖**。它在构造函数中接收 `ServiceContainer`，从中获取所需的其他 Service。
- **容器负责实例化与缓存**。调用者只声明"我需要什么"，而不关心"如何创建"。
- **懒实例化**。Service 不在注册时创建，而是在第一次 `getService()` 调用时才被实例化。
- **默认单例**。同一个 Service 类在容器中只有一个实例，所有调用方共享同一对象。

```
┌─────────────────────────────────────────┐
│            ServiceContainer             │
│                                         │
│  ┌─ DevicesService (lazy singleton) ──┐ │
│  │                                    │ │
│  │  constructor(container) {          │ │
│  │    this.driver = container         │ │
│  │      .getService(DriverService)    │ │
│  │      .getAdbDriver();             │ │
│  │  }                                 │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌─ ShellService (lazy singleton) ────┐ │
│  │  ...                               │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌─ 插件注册的自定义 Service ─────────┐ │
│  │  ...                               │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 2. 创建一个 Service

### 约定

1. 将文件放在 `src/services/` 目录下。
2. 导出的类名必须以 `Service` 结尾。
3. 构造函数必须接收 `ServiceContainer` 作为唯一参数。

### 目录结构

```
my-plugin/
├── src/
│   ├── services/
│   │   ├── ScrcpyBridgeService.ts        # 文件形式
│   │   └── DeviceMonitorService/
│   │       └── index.ts                  # 目录形式（也受支持）
│   ├── apps/
│   │   └── RemoteControlApp.tsx
│   └── main.ts
├── manifest.json
└── package.json
```

### 完整示例

```typescript
// src/services/ScrcpyBridgeService.ts
import type { ServiceContainer } from '@autumnbox/common';
import type { AdbDeviceHandle } from '@autumnbox/interfaces';

import { ShellService } from '@autumnbox/core';

export class ScrcpyBridgeService {
  private readonly shell: ShellService;

  constructor(container: ServiceContainer) {
    this.shell = container.getService(ShellService);
  }

  /** 在目标设备上启动 scrcpy server。 */
  async startServer(device: AdbDeviceHandle, version: string): Promise<void> {
    await this.shell.exec(device, [
      'CLASSPATH=/data/local/tmp/scrcpy-server.jar',
      'app_process',
      '/',
      'com.genymobile.scrcpy.Server',
      version,
    ]);
  }

  /** 检查 scrcpy server 是否已部署到设备。 */
  async isServerDeployed(device: AdbDeviceHandle): Promise<boolean> {
    const output = await this.shell.exec(device, 'ls /data/local/tmp/scrcpy-server.jar');
    return !output.includes('No such file');
  }
}
```

构建时 SDK 自动发现这个类并生成注册代码，无需手动注册。

## 3. ServiceContainer 完整 API

`ServiceContainer` 是 IoC 容器的实现，位于 `@autumnbox/common` 包中。

### ServiceClass 类型

```typescript
type ServiceClass<T = unknown> = new (container: ServiceContainer) => T;
```

任何构造函数签名为 `(container: ServiceContainer) => T` 的类都满足此约束。容器在实例化时会将自身作为参数传入。

### ServiceFeats 接口

```typescript
interface ServiceFeats {
  /** 覆盖自动派生的名称。 */
  name?: string;
  /** 是否强制单例注册，默认 true。 */
  singleton?: boolean;
}
```

### registerService

```typescript
registerService<T>(Clazz: ServiceClass<T>, feats?: ServiceFeats): void;
```

将一个 Service 类注册到容器中。

**行为细节：**

- **名称派生**：若未指定 `feats.name`，则从 `Clazz.name` 自动派生（详见第 4 节）。
- **默认单例**：`feats.singleton` 默认为 `true`。
- **双重注册**：一次 `registerService` 同时在类 token 和字符串名称两个维度注册，两种方式都能检索到同一个实例。
- **单例冲突检查**：当 `singleton = true` 时，若该名称下已存在注册，则抛出异常。

```typescript
container.registerService(ScrcpyBridgeService);
// 等价于：
// container.registerService(ScrcpyBridgeService, { singleton: true });
// 名称自动派生为 'scrcpyBridge'

// 指定自定义名称和非单例模式
container.registerService(MyWorker, { name: 'worker', singleton: false });
```

**异常：**

```
Singleton service "scrcpyBridge" conflicts with an existing registration
Cannot register service "worker": it is already registered as a singleton
```

### registerInstance

```typescript
registerInstance(name: string, instance: unknown): void;
```

注册一个预先创建的对象实例。适用于不通过类构造函数创建的外部对象，如驱动实例、文件系统等。

```typescript
// 宿主在启动时注册 ADB 驱动
container.registerInstance('adb', webAdbDriver);
container.registerInstance('fs', fileSystemImpl);
```

**注意：** `registerInstance` 只通过字符串名称注册，不关联类 token。若该名称已被单例占据，同样会抛出异常。

### getService（两个重载）

```typescript
// 重载 1：按类 token 获取（类型安全）
getService<T>(token: ServiceClass<T>): T;

// 重载 2：按字符串名称获取
getService(name: string): unknown;
```

**按类 token 获取** 是推荐方式，返回值具有完整的 TypeScript 类型推导：

```typescript
const shell = container.getService(ShellService);
// shell 的类型是 ShellService — 完全类型安全

const devices = container.getService(DevicesService);
// devices 的类型是 DevicesService
```

**按字符串名称获取** 返回 `unknown`，需要自行断言类型：

```typescript
const adb = container.getService('adb') as IAdbDriver;
const fs = container.getService('fs') as IFileSystem;
```

**异常：** 若未注册对应的 Service，则抛出 `Error`：

```
Service "xxx" is not registered
Service class "XxxService" is not registered
```

### getServices

```typescript
getServices(name: string): unknown[];
```

获取某个名称下注册的**所有** Service 实例（数组）。当同一名称下以 `singleton: false` 注册了多个 Service 时，此方法返回全部实例。

```typescript
// 假设多个插件都注册了 name='themeProvider' 的非单例服务
const providers = container.getServices('themeProvider');
for (const provider of providers) {
  (provider as IThemeProvider).apply();
}
```

**异常：** 若该名称下没有任何注册，则抛出 `Error`。

## 4. 名称派生规则（deriveServiceName）

当 `registerService` 未指定 `feats.name` 时，容器从类名自动派生注册名称。

### 算法

```
1. 若类名以 "Service" 结尾 → 去掉 "Service" 后缀 → 首字母小写
2. 否则 → 直接首字母小写
3. 若去掉后缀后为空字符串 → 返回原类名全小写
```

### 源码实现

```typescript
function deriveServiceName(className: string): string {
  const stripped = className.endsWith('Service')
    ? className.slice(0, -'Service'.length)
    : className;
  if (stripped.length === 0) return className.toLowerCase();
  return stripped[0]!.toLowerCase() + stripped.slice(1);
}
```

### 完整示例表

| 类名 | 去掉 Service | 首字母小写 | 最终 token |
|------|-------------|-----------|-----------|
| `AbcService` | `Abc` | `abc` | `'abc'` |
| `DeviceMonitorService` | `DeviceMonitor` | `deviceMonitor` | `'deviceMonitor'` |
| `ScrcpyBridgeService` | `ScrcpyBridge` | `scrcpyBridge` | `'scrcpyBridge'` |
| `ShellService` | `Shell` | `shell` | `'shell'` |
| `NotificationService` | `Notification` | `notification` | `'notification'` |
| `LanguageService` | `Language` | `language` | `'language'` |
| `MyHelper`（不以 Service 结尾） | `MyHelper` | `myHelper` | `'myHelper'` |
| `Service`（边界情况） | 空串 | — | `'service'` |

## 5. 懒创建与单例行为

### 懒创建

Service 实例**不在注册时创建**，而是在第一次 `getService()` 调用时才被实例化。这意味着：

- 如果一个 Service 从未被任何代码请求，它永远不会被创建。
- 构造函数中的副作用（如订阅、定时器）只在实际使用时才触发。

```typescript
container.registerService(HeavyService);
// 此时 HeavyService 尚未被创建

const instance = container.getService(HeavyService);
// 第一次调用，触发 new HeavyService(container)
```

### 构造函数中的依赖注入

构造函数接收 `ServiceContainer` 参数，从中获取其他 Service。由于懒创建，被依赖的 Service 也会在此时按需创建，形成递归的依赖解析链。

```typescript
export class MyService {
  private readonly shell: ShellService;

  constructor(container: ServiceContainer) {
    // 若 ShellService 尚未实例化，此处触发其构造
    this.shell = container.getService(ShellService);
  }
}
```

### 单例模式（默认）

默认情况下，`singleton: true`。同一个 Service 类无论被 `getService()` 调用多少次，始终返回同一个实例：

```typescript
const a = container.getService(ShellService);
const b = container.getService(ShellService);
console.log(a === b); // true
```

### 非单例模式

将 `singleton` 设为 `false` 可允许同一名称下注册多个 Service（如多个插件各自注册一个同类型的 Service）：

```typescript
container.registerService(ThemeProviderA, { name: 'themeProvider', singleton: false });
container.registerService(ThemeProviderB, { name: 'themeProvider', singleton: false });

// 通过 getServices 获取全部
const providers = container.getServices('themeProvider');
// providers.length === 2
```

注意：非单例注册的 Service 仍然对每个类 token 实行懒创建和缓存——同一个 entry 不会被构造两次。

## 6. 宿主内置 Service

以下 Service 由 AutumnBox 宿主提供（位于 `@autumnbox/core` 包），插件可直接使用，无需注册。

### DevicesService

管理 Android 设备发现。通过轮询 `IAdbDriver.listDevices()` 获取设备列表，并以响应式 `IReadonlyState` 属性暴露结果。

**AutumnBox 不存在"全局选中设备"的概念**——每个 App 自行决定操作哪个设备。

```typescript
import type { IReadonlyState, ServiceContainer } from '@autumnbox/common';
import type { AdbDeviceHandle } from '@autumnbox/interfaces';

class DevicesService {
  /** 当前已连接的设备列表（响应式）。 */
  readonly devices: IReadonlyState<readonly AdbDeviceHandle[]>;

  constructor(container: ServiceContainer);

  /** 立即刷新一次设备列表。 */
  async refresh(): Promise<void>;

  /** 开始定期轮询设备列表。默认 2000ms 间隔。 */
  startPolling(intervalMs?: number): void;

  /** 停止轮询。 */
  stopPolling(): void;
}
```

**使用示例：**

```typescript
constructor(container: ServiceContainer) {
  const devicesService = container.getService(DevicesService);

  // 订阅设备列表变化
  devicesService.devices.subscribe((list) => {
    console.log('当前设备:', list.map(d => d.sn));
  });
}
```

### ShellService

在 Android 设备上执行 shell 命令。所有操作以 `AdbDeviceHandle` 为第一参数。

```typescript
class ShellService {
  constructor(container: ServiceContainer);

  /**
   * 在设备上启动一个 shell 进程。
   * 返回 IAdbShellProcess，支持流式读取 stdout/stderr、写入 stdin、PTY 等。
   */
  async spawn(
    device: AdbDeviceHandle,
    command: string | string[],
    options?: IAdbSpawnOptions,
  ): Promise<IAdbShellProcess>;

  /**
   * 在设备上执行命令，等待完成后返回 stdout 完整字符串。
   * 适用于短命令、不需要流式处理的场景。
   */
  async exec(
    device: AdbDeviceHandle,
    command: string | string[],
  ): Promise<string>;
}
```

**`IAdbSpawnOptions` 可选参数：**

```typescript
interface IAdbSpawnOptions {
  cwd?: string;                        // 工作目录
  env?: Record<string, string>;        // 环境变量
  signal?: AbortSignal;                // 取消信号
  stdin?: BinarySource | string;       // 预填充 stdin
  pty?: IAdbPtyOptions;                // 伪终端配置
  timeoutMs?: number;                  // 超时（毫秒）
  separateStderr?: boolean;            // 是否分离 stderr
}
```

**使用示例：**

```typescript
// 简单执行
const output = await shell.exec(device, 'getprop ro.build.version.release');
console.log('Android 版本:', output.trim());

// 流式处理（交互式命令）
const proc = await shell.spawn(device, 'logcat', {
  signal: AbortSignal.timeout(10000),
});
for await (const chunk of proc.stdout) {
  process.stdout.write(new TextDecoder().decode(chunk));
}
```

### DeviceFileSystemService

设备文件操作：推送、拉取、列目录。

```typescript
class DeviceFileSystemService {
  constructor(container: ServiceContainer);

  /** 将文件推送到设备指定目录。 */
  async push(
    device: AdbDeviceHandle,
    deviceDir: string,
    source: PushSource,
    signal?: AbortSignal,
  ): Promise<void>;

  /** 从设备拉取文件。 */
  async pull(
    device: AdbDeviceHandle,
    devicePath: string,
    dest: PullDest,
    signal?: AbortSignal,
  ): Promise<void>;

  /** 列出设备上远程目录的内容（自动过滤 `.` 和 `..`）。 */
  async listDir(
    device: AdbDeviceHandle,
    remotePath: string,
  ): Promise<readonly IAdbFileEntry[]>;
}
```

**相关类型：**

```typescript
// 推送源：本地路径字符串，或内存中的文件数据
type PushSource = string | IFileData;

interface IFileData {
  data: Blob | ArrayBuffer;
  name: string;
  size: number;
}

// 拉取目标：写入本地文件，或通过回调逐块读取
type PullDest = IPullToLocal | IPullToReader;

interface IPullToLocal {
  type: 'local';
  path: string;
}

interface IPullToReader {
  type: 'reader';
  chunkCallback: (chunk: Uint8Array) => Promise<void>;
}

// 文件条目
interface IAdbFileEntry {
  path: string;
  name: string;
  size: number;
  mode: number;
  isDirectory: boolean;
  modifiedAt?: Date;
}
```

**使用示例：**

```typescript
// 推送 APK 到设备
await fileService.push(device, '/data/local/tmp/', apkFileData);

// 列出目录
const entries = await fileService.listDir(device, '/sdcard/Download/');
for (const entry of entries) {
  console.log(`${entry.isDirectory ? '[DIR]' : '     '} ${entry.name}  ${entry.size} bytes`);
}

// 拉取文件到内存
const chunks: Uint8Array[] = [];
await fileService.pull(device, '/sdcard/log.txt', {
  type: 'reader',
  chunkCallback: async (chunk) => { chunks.push(chunk); },
});
```

### PackageService

Android 应用包管理：安装 APK、列出已安装包。

```typescript
class PackageService {
  constructor(container: ServiceContainer);

  /** 列出设备上已安装的所有包名。 */
  async listPackages(device: AdbDeviceHandle): Promise<string[]>;

  /**
   * 安装 APK 到设备。
   * 内部逻辑：先 push 到 /data/local/tmp/，再执行 pm install -r，最后清理临时文件。
   */
  async installApk(device: AdbDeviceHandle, source: PushSource): Promise<void>;
}
```

**使用示例：**

```typescript
// 列出已安装应用
const packages = await packageService.listPackages(device);
console.log('已安装:', packages.length, '个应用');

// 安装 APK
await packageService.installApk(device, {
  data: apkBlob,
  name: 'my-app.apk',
  size: apkBlob.size,
});
```

### RebootService

重启 Android 设备到不同目标模式。

```typescript
class RebootService {
  constructor(container: ServiceContainer);

  /** 重启设备。target 省略时为正常重启。 */
  async reboot(device: AdbDeviceHandle, target?: AdbRebootTarget): Promise<void>;
}
```

**`AdbRebootTarget` 取值：**

```typescript
type AdbRebootTarget =
  | 'system'                 // 正常重启（默认）
  | 'bootloader'             // 重启到 bootloader
  | 'recovery'               // 重启到 recovery
  | 'sideload'               // 重启到 sideload 模式
  | 'sideload-auto-reboot';  // sideload 完成后自动重启
```

**使用示例：**

```typescript
// 正常重启
await rebootService.reboot(device);

// 重启到 recovery
await rebootService.reboot(device, 'recovery');

// 重启到 bootloader（用于刷机）
await rebootService.reboot(device, 'bootloader');
```

### LocalFileSystemService

访问宿主文件系统（非设备文件系统）。通过字符串名称 `'fs'` 从容器获取 `IFileSystem` 实例。

```typescript
class LocalFileSystemService {
  constructor(container: ServiceContainer);

  /** 返回宿主环境的 IFileSystem 实现。 */
  getFileSystem(): IFileSystem;
}
```

**`IFileSystem` 接口：**

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

interface IFileStat {
  size: number;
  mode: number;
  isDirectory: boolean;
  modifiedAt: Date;
}
```

**使用示例：**

```typescript
const fsService = container.getService(LocalFileSystemService);
const fs = fsService.getFileSystem();

const home = fs.autumnHome();
const configPath = fs.resolve(home, 'config.json');

if (await fs.exists(configPath)) {
  const stream = await fs.readFile(configPath);
  // 读取 stream...
}
```

### NotificationService

系统通知管理。提供响应式的通知列表和未读数。

```typescript
interface INotification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

class NotificationService {
  /** 全部通知列表（响应式，最新在前）。 */
  readonly notifications: IReadonlyState<readonly INotification[]>;

  /** 未读通知数（响应式）。 */
  readonly unreadCount: IReadonlyState<number>;

  constructor(container: ServiceContainer);

  /** 推送一条新通知。 */
  push(type: INotification['type'], title: string, message: string): void;

  /** 将指定通知标记为已读。 */
  markRead(id: string): void;

  /** 将全部通知标记为已读。 */
  markAllRead(): void;

  /** 清空所有通知。 */
  clear(): void;
}
```

**使用示例：**

```typescript
const notif = container.getService(NotificationService);

// 推送通知
notif.push('success', '安装完成', 'my-app.apk 已成功安装到设备');
notif.push('error', '连接失败', '无法连接到设备 192.168.1.100:5555');

// 监听未读数变化
notif.unreadCount.subscribe((count) => {
  console.log('未读通知:', count);
});
```

### LanguageService

响应式国际化（i18n）服务。管理多语言文本，支持按 locale 切换，翻译结果通过 `IReadonlyState` 响应式更新 UI。

```typescript
class LanguageService {
  /** 当前活跃的 locale（BCP 47 代码，如 'zh-CN', 'en-US'）。 */
  readonly locale: IReadonlyState<string>;

  constructor(container: ServiceContainer);

  /**
   * 批量加载翻译文本。
   * @param id    - 来源标识（如插件 ID），用于后续 unload
   * @param locale - BCP 47 locale 代码
   * @param content - key → value 翻译映射
   */
  load(id: string, locale: string, content: Record<string, string>): void;

  /**
   * 卸载翻译。
   * - unload(id) — 移除该 id 的所有 locale 翻译
   * - unload(id, locale) — 仅移除该 id 在指定 locale 下的翻译
   */
  unload(id: string, locale?: string): void;

  /** 注册单条翻译。 */
  addText(key: string, locale: string, value: string): void;

  /** 移除单条翻译。 */
  removeText(key: string, locale: string): void;

  /** 切换活跃 locale，触发全局翻译刷新。 */
  switchLocale(locale: string): void;

  /**
   * 获取指定 key 的响应式翻译状态。
   * 返回的 IReadonlyState<string> 在 locale 切换或文本变化时自动更新。
   * 同一 key 返回同一对象（已缓存）。
   *
   * 回退链：当前 locale → 'en-US' → key 本身
   */
  getT(key: string): IReadonlyState<string>;
}
```

**使用示例：**

```typescript
const lang = container.getService(LanguageService);

// 加载插件翻译
lang.load('com.my-plugin', 'zh-CN', {
  'my-plugin.title': '我的插件',
  'my-plugin.description': '一个很酷的插件',
});
lang.load('com.my-plugin', 'en-US', {
  'my-plugin.title': 'My Plugin',
  'my-plugin.description': 'A cool plugin',
});

// 获取响应式翻译
const titleState = lang.getT('my-plugin.title');
console.log(titleState.value); // 取决于当前 locale

// locale 切换后自动更新
titleState.subscribe((text) => {
  console.log('标题变了:', text);
});
lang.switchLocale('en-US');
// 输出: "标题变了: My Plugin"
```

## 7. 响应式状态系统

AutumnBox 的 Service 层和 UI 层通过**响应式状态原语**通信，位于 `@autumnbox/common` 包中。

### 核心接口

```typescript
/** 只读响应式状态。消费者只能读取和订阅。 */
interface IReadonlyState<V> {
  readonly value: V;
  subscribe(listener: (value: V) => void): () => void;
}

/** 可变响应式状态。持有者可以读写。 */
interface IState<V> extends IReadonlyState<V> {
  value: V;  // 可写
}
```

### 工厂函数

```typescript
/**
 * 创建一个可变状态。
 * 适用于 Service 内部的私有状态管理。
 */
function createState<V>(initial: V): IState<V>;

/**
 * 创建一个只读状态，返回 [只读视图, setter 函数]。
 * Service 暴露 IReadonlyState 给外部，自己持有 setter。
 * 模式类似 React 的 useState 解构。
 */
function createReadonlyState<V>(initial: V): [IReadonlyState<V>, (value: V) => void];
```

### 在 Service 中使用

典型模式：Service 对外暴露 `IReadonlyState`（只读），内部保留 setter。

```typescript
import { createReadonlyState } from '@autumnbox/common';
import type { IReadonlyState, ServiceContainer } from '@autumnbox/common';

export class DownloadProgressService {
  /** 外部只能读和订阅。 */
  readonly progress: IReadonlyState<number>;

  /** 内部持有 setter。 */
  private readonly setProgress: (v: number) => void;

  constructor(_container: ServiceContainer) {
    const [progress, setProgress] = createReadonlyState<number>(0);
    this.progress = progress;
    this.setProgress = setProgress;
  }

  async download(url: string): Promise<void> {
    // 模拟下载过程中更新进度
    this.setProgress(0);
    // ... 下载逻辑 ...
    this.setProgress(50);
    // ... 继续 ...
    this.setProgress(100);
  }
}
```

### subscribe 返回值

`subscribe` 返回一个取消订阅函数。调用它可停止接收后续更新：

```typescript
const unsub = state.subscribe((value) => {
  console.log('新值:', value);
});

// 不再需要时取消订阅
unsub();
```

### 在 React 中使用（useServiceState）

UI 层通过 `useServiceState` hook 订阅状态变化，自动触发组件重渲染：

```tsx
import { useServiceState } from '@autumnbox/app';
import { DevicesService } from '@autumnbox/core';

const DeviceList: React.FC = () => {
  // 方式一：传入 Service 类 + 属性名
  const [devices] = useServiceState(DevicesService, 'devices');

  // 方式二：传入 IReadonlyState 对象
  const devicesService = useService(DevicesService);
  const [devices2] = useServiceState(devicesService.devices);

  return (
    <ul>
      {devices.map((d) => (
        <li key={d.sn}>{d.sn}</li>
      ))}
    </ul>
  );
};
```

**useServiceState 的完整重载签名：**

```typescript
// 直接传入 IState → 返回 [V, setter]
function useServiceState<V>(state: IState<V>): [V, (v: V) => void];

// 直接传入 IReadonlyState → 返回 [V]（无 setter）
function useServiceState<V>(state: IReadonlyState<V>): [V];

// 传入 Service 实例或类 + 属性名 → 自动推断返回类型
function useServiceState<T, K extends StateKeysOf<T>>(
  service: T | ServiceClass<T>,
  stateName: K,
): UseServiceStateReturn<T[K]>;
```

`useServiceState` 会自动检测状态是否可写（`IState` vs `IReadonlyState`），分别返回带或不带 setter 的元组。

## 8. Handle-first API 设计

AutumnBox 的所有设备操作 API 都采用 **Handle-first** 模式：第一个参数始终是 `AdbDeviceHandle`。

### AdbDeviceHandle 类型

```typescript
type AdbDeviceHandle = Readonly<{
  sn: string;  // 设备序列号（如 "emulator-5554", "192.168.1.100:5555"）
}>;
```

`AdbDeviceHandle` 是一个不可变的轻量对象，仅携带设备标识信息。它由 `DevicesService.devices` 提供，或通过 `useRequiredDevice()` hook 获取。

### 设计理念

- **没有"全局选中设备"**——每个 App 各自维护自己操作的目标设备。
- **多设备操作天然支持**——同一个 Service 实例可同时对不同设备执行命令。
- **Handle 不可变**——不会被意外修改，传递安全。

```typescript
// 同时操作两台设备
const [deviceA, deviceB] = devices;
const outputA = await shell.exec(deviceA, 'getprop ro.build.display.id');
const outputB = await shell.exec(deviceB, 'getprop ro.build.display.id');
```

### 在 App 中获取设备

若 App 定义中声明了 `shallSelectAdbDevice: true`，系统会在打开 App 前要求用户选择设备。在 App 组件内通过 `useRequiredDevice()` 获取：

```tsx
import { useRequiredDevice } from '@autumnbox/app';

const MyApp: React.FC = () => {
  const device = useRequiredDevice();
  // device 保证不为 null
  // ...
};
```

## 9. Service 间的依赖注入

Service 之间通过构造函数注入依赖。这是 AutumnBox IoC 的核心机制。

### 模式

```typescript
export class MyFeatureService {
  private readonly shell: ShellService;
  private readonly devices: DevicesService;
  private readonly notif: NotificationService;

  constructor(container: ServiceContainer) {
    // 从容器中获取所需的其他 Service
    this.shell = container.getService(ShellService);
    this.devices = container.getService(DevicesService);
    this.notif = container.getService(NotificationService);
  }

  async doSomething(device: AdbDeviceHandle): Promise<void> {
    const output = await this.shell.exec(device, 'id');
    this.notif.push('info', '命令结果', output.trim());
  }
}
```

### 依赖解析顺序

由于懒创建，依赖链会递归解析。例如：

```
MyFeatureService
  └─ getService(ShellService)
       └─ getService(DriverService)  ← 也是懒创建
            └─ getService('adb')     ← 返回预注册的驱动实例
```

所有这些步骤在 `new MyFeatureService(container)` 执行过程中同步完成。

### 循环依赖

容器**不检测循环依赖**。如果 A 的构造函数获取 B，B 的构造函数又获取 A，会导致无限递归栈溢出。设计 Service 时应避免循环引用。

## 10. 跨插件 Service 共享

AutumnBox 的 Service 系统对所有插件是**完全开放**的。

### 规则

- 一个插件注册的 Service 可以被任何其他已加载的插件获取。
- 不存在可见性限制或命名空间隔离。
- 所有插件共享同一个 `ServiceContainer` 实例。

### 名称冲突

由于默认单例，如果两个插件注册了相同派生名称的 Service，第二个注册会抛出异常：

```
Singleton service "scrcpyBridge" conflicts with an existing registration
```

**建议：** 为跨插件共享的 Service 使用带前缀的名称，如 `com.myplugin.ScrcpyBridgeService`，或在 `feats.name` 中指定唯一名称。

### 依赖其他插件的 Service

若插件 B 依赖插件 A 注册的 Service，需确保插件 A 先于 B 加载。目前，宿主按加载顺序初始化插件。

```typescript
// 插件 A 注册
export class ScrcpyBridgeService { /* ... */ }

// 插件 B 使用（假设 A 已加载）
import type { ServiceContainer } from '@autumnbox/common';

export class RemoteViewService {
  constructor(container: ServiceContainer) {
    // 因为不能直接 import 插件 A 的类，只能用字符串名称
    const bridge = container.getService('scrcpyBridge') as ScrcpyBridgeType;
  }
}
```

## 11. 在 React 组件中使用 Service

AutumnBox 通过 `@autumnbox/app` 包提供了一组 React hooks，简化 Service 在 UI 层的使用。

### useService

从 IoC 容器中获取 Service 单例：

```typescript
import { useService } from '@autumnbox/app';

function useService<T>(Clazz: ServiceClass<T>): T;
```

```tsx
import { useService } from '@autumnbox/app';
import { ShellService, DevicesService } from '@autumnbox/core';

const MyComponent: React.FC = () => {
  const shell = useService(ShellService);
  const devices = useService(DevicesService);
  // ...
};
```

### useServiceState

订阅 Service 上的响应式状态，状态变化时自动重渲染（详见第 7 节）。

### useT

国际化翻译 hook，内部使用 `LanguageService.getT()`：

```tsx
import { useT } from '@autumnbox/app';

const MyComponent: React.FC = () => {
  const title = useT('my-plugin.title');
  return <h1>{title}</h1>;
};
```

`useT` 在 locale 切换时自动重渲染。

### useShell

增强版 shell hook，返回带 `exitCode` 的结果：

```tsx
import { useShell } from '@autumnbox/app';

const MyComponent: React.FC = () => {
  const shell = useShell();

  const handleClick = async () => {
    const device = /* ... */;

    // exec: 返回 { stdout, exitCode }
    const result = await shell.exec(device, 'whoami');
    console.log(result.stdout, result.exitCode);

    // execOrThrow: exitCode 非零时抛异常
    const output = await shell.execOrThrow(device, 'ls /sdcard');
  };

  return <button onClick={handleClick}>执行</button>;
};
```

### 完整组件示例

```tsx
import { useEffect, useState } from 'react';
import { Button, List, Tag, Space } from 'antd';
import { useService, useServiceState, useRequiredDevice } from '@autumnbox/app';
import { PackageService, DevicesService, NotificationService } from '@autumnbox/core';

const PackageManagerApp: React.FC = () => {
  const device = useRequiredDevice();
  const packageService = useService(PackageService);
  const notif = useService(NotificationService);
  const [devices] = useServiceState(DevicesService, 'devices');
  const [packages, setPackages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const list = await packageService.listPackages(device);
      setPackages(list);
      notif.push('success', '加载完成', `找到 ${list.length} 个应用`);
    } catch (err) {
      notif.push('error', '加载失败', String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPackages();
  }, [device]);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Tag color="blue">设备: {device.sn}</Tag>
        <Tag>在线设备: {devices.length}</Tag>
        <Button onClick={loadPackages} loading={loading}>刷新</Button>
      </Space>
      <List
        dataSource={packages}
        renderItem={(pkg) => <List.Item>{pkg}</List.Item>}
      />
    </div>
  );
};
```

## 12. 自动发现机制

`autumnbox-sdk build` 在构建时自动扫描插件源码，发现 Service、App、Card 并生成注册代码。

### 扫描规则

SDK 扫描 `src/services/` 目录下的所有 `.ts` / `.tsx` 文件，使用以下正则匹配：

```javascript
const SERVICE_PATTERN = /export\s+class\s+(\w+Service)\b/;
```

只要文件中包含 `export class XxxService` 形式的导出，即被识别为 Service。

### 支持的文件模式

| 模式 | 路径示例 |
|------|---------|
| 文件形式 | `src/services/AbcService.ts` |
| 文件形式（TSX） | `src/services/AbcService.tsx` |
| 目录形式 | `src/services/AbcService/index.ts` |
| 目录形式（TSX） | `src/services/AbcService/index.tsx` |

### 生成的代码

SDK 在 `src/__entry__.ts` 生成如下代码（每次构建覆盖，请勿手动编辑）：

```typescript
// 此文件由 autumnbox-sdk build 自动生成，请勿手动修改。
import type { PluginContext } from '@autumnbox/sdk';

import { ScrcpyBridgeService } from './services/ScrcpyBridgeService';
import { DeviceMonitorService } from './services/DeviceMonitorService/index';

export function __autumnbox_entry__(context: PluginContext): () => void {
  const disposers: Array<() => void> = [];

  // Services
  context.serviceContainer.registerService(ScrcpyBridgeService);
  context.serviceContainer.registerService(DeviceMonitorService);

  // Apps
  // ...

  return () => {
    for (const dispose of disposers) dispose();
  };
}
```

### 注意事项

- 一个文件可以导出多个 Service 类，都会被发现。
- 类名必须以 `Service` 结尾才能被自动发现。
- 自动发现只扫描 `src/services/` 目录，不递归到更深的子目录。

## 13. 命名约定表

| 规则 | 说明 |
|------|------|
| **文件位置** | `src/services/` 目录，支持子目录 `XxxService/index.ts` |
| **导出模式** | `export class XxxService`，必须以 `Service` 结尾 |
| **构造函数** | 必须接收 `ServiceContainer` 作为唯一参数 |
| **注册方式** | 默认单例，一个派生名称只能注册一次 |
| **名称派生** | 去掉 `Service` 后缀，首字母小写：`AbcService` -> `'abc'` |
| **接口命名** | 接口用 `I` 前缀：`INotification`、`IAdbDriver` |
| **Handle 命名** | Handle 类型用 `*Handle` 后缀：`AdbDeviceHandle` |
| **状态属性** | 对外暴露 `IReadonlyState<T>`，内部持有 setter |
| **导入规范** | 类型导入用 `import type {}`（`verbatimModuleSyntax`） |

## 14. 完整实战示例

以下是一个完整的"设备性能监视器"Service 实现，展示了构造函数注入、公开方法、响应式状态、以及在 React App 组件中的使用。

### Service 定义

```typescript
// src/services/DevicePerfMonitorService.ts
import { createReadonlyState } from '@autumnbox/common';

import type { IReadonlyState, ServiceContainer } from '@autumnbox/common';
import type { AdbDeviceHandle } from '@autumnbox/interfaces';

import { ShellService } from '@autumnbox/core';

/** 一次采样的性能数据。 */
export interface IPerfSnapshot {
  cpuUsage: number;       // 百分比 0-100
  memTotal: number;       // 总内存 KB
  memAvailable: number;   // 可用内存 KB
  timestamp: Date;
}

/**
 * 设备性能监视服务。
 *
 * 定时采样目标设备的 CPU 和内存使用率，
 * 通过响应式状态暴露最新数据和历史记录。
 */
export class DevicePerfMonitorService {
  /** 最新一次采样（响应式）。 */
  readonly latestSnapshot: IReadonlyState<IPerfSnapshot | null>;

  /** 历史采样记录（响应式，最多保留 60 条）。 */
  readonly history: IReadonlyState<readonly IPerfSnapshot[]>;

  /** 是否正在监控（响应式）。 */
  readonly monitoring: IReadonlyState<boolean>;

  private readonly setLatest: (v: IPerfSnapshot | null) => void;
  private readonly setHistory: (v: readonly IPerfSnapshot[]) => void;
  private readonly setMonitoring: (v: boolean) => void;

  private readonly shell: ShellService;
  private timer: ReturnType<typeof setInterval> | null = null;

  private static readonly MAX_HISTORY = 60;

  constructor(container: ServiceContainer) {
    this.shell = container.getService(ShellService);

    const [latestSnapshot, setLatest] = createReadonlyState<IPerfSnapshot | null>(null);
    const [history, setHistory] = createReadonlyState<readonly IPerfSnapshot[]>([]);
    const [monitoring, setMonitoring] = createReadonlyState<boolean>(false);

    this.latestSnapshot = latestSnapshot;
    this.setLatest = setLatest;
    this.history = history;
    this.setHistory = setHistory;
    this.monitoring = monitoring;
    this.setMonitoring = setMonitoring;
  }

  /** 开始监控指定设备，intervalMs 为采样间隔。 */
  start(device: AdbDeviceHandle, intervalMs = 2000): void {
    this.stop();
    this.setMonitoring(true);

    const sample = async (): Promise<void> => {
      try {
        const snapshot = await this.takeSample(device);
        this.setLatest(snapshot);

        const prev = this.history.value;
        const next = [...prev, snapshot].slice(-DevicePerfMonitorService.MAX_HISTORY);
        this.setHistory(next);
      } catch {
        // 采样失败时不中断监控
      }
    };

    void sample();
    this.timer = setInterval(() => void sample(), intervalMs);
  }

  /** 停止监控。 */
  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setMonitoring(false);
  }

  /** 采集一次性能数据。 */
  private async takeSample(device: AdbDeviceHandle): Promise<IPerfSnapshot> {
    // 获取 CPU 使用率（简化）
    const cpuOutput = await this.shell.exec(
      device,
      "top -n 1 -b | head -5 | grep '%cpu'",
    );
    const cpuMatch = /(\d+)%idle/.exec(cpuOutput);
    const idle = cpuMatch ? Number(cpuMatch[1]) : 0;
    const cpuUsage = 100 - idle;

    // 获取内存信息
    const memOutput = await this.shell.exec(device, 'cat /proc/meminfo');
    const totalMatch = /MemTotal:\s+(\d+)/.exec(memOutput);
    const availMatch = /MemAvailable:\s+(\d+)/.exec(memOutput);

    return {
      cpuUsage,
      memTotal: totalMatch ? Number(totalMatch[1]) : 0,
      memAvailable: availMatch ? Number(availMatch[1]) : 0,
      timestamp: new Date(),
    };
  }
}
```

### App 组件

```tsx
// src/apps/PerfMonitorApp.tsx
import { useEffect } from 'react';
import { Card, Statistic, Row, Col, Button, Tag } from 'antd';
import {
  useService,
  useServiceState,
  useRequiredDevice,
  useT,
} from '@autumnbox/app';
import type { IAppDefinition } from '@autumnbox/app';

import { DevicePerfMonitorService } from '../services/DevicePerfMonitorService';

const PerfMonitorView: React.FC = () => {
  const device = useRequiredDevice();
  const monitor = useService(DevicePerfMonitorService);

  const [snapshot] = useServiceState(monitor.latestSnapshot);
  const [isMonitoring] = useServiceState(monitor.monitoring);
  const [history] = useServiceState(monitor.history);

  const title = useT('perf-monitor.title');

  useEffect(() => {
    monitor.start(device, 3000);
    return () => monitor.stop();
  }, [device, monitor]);

  const memPercent = snapshot
    ? Math.round(((snapshot.memTotal - snapshot.memAvailable) / snapshot.memTotal) * 100)
    : 0;

  return (
    <div style={{ padding: 24 }}>
      <h2>{title}</h2>
      <Tag color={isMonitoring ? 'green' : 'default'}>
        {isMonitoring ? '监控中' : '已停止'}
      </Tag>
      <Tag>采样: {history.length} 条</Tag>

      {snapshot && (
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic title="CPU 使用率" value={snapshot.cpuUsage} suffix="%" />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="内存使用率" value={memPercent} suffix="%" />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="可用内存"
                value={Math.round(snapshot.memAvailable / 1024)}
                suffix="MB"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Button
        style={{ marginTop: 16 }}
        type={isMonitoring ? 'default' : 'primary'}
        onClick={() => (isMonitoring ? monitor.stop() : monitor.start(device))}
      >
        {isMonitoring ? '停止监控' : '开始监控'}
      </Button>
    </div>
  );
};

export const PerfMonitorApp: IAppDefinition = {
  id: 'perf-monitor',
  title: 'perf-monitor.title',
  shallSelectAdbDevice: true,
  component: PerfMonitorView,
};
```

### 国际化

```
resources/
  lang/
    zh-CN.json
    en-US.json
```

```json
// resources/lang/zh-CN.json
{
  "perf-monitor.title": "性能监视器"
}
```

```json
// resources/lang/en-US.json
{
  "perf-monitor.title": "Performance Monitor"
}
```

### 构建与运行

```bash
cd my-plugin
pnpm run build    # autumnbox-sdk build → 自动发现 DevicePerfMonitorService + PerfMonitorApp
```

SDK 会生成 `src/__entry__.ts`，其中包含：

```typescript
context.serviceContainer.registerService(DevicePerfMonitorService);
disposers.push(context.registerApp(PerfMonitorApp));
```

构建产物为 `.atmb` 文件，放入 `builtin-plugins/` 目录即可加载。

## 15. 速查表

| 需求 | API |
|------|-----|
| 注册 Service 类 | `container.registerService(MyService)` |
| 注册预创建实例 | `container.registerInstance('name', obj)` |
| 按类获取（类型安全） | `container.getService(MyService)` |
| 按名获取 | `container.getService('name')` |
| 获取同名全部实例 | `container.getServices('name')` |
| React 中获取 Service | `useService(MyService)` |
| 订阅响应式状态 | `useServiceState(service.state)` 或 `useServiceState(MyService, 'state')` |
| 国际化翻译 | `useT('key')` |
| 获取目标设备 | `useRequiredDevice()` |
| Shell 带 exit code | `useShell().exec(device, cmd)` |
| 创建只读状态 | `createReadonlyState<T>(initial)` |
| 创建可变状态 | `createState<T>(initial)` |
