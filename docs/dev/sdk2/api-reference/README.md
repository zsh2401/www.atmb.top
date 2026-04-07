---
title: API 参考
---

# API 参考

秋之盒插件 SDK 公开 API 速查手册。

## 目录

[[toc]]

---

## 核心服务

所有 Service 通过 IoC 容器获取，构造函数接收 `ServiceContainer`。插件中使用 `useService(XxxService)` hook 获取实例。

### DevicesService

```typescript
readonly devices: IReadonlyState<readonly AdbDeviceHandle[]>
```
当前已连接设备列表，响应式状态，UI 可订阅。

```typescript
refresh(): Promise<void>
```
手动刷新设备列表。

```typescript
startPolling(intervalMs?: number): void
```
开始轮询设备列表，默认 2000ms。

```typescript
stopPolling(): void
```
停止轮询。

---

### ShellService

```typescript
spawn(
  device: AdbDeviceHandle,
  command: string | string[],
  options?: IAdbSpawnOptions,
): Promise<IAdbShellProcess>
```
在设备上启动 shell 进程，支持 PTY 和流式 IO。

```typescript
exec(device: AdbDeviceHandle, command: string | string[]): Promise<string>
```
执行命令并返回完整 stdout 字符串。

---

### DeviceFileSystemService

```typescript
push(
  device: AdbDeviceHandle,
  deviceDir: string,
  source: PushSource,
  signal?: AbortSignal,
): Promise<void>
```
推送文件到设备目录。`PushSource` 为 `string | IFileData`。

```typescript
pull(
  device: AdbDeviceHandle,
  devicePath: string,
  dest: PullDest,
  signal?: AbortSignal,
): Promise<void>
```
从设备拉取文件。`PullDest` 为 `IPullToLocal | IPullToReader`。

```typescript
listDir(device: AdbDeviceHandle, remotePath: string): Promise<readonly IAdbFileEntry[]>
```
列出设备上目录内容（自动过滤 `.` 和 `..`）。

---

### PackageService

```typescript
listPackages(device: AdbDeviceHandle): Promise<string[]>
```
列出已安装包名。

```typescript
installApk(device: AdbDeviceHandle, source: PushSource): Promise<void>
```
安装 APK。先推送到 `/data/local/tmp/`，再 `pm install`，安装后自动清理临时文件。

---

### RebootService

```typescript
reboot(device: AdbDeviceHandle, target?: AdbRebootTarget): Promise<void>
```
重启设备。`target` 可选 `'system' | 'bootloader' | 'recovery' | 'sideload' | 'sideload-auto-reboot'`，默认 `'system'`。

---

### DriverService

```typescript
getAdbDriver(): IAdbDriver
```
获取当前 ADB 驱动实例。

```typescript
getFastbootDriver(): IFastbootDriver | null
```
获取 Fastboot 驱动实例，不可用时返回 `null`。

---

### LocalFileSystemService

```typescript
getFileSystem(): IFileSystem
```
获取宿主文件系统实例。

---

### NotificationService

```typescript
readonly notifications: IReadonlyState<readonly INotification[]>
```
通知列表，响应式状态。

```typescript
readonly unreadCount: IReadonlyState<number>
```
未读数量，响应式状态。

```typescript
push(type: 'error' | 'warning' | 'info' | 'success', title: string, message: string): void
```
推送通知。

```typescript
markRead(id: string): void
```
标记单条已读。

```typescript
markAllRead(): void
```
标记全部已读。

```typescript
clear(): void
```
清空所有通知。

---

### LanguageService

```typescript
readonly locale: IReadonlyState<string>
```
当前语言代码（BCP 47），响应式状态。

```typescript
load(langPack: ILangPack): void
```
加载语言包。相同 `id` 会覆盖。

```typescript
unload(id: string): void
```
卸载语言包。

```typescript
switchLocale(locale: string): void
```
切换语言。

```typescript
getT(key: string): IReadonlyState<string>
```
获取翻译键的响应式状态，locale 切换或语言包变化时自动更新。回退链：当前 locale → `en-US` → key 本身。

**ILangPack**

```typescript
interface ILangPack {
  langCode: string;                  // BCP 47 语言代码
  content: Record<string, string>;   // 翻译键值对
  id: string;                        // 语言包唯一标识
}
```

---

## 接口与类型

### AdbDeviceHandle

```typescript
type AdbDeviceHandle = Readonly<{ sn: string }>
```
ADB 设备标识，不可变。`sn` 为设备序列号。

---

### FastbootDeviceHandle

```typescript
type FastbootDeviceHandle = Readonly<{ id: string; sn?: string }>
```
Fastboot 设备标识。

---

### IAdbShellProcess

```typescript
interface IAdbShellProcess {
  readonly stdout: AsyncIterable<Uint8Array>;
  readonly stderr?: AsyncIterable<Uint8Array>;
  readonly pty: boolean;
  write(data: Uint8Array | string): Promise<void>;
  closeStdin(): Promise<void>;
  resize?(cols: number, rows: number): Promise<void>;
  sendSignal?(signal: AdbProcessSignal): Promise<void>;
  wait(): Promise<IAdbProcessExit>;
  close(): Promise<void>;
}
```

| 方法 | 说明 |
|------|------|
| `write` | 向 stdin 写入数据 |
| `closeStdin` | 关闭 stdin |
| `resize` | 调整 PTY 窗口大小（仅 PTY 模式） |
| `sendSignal` | 发送信号（仅部分驱动支持） |
| `wait` | 等待进程退出 |
| `close` | 强制关闭进程 |

---

### IAdbSpawnOptions

```typescript
interface IAdbSpawnOptions {
  cwd?: string;
  env?: Record<string, string>;
  signal?: AbortSignal;
  stdin?: BinarySource | string;
  pty?: IAdbPtyOptions;
  timeoutMs?: number;
  separateStderr?: boolean;
}
```

```typescript
interface IAdbPtyOptions {
  cols: number;
  rows: number;
  term?: string;
}
```

---

### IAdbProcessExit

```typescript
interface IAdbProcessExit {
  exitCode: number | null;
  signal?: AdbProcessSignal;
  timedOut?: boolean;
}
```
`AdbProcessSignal` = `'INT' | 'TERM' | 'KILL' | 'HUP' | 'QUIT'`

---

### IAdbFileEntry

```typescript
interface IAdbFileEntry {
  path: string;
  name: string;
  size: number;
  mode: number;
  isDirectory: boolean;
  modifiedAt?: Date;
}
```
设备文件/目录条目。

---

### IAdbDeviceInfo

```typescript
interface IAdbDeviceInfo {
  sdk: number | null;
  release: string | null;
  abi: string | null;
  device: string | null;
}
```
设备基本信息（SDK 版本、Android 版本、CPU ABI、设备名）。

---

### PushSource / PullDest

```typescript
type PushSource = string | IFileData;

interface IFileData {
  data: Blob | ArrayBuffer;
  name: string;
  size: number;
}

type PullDest = IPullToLocal | IPullToReader;

interface IPullToLocal {
  type: 'local';
  path: string;
}

interface IPullToReader {
  type: 'reader';
  chunkCallback: (chunk: Uint8Array) => Promise<void>;
}
```

---

### IAdbDriver

```typescript
interface IAdbDriver {
  start(): Promise<void>;
  stop(): Promise<void>;
  listDevices(): Promise<readonly AdbDeviceHandle[]>;
  spawn(device: AdbDeviceHandle, command: string | string[], options?: IAdbSpawnOptions): Promise<IAdbShellProcess>;
  push(device: AdbDeviceHandle, deviceDir: string, source: PushSource, signal?: AbortSignal): Promise<void>;
  pull(device: AdbDeviceHandle, devicePath: string, dest: PullDest, signal?: AbortSignal): Promise<void>;
  listDir(device: AdbDeviceHandle, remotePath: string): Promise<readonly IAdbFileEntry[]>;
  getDeviceInfo(device: AdbDeviceHandle): Promise<IAdbDeviceInfo>;
  reboot(device: AdbDeviceHandle, target?: AdbRebootTarget): Promise<void>;
  getAdbTransport?(device: AdbDeviceHandle): Promise<unknown>;
}
```
ADB 驱动底层接口。插件通常不直接使用，而是通过 Service 层封装。

---

### IFastbootDriver

```typescript
interface IFastbootDriver {
  start(): Promise<void>;
  stop(): Promise<void>;
  listDevices(): Promise<readonly FastbootDeviceHandle[]>;
  getVar(handle: FastbootDeviceHandle, name: string): Promise<string>;
  flash(handle: FastbootDeviceHandle, partition: string, data: BinarySource, options?: IFastbootFlashOptions): Promise<void>;
  erase(handle: FastbootDeviceHandle, partition: string): Promise<void>;
  boot(handle: FastbootDeviceHandle, data: BinarySource): Promise<void>;
  reboot(handle: FastbootDeviceHandle, target?: FastbootRebootTarget): Promise<void>;
  continueBoot(handle: FastbootDeviceHandle): Promise<void>;
  oem(handle: FastbootDeviceHandle, command: string): Promise<string>;
}
```
Fastboot 驱动接口。`FastbootRebootTarget` = `'system' | 'bootloader' | 'recovery' | 'fastboot'`。

```typescript
interface IFastbootFlashOptions {
  signal?: AbortSignal;
  slot?: 'a' | 'b';
}
```

---

### IFileSystem

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
宿主文件系统抽象。插件通过 `IPluginContext.fs` 获取实例。

```typescript
interface IFileStat {
  size: number;
  mode: number;
  isDirectory: boolean;
  modifiedAt: Date;
}
```

---

### 通用类型

```typescript
type TransportKind = 'webusb' | 'native' | 'mock';
type DeviceProtocol = 'adb' | 'fastboot';
type DeviceState = 'connected' | 'disconnected' | 'unauthorized' | 'offline' | 'ready';
type DeviceMode = 'android' | 'recovery' | 'bootloader' | 'fastbootd' | 'unknown';
type AdbRebootTarget = 'system' | 'bootloader' | 'recovery' | 'sideload' | 'sideload-auto-reboot';
type BinaryChunk = Uint8Array;
type BinarySource = BinaryChunk | Iterable<BinaryChunk> | AsyncIterable<BinaryChunk>;
type BinarySink = AsyncIterable<BinaryChunk>;
```

---

### 错误类型

所有错误继承自 `AutumnBoxError`，可用 `instanceof` 判断。

| 错误类 | 场景 |
|--------|------|
| `PermissionError` | WebUSB 设备未授权，或设备调试未允许 |
| `TransportError` | USB 断连、连接中断、Tauri IPC 失败 |
| `ProtocolError` | ADB 协议握手失败、AUTH 拒绝 |
| `DeviceError` | 设备离线或处于非预期模式 |
| `TimeoutError` | 命令执行超时 |
| `UnsupportedError` | 当前后端不支持该操作 |
| `NotFoundError` | 文件、路径或设备未找到 |
| `CancelledError` | 用户通过 AbortSignal 取消操作 |

---

## 响应式原语

### IReadonlyState\<V\>

```typescript
interface IReadonlyState<V> {
  readonly value: V;
  subscribe(listener: (value: V) => void): () => void;
}
```
只读响应式状态。`subscribe` 返回取消订阅函数。

### IState\<V\>

```typescript
interface IState<V> extends IReadonlyState<V> {
  value: V;  // 可读写
}
```
可写响应式状态，继承自 `IReadonlyState`。

### createState

```typescript
function createState<V>(initial: V): IState<V>
```
创建可写状态。通常用于 Service 内部。

### createReadonlyState

```typescript
function createReadonlyState<V>(initial: V): [IReadonlyState<V>, (value: V) => void]
```
创建只读状态 + 私有 setter，模式类似 React `useState`。Service 暴露 `IReadonlyState`，setter 私有持有。

---

## IoC 容器

### ServiceContainer

```typescript
class ServiceContainer {
  registerService<T>(name: string, Clazz: ServiceClass<T>): void;
  registerSingletonService<T>(name: string, Clazz: ServiceClass<T>): void;
  registerInstance(name: string, instance: unknown): void;
  getService<T>(token: ServiceClass<T>): T;
  getService(name: string): unknown;
  getServices(name: string): unknown[];
}
```

| 方法 | 说明 |
|------|------|
| `registerService` | 多注册（同名多类） |
| `registerSingletonService` | 单例注册（同名重复注册抛异常） |
| `registerInstance` | 注册预创建实例 |
| `getService(Class)` | 按类 token 获取，类型安全 |
| `getService(name)` | 按名称获取第一个，返回 `unknown` |
| `getServices(name)` | 获取同名下所有实例 |

所有 class 注册均为懒实例化，首次 `getService` 时创建。

```typescript
type ServiceClass<T = unknown> = new (container: ServiceContainer) => T;
```

---

## 插件类型

### IPlugin

```typescript
interface IPlugin {
  id: string;           // 唯一标识（包名风格，如 "com.example.myplugin"）
  name: string;         // 显示名称
  description?: string;
  version?: string;
  author?: string;
  onInit(services: ServiceContainer, context: IPluginContext): void;
  onEnable(): void;
  onDisable(): void;
}
```

| 生命周期 | 说明 |
|----------|------|
| `onInit` | 初始化，仅调用一次。接收容器和插件上下文 |
| `onEnable` | 启用插件（可多次调用） |
| `onDisable` | 禁用插件（可多次调用） |

---

### IPluginContext

```typescript
interface IPluginContext {
  readonly pluginHome: string;
  readonly fs: IFileSystem;
  getResource(name: string): Promise<Blob | null>;
}
```

| 属性/方法 | 说明 |
|-----------|------|
| `pluginHome` | 插件专属数据目录路径 |
| `fs` | 文件系统实例，读写插件数据 |
| `getResource` | 从 `.atmb` 包内 `resources/` 目录懒加载资源，不存在返回 `null` |

---

### IAppDefinition

App 有两种模式：React 和 Custom。

**React 模式**

```typescript
interface IReactAppDefinition {
  type: 'react';
  id: string;
  name: string;
  icon: string;
  singleton: boolean;
  shallSelectAdbDevice?: boolean;
  tags?: string[];
  component: React.FC<{ targetDevice?: AdbDeviceHandle; route?: IRouteInfo }>;
}
```
在主 React 树中渲染，自动获得 Context。

**Custom 模式**

```typescript
interface ICustomAppDefinition {
  type: 'custom';
  id: string;
  name: string;
  icon: string;
  singleton: boolean;
  shallSelectAdbDevice?: boolean;
  tags?: string[];
  mount(container: HTMLElement, services: ServiceContainer): () => void;
}
```
自由挂载，`mount` 返回销毁函数。

---

### ICardDefinition

首页卡片，同样支持 React 和 Custom 两种模式。

```typescript
interface IReactCardDefinition {
  type: 'react';
  id: string;
  name: string;
  component: React.FC;
}

interface ICustomCardDefinition {
  type: 'custom';
  id: string;
  name: string;
  mount(container: HTMLElement, services: ServiceContainer): () => void;
}
```

---

### IRouteInfo

```typescript
interface IRouteInfo {
  path: string;
  params: Record<string, string>;
}
```
URI 导航传递给 App 的路由信息。

---

### 插件模块导出

插件 UMD bundle 需导出以下字段：

```typescript
export const mainPlugin: IPlugin;
export const mainApps: IAppDefinition[];
export const mainCards: ICardDefinition[];
```

---

## React Hooks

以下 hooks 从 `@autumnbox/app` 导出，用于插件 React 组件中。

### useService

```typescript
function useService<T>(Clazz: ServiceClass<T>): T
```
从 IoC 容器获取 Service 单例。

```typescript
const shell = useService(ShellService);
```

---

### useServiceState

```typescript
// 直接传入 IState -> [value, setter]
function useServiceState<V>(state: IState<V>): [V, (v: V) => void];

// 直接传入 IReadonlyState -> [value]
function useServiceState<V>(state: IReadonlyState<V>): [V];

// Service 实例或类 + 属性名 -> 自动推断返回类型
function useServiceState<T, K extends StateKeysOf<T>>(
  service: T | ServiceClass<T>,
  stateName: K,
): UseServiceStateReturn<T[K]>;
```
订阅响应式状态，状态变化自动触发重渲染。

```typescript
const [devices] = useServiceState(DevicesService, 'devices');
```

---

### useRequestDevice

```typescript
function useRequestDevice(): RequestDeviceFn | null
```
返回设备选择回调。不可用时返回 `null`（如 native 环境）。

---

### useConnectWiFi

```typescript
function useConnectWiFi(): ConnectWiFiFn | null
```
返回 WiFi ADB 连接回调。仅 Tauri 桌面端可用。

---

### useLoadPlugin

```typescript
function useLoadPlugin(): LoadPluginFn | null
```
返回加载插件的回调，不可用时返回 `null`。

---

### useTabCloser

```typescript
function useTabCloser(): () => void
```
返回关闭当前 Tab 的回调。必须在 Tab 内容组件中调用。

---

### useTabName

```typescript
function useTabName(): [string, (name: string) => void]
```
返回当前 Tab 的 `[title, setTitle]`。必须在 Tab 内容组件中调用。

---

### useNavigation

```typescript
function useNavigation(): { open: (uri: string) => void }
```
返回导航助手，可打开 `autumnbox://` URI。

URI 格式：`autumnbox://app-id/path?param=value`

---

### useNavigationEvent

```typescript
function useNavigationEvent(callback: (req: NavigationRequest) => void): void
```
监听 singleton App 已打开时的路由变化事件。

```typescript
interface NavigationRequest {
  appId: string;
  path: string;
  params: Record<string, string>;
}
```

---

### useT

```typescript
function useT(key: string): string
```
i18n 翻译 hook，locale 切换时自动重渲染。
