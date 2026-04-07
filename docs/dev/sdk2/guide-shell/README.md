---
title: ADB Shell 命令
---

# ADB Shell 命令

在 AutumnBox 插件开发中，与 Android 设备交互的最直接方式就是执行 ADB Shell 命令。SDK 提供了两种执行命令的途径：底层的 `ShellService`（通过 IoC 容器获取）和面向 React 组件的 `useShell` Hook。本文将详细介绍这两种方式的用法、区别和最佳实践。

## 两种方式概览

| 方式 | 来源 | 适用场景 |
|------|------|----------|
| `ShellService` | `@autumnbox/core`，通过 IoC 容器获取 | Service 层、非 React 代码、需要流式 I/O |
| `useShell` Hook | `@autumnbox/app`，React Hook | React 组件内，需要 exit code 支持 |

### ShellService

`ShellService` 是 `@autumnbox/core` 中的服务类，封装了底层 `IAdbDriver.spawn()` 方法。它在 IoC 容器中以单例形式存在，适合在 Service 层代码中使用。

```typescript
import { ShellService } from '@autumnbox/core';
import type { ServiceContainer } from '@autumnbox/common';

class MyService {
  private readonly shell: ShellService;

  constructor(container: ServiceContainer) {
    this.shell = container.getService(ShellService);
  }
}
```

### useShell Hook

`useShell` 是 `@autumnbox/app` 导出的 React Hook，内部基于 `ShellService.spawn()` 实现，但增加了对 **exit code** 的完整支持。在 React 组件中推荐优先使用此 Hook。

```typescript
import { useShell } from '@autumnbox/app';

const shell = useShell();
```

## ShellService.exec

`exec` 方法用于执行一条命令并等待其完成，返回完整的标准输出字符串。适合执行耗时短、输出量可控的命令。

### 方法签名

```typescript
class ShellService {
  async exec(
    device: AdbDeviceHandle,
    command: string | string[]
  ): Promise<string>;
}
```

- `device` -- 目标设备的 Handle，通过 `useRequiredDevice()` 或设备列表获取
- `command` -- 要执行的 shell 命令，可以是单个字符串或字符串数组
- 返回值 -- 命令的完整 stdout 输出（UTF-8 解码后的字符串）

### 使用示例

```typescript
import { ShellService } from '@autumnbox/core';
import type { ServiceContainer } from '@autumnbox/common';
import type { AdbDeviceHandle } from '@autumnbox/interfaces';

class DeviceInfoService {
  private readonly shell: ShellService;

  constructor(container: ServiceContainer) {
    this.shell = container.getService(ShellService);
  }

  /** 获取设备 Android 版本号 */
  async getAndroidVersion(device: AdbDeviceHandle): Promise<string> {
    const result = await this.shell.exec(device, 'getprop ro.build.version.release');
    return result.trim();
  }

  /** 获取设备型号 */
  async getDeviceModel(device: AdbDeviceHandle): Promise<string> {
    const result = await this.shell.exec(device, 'getprop ro.product.model');
    return result.trim();
  }

  /** 列出已安装的包 */
  async listPackages(device: AdbDeviceHandle): Promise<string[]> {
    const output = await this.shell.exec(device, 'pm list packages');
    return output
      .split('\n')
      .filter((line) => line.startsWith('package:'))
      .map((line) => line.replace('package:', '').trim());
  }
}
```

### 工作原理

`exec` 方法内部调用 `spawn` 创建进程，然后遍历 `stdout` 的异步可迭代流，收集所有数据块，等待进程退出后将二进制数据解码为字符串返回：

```typescript
async exec(device: AdbDeviceHandle, command: string | string[]): Promise<string> {
  const proc = await this.spawn(device, command);
  const chunks: Uint8Array[] = [];
  for await (const chunk of proc.stdout) {
    chunks.push(chunk);
  }
  await proc.wait();
  const decoder = new TextDecoder();
  return chunks.map((c) => decoder.decode(c, { stream: true })).join('') + decoder.decode();
}
```

::: warning 注意
`ShellService.exec()` 不返回 exit code。如果你需要检查命令是否执行成功，请使用 `useShell` Hook 或手动调用 `spawn`。
:::

## ShellService.spawn

`spawn` 方法创建一个 shell 进程并立即返回，不等待进程完成。返回的 `IAdbShellProcess` 对象支持流式读写，适合处理长时间运行的命令。

### 方法签名

```typescript
class ShellService {
  async spawn(
    device: AdbDeviceHandle,
    command: string | string[],
    options?: IAdbSpawnOptions
  ): Promise<IAdbShellProcess>;
}
```

### IAdbSpawnOptions

```typescript
interface IAdbSpawnOptions {
  cwd?: string;                      // 工作目录
  env?: Record<string, string>;      // 环境变量
  signal?: AbortSignal;              // 取消信号
  stdin?: BinarySource | string;     // 标准输入数据
  pty?: IAdbPtyOptions;              // PTY 模式配置
  timeoutMs?: number;                // 超时（毫秒）
  separateStderr?: boolean;          // 是否分离 stderr
}

interface IAdbPtyOptions {
  cols: number;    // 列数
  rows: number;    // 行数
  term?: string;   // 终端类型，如 'xterm-256color'
}
```

### IAdbShellProcess

`spawn` 返回的进程对象实现了 `IAdbShellProcess` 接口，提供完整的流式 I/O 能力：

```typescript
interface IAdbShellProcess {
  readonly stdout: AsyncIterable<Uint8Array>;  // 标准输出流
  readonly stderr?: AsyncIterable<Uint8Array>; // 标准错误流（需 separateStderr）
  readonly pty: boolean;                        // 是否 PTY 模式

  write(data: Uint8Array | string): Promise<void>;     // 向 stdin 写入
  closeStdin(): Promise<void>;                          // 关闭 stdin
  resize?(cols: number, rows: number): Promise<void>;   // 调整 PTY 窗口大小
  sendSignal?(signal: AdbProcessSignal): Promise<void>; // 发送信号
  wait(): Promise<IAdbProcessExit>;                     // 等待进程退出
  close(): Promise<void>;                               // 强制关闭进程
}

interface IAdbProcessExit {
  exitCode: number | null;      // 退出码
  signal?: AdbProcessSignal;    // 终止信号
  timedOut?: boolean;           // 是否超时
}
```

### 使用示例

#### 读取 logcat 日志流

```typescript
async function streamLogcat(
  shell: ShellService,
  device: AdbDeviceHandle,
  onLine: (line: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const proc = await shell.spawn(device, 'logcat', { signal });
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of proc.stdout) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    // 最后一个元素可能是不完整的行，保留到下一次迭代
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      onLine(line);
    }
  }

  // 处理剩余内容
  buffer += decoder.decode();
  if (buffer.length > 0) {
    onLine(buffer);
  }
}
```

#### PTY 模式交互式 shell

```typescript
const proc = await shell.spawn(device, 'sh', {
  pty: { cols: 80, rows: 24, term: 'xterm-256color' },
});

// 向 shell 发送命令
await proc.write('echo Hello from PTY\n');
await proc.write('exit\n');

// 读取输出
const decoder = new TextDecoder();
for await (const chunk of proc.stdout) {
  console.log(decoder.decode(chunk, { stream: true }));
}

const exit = await proc.wait();
console.log('PTY 会话结束，exit code:', exit.exitCode);
```

#### 超时控制

```typescript
// 方式一：通过 timeoutMs 选项
const proc = await shell.spawn(device, 'sleep 60', {
  timeoutMs: 5000, // 5 秒超时
});
const exit = await proc.wait();
if (exit.timedOut) {
  console.warn('命令执行超时');
}

// 方式二：通过 AbortSignal
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

const proc2 = await shell.spawn(device, 'logcat', {
  signal: controller.signal,
});
```

## useShell Hook（推荐用于 React）

`useShell` 是面向 React 组件的 Hook，提供比 `ShellService.exec()` 更完善的执行结果。它在内部使用 `spawn` 而非 `exec`，因此能捕获 exit code。

### 类型定义

```typescript
interface ShellResult {
  stdout: string;              // 完整的标准输出
  exitCode: number | null;     // 进程退出码
}

interface ShellHelper {
  /** 执行命令，返回 stdout 和 exitCode */
  exec(device: AdbDeviceHandle, command: string | string[]): Promise<ShellResult>;
  /** 执行命令，exitCode 非零时抛出异常 */
  execOrThrow(device: AdbDeviceHandle, command: string | string[]): Promise<string>;
}

function useShell(): ShellHelper;
```

### exec -- 返回完整结果

`exec` 方法返回一个包含 `stdout` 和 `exitCode` 的对象。调用者可以根据 exit code 判断命令是否成功：

```tsx
import { useShell, useRequiredDevice } from '@autumnbox/app';

const MyComponent: React.FC = () => {
  const shell = useShell();
  const device = useRequiredDevice();

  const checkRoot = async () => {
    const result = await shell.exec(device, 'su -c id');
    if (result.exitCode === 0 && result.stdout.includes('uid=0')) {
      console.log('设备已 Root');
    } else {
      console.log('设备未 Root，exit code:', result.exitCode);
    }
  };

  return <button onClick={checkRoot}>检查 Root 状态</button>;
};
```

### execOrThrow -- 失败即抛出

`execOrThrow` 是一个便捷方法。当命令的 exit code 不为 0 时，会自动抛出包含 exit code 和命令内容的 `Error`。如果命令成功，则直接返回 stdout 字符串：

```tsx
const shell = useShell();
const device = useRequiredDevice();

try {
  // 如果 exit code !== 0，自动抛出 Error
  const version = await shell.execOrThrow(device, 'getprop ro.build.version.release');
  console.log('Android 版本:', version.trim());
} catch (err) {
  // Error: Command failed with exit code 1: getprop ro.build.version.release
  console.error('命令执行失败:', err);
}
```

### exec 与 execOrThrow 的选择

| 场景 | 推荐方法 |
|------|----------|
| 需要根据 exit code 做分支逻辑 | `exec` |
| 命令必须成功，失败即为异常 | `execOrThrow` |
| 检测某个功能是否存在（如 su） | `exec` |
| 获取设备信息 | `execOrThrow` |

## 常见命令示例

以下是 AutumnBox 插件开发中常用的 ADB Shell 命令，以 `useShell` 为例：

### 获取设备信息

```typescript
const shell = useShell();
const device = useRequiredDevice();

// Android 版本
const version = await shell.execOrThrow(device, 'getprop ro.build.version.release');
// => "14"

// SDK 版本
const sdk = await shell.execOrThrow(device, 'getprop ro.build.version.sdk');
// => "34"

// 设备型号
const model = await shell.execOrThrow(device, 'getprop ro.product.model');
// => "Pixel 8"

// 设备制造商
const manufacturer = await shell.execOrThrow(device, 'getprop ro.product.manufacturer');
// => "Google"

// 序列号
const serial = await shell.execOrThrow(device, 'getprop ro.serialno');
```

### 包管理

```typescript
// 列出所有包
const packages = await shell.execOrThrow(device, 'pm list packages');

// 只列出第三方应用
const thirdParty = await shell.execOrThrow(device, 'pm list packages -3');

// 列出系统应用
const system = await shell.execOrThrow(device, 'pm list packages -s');

// 安装 APK（需先 push 到设备）
await shell.execOrThrow(device, 'pm install -r /sdcard/app.apk');

// 卸载应用
await shell.execOrThrow(device, 'pm uninstall com.example.app');

// 卸载但保留数据
await shell.execOrThrow(device, 'pm uninstall -k com.example.app');

// 清除应用数据
await shell.execOrThrow(device, 'cmd package clear com.example.app');
```

### 电池信息

```typescript
const batteryInfo = await shell.execOrThrow(device, 'dumpsys battery');
// 输出示例：
// Current Battery Service state:
//   AC powered: false
//   USB powered: true
//   level: 85
//   temperature: 280
```

### 屏幕截图

```typescript
// 截图并以 PNG 格式输出到 stdout（二进制数据）
// 注意：对于二进制数据，建议使用 spawn 而非 exec
const shellService = container.getService(ShellService);
const proc = await shellService.spawn(device, 'screencap -p');
const chunks: Uint8Array[] = [];
for await (const chunk of proc.stdout) {
  chunks.push(chunk);
}
await proc.wait();
// chunks 中包含 PNG 格式的截图数据
```

### 重启设备

```typescript
// 正常重启
await shell.execOrThrow(device, 'reboot');

// 重启到 Recovery
await shell.execOrThrow(device, 'reboot recovery');

// 重启到 Bootloader/Fastboot
await shell.execOrThrow(device, 'reboot bootloader');
```

### 系统设置

```typescript
// 开启 USB 调试（需要 Root）
await shell.execOrThrow(device, 'settings put global adb_enabled 1');

// 修改屏幕亮度
await shell.execOrThrow(device, 'settings put system screen_brightness 128');

// 查看当前壁纸路径
const wallpaper = await shell.execOrThrow(device, 'settings get system wallpaper');

// 修改 DPI
await shell.execOrThrow(device, 'wm density 400');

// 重置 DPI
await shell.execOrThrow(device, 'wm density reset');
```

### 进程与性能

```typescript
// 查看正在运行的进程（快照）
const ps = await shell.execOrThrow(device, 'ps -A');

// 查看内存使用
const meminfo = await shell.execOrThrow(device, 'cat /proc/meminfo');

// 查看 CPU 信息
const cpuinfo = await shell.execOrThrow(device, 'cat /proc/cpuinfo');

// 查看磁盘使用
const df = await shell.execOrThrow(device, 'df -h');
```

## 错误处理

在执行 shell 命令时可能遇到多种错误情况。良好的错误处理对于插件的稳定性至关重要。

### 命令不存在

当执行设备上不存在的命令时，shell 会返回非零 exit code，且 stderr 中包含 "not found" 信息：

```typescript
const result = await shell.exec(device, 'nonexistent_command');
// result.exitCode 通常为 127
// result.stdout 可能包含 "nonexistent_command: not found"
```

使用 `execOrThrow` 时，此情况会自动抛出异常：

```typescript
try {
  await shell.execOrThrow(device, 'nonexistent_command');
} catch (err) {
  // Error: Command failed with exit code 127: nonexistent_command
  console.error('命令不存在:', err);
}
```

### 权限不足

某些命令需要 Root 权限才能执行。无权限时通常返回 exit code 1 或 255：

```typescript
const result = await shell.exec(device, 'cat /data/system/packages.xml');
if (result.exitCode !== 0) {
  // 可能出现 "Permission denied" 或 "Operation not permitted"
  console.warn('权限不足，尝试 su 方式...');

  const suResult = await shell.exec(device, 'su -c cat /data/system/packages.xml');
  if (suResult.exitCode === 0) {
    // Root 执行成功
    processPackages(suResult.stdout);
  } else {
    throw new Error('设备未 Root 或 Root 权限被拒绝');
  }
}
```

### 设备在执行过程中断开

当设备在命令执行期间断开连接时，`spawn` 返回的流会产生错误，`wait()` 可能永远不会 resolve，或者会 reject。务必设置超时或使用 AbortSignal：

```typescript
async function safeExec(
  shell: ShellHelper,
  device: AdbDeviceHandle,
  command: string,
  timeoutMs = 10000,
): Promise<ShellResult | null> {
  try {
    // 使用 Promise.race 添加超时保护
    const result = await Promise.race([
      shell.exec(device, command),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('执行超时')), timeoutMs),
      ),
    ]);
    return result;
  } catch (err) {
    console.error('命令执行失败:', err);
    return null;
  }
}
```

### 统一错误处理模式

建议在插件中建立统一的命令执行封装：

```typescript
import { useShell, useRequiredDevice } from '@autumnbox/app';
import type { AdbDeviceHandle } from '@autumnbox/interfaces';
import type { ShellHelper, ShellResult } from '@autumnbox/app';

class ShellError extends Error {
  constructor(
    public readonly command: string,
    public readonly exitCode: number | null,
    public readonly stdout: string,
  ) {
    super(`Shell 命令失败 [exit ${String(exitCode)}]: ${command}`);
    this.name = 'ShellError';
  }
}

async function runCommand(
  shell: ShellHelper,
  device: AdbDeviceHandle,
  command: string,
): Promise<string> {
  let result: ShellResult;
  try {
    result = await shell.exec(device, command);
  } catch (err) {
    // 连接断开等底层错误
    throw new Error(`无法执行命令 "${command}"：设备可能已断开连接`);
  }

  if (result.exitCode !== 0) {
    throw new ShellError(command, result.exitCode, result.stdout);
  }

  return result.stdout;
}
```

## 完整示例：简易终端 App

下面是一个完整的终端 App 示例，用户可以在输入框中输入命令，实时查看 stdout 输出和 exit code，并具备错误处理能力。

```tsx
// src/apps/MiniTerminalApp.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, Space, Tag, Typography, Alert } from 'antd';
import { SendOutlined, ClearOutlined } from '@ant-design/icons';
import { useShell, useRequiredDevice } from '@autumnbox/app';
import type { AutumnApp } from '@autumnbox/sdk';
import type { ShellResult } from '@autumnbox/app';

const { Text } = Typography;

/** 单条命令执行记录 */
interface CommandRecord {
  id: number;
  command: string;
  result: ShellResult | null;
  error: string | null;
  timestamp: Date;
}

const MiniTerminalView: React.FC = () => {
  const shell = useShell();
  const device = useRequiredDevice();

  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandRecord[]>([]);
  const [running, setRunning] = useState(false);
  const nextId = useRef(0);
  const outputRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新输出
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = useCallback(async () => {
    const command = input.trim();
    if (command.length === 0 || running) return;

    setInput('');
    setRunning(true);

    const recordId = nextId.current++;
    let result: ShellResult | null = null;
    let error: string | null = null;

    try {
      result = await shell.exec(device, command);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    const record: CommandRecord = {
      id: recordId,
      command,
      result,
      error,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, record]);
    setRunning(false);
  }, [input, running, shell, device]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void executeCommand();
      }
    },
    [executeCommand],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16 }}>
      {/* 输出区域 */}
      <div
        ref={outputRef}
        style={{
          flex: 1,
          overflow: 'auto',
          background: '#1e1e1e',
          color: '#d4d4d4',
          fontFamily: 'monospace',
          fontSize: 13,
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        {history.length === 0 && (
          <Text type="secondary" style={{ color: '#666' }}>
            在下方输入 ADB Shell 命令，按 Enter 执行
          </Text>
        )}

        {history.map((record) => (
          <div key={record.id} style={{ marginBottom: 12 }}>
            {/* 命令行 */}
            <div style={{ color: '#569cd6' }}>
              <Text style={{ color: '#6a9955' }}>$ </Text>
              <Text style={{ color: '#dcdcaa' }}>{record.command}</Text>
              <Text style={{ color: '#666', marginLeft: 8 }}>
                {record.timestamp.toLocaleTimeString()}
              </Text>
            </div>

            {/* 输出内容 */}
            {record.result !== null && (
              <>
                <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap', color: '#d4d4d4' }}>
                  {record.result.stdout}
                </pre>
                <Tag color={record.result.exitCode === 0 ? 'success' : 'error'}>
                  exit code: {String(record.result.exitCode ?? 'N/A')}
                </Tag>
              </>
            )}

            {/* 错误信息 */}
            {record.error !== null && (
              <Alert
                type="error"
                message="执行失败"
                description={record.error}
                style={{ marginTop: 4 }}
                showIcon
              />
            )}
          </div>
        ))}

        {running && (
          <Text style={{ color: '#569cd6' }}>正在执行...</Text>
        )}
      </div>

      {/* 输入区域 */}
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入 ADB Shell 命令..."
          disabled={running}
          style={{ fontFamily: 'monospace' }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => void executeCommand()}
          loading={running}
        >
          执行
        </Button>
        <Button
          icon={<ClearOutlined />}
          onClick={clearHistory}
        >
          清屏
        </Button>
      </Space.Compact>
    </div>
  );
};

/** App 定义 */
export const MiniTerminalApp: AutumnApp = {
  id: 'mini-terminal',
  name: '迷你终端',
  component: MiniTerminalView,
  shallSelectAdbDevice: true,
  tags: ['tool'],
};
```

### 要点解读

1. **`useRequiredDevice`** -- 声明此 App 需要已连接设备。在 App 定义中设置 `shallSelectAdbDevice: true`，框架会在打开标签页前要求用户选择设备。
2. **`shell.exec`** -- 返回 `{ stdout, exitCode }`，组件根据 exit code 显示成功或失败标签。
3. **try/catch 包裹** -- 捕获设备断开等底层异常，将错误信息显示在 UI 中而非让整个 App 崩溃。
4. **滚动跟踪** -- 通过 `useEffect` 监听历史记录变化，自动滚动到最新输出。
5. **键盘快捷键** -- Enter 键提交命令，与终端交互体验一致。

::: tip 生产建议
在实际插件中，可以进一步增强此终端：
- 使用 `@xterm/xterm`（宿主已提供）实现真正的终端模拟器
- 配合 `spawn` 的 PTY 模式实现交互式 shell
- 添加命令历史记录（上下箭头浏览）
- 支持 Tab 自动补全
:::

## 小结

| 功能 | ShellService.exec | ShellService.spawn | useShell().exec | useShell().execOrThrow |
|------|------|------|------|------|
| 返回 stdout | 是 | 流式 | 是 | 是 |
| 返回 exit code | 否 | 通过 wait() | 是 | 非零时抛异常 |
| 流式 I/O | 否 | 是 | 否 | 否 |
| PTY 支持 | 否 | 是 | 否 | 否 |
| 适用位置 | Service 层 | Service 层 | React 组件 | React 组件 |

**一般规则**：
- 在 React 组件中执行命令 → 用 `useShell`
- 在 Service 层中执行简单命令 → 用 `ShellService.exec`
- 需要流式输出或 PTY → 用 `ShellService.spawn`
