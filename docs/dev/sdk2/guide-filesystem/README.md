---
title: 文件系统
---

# 文件系统

AutumnBox 插件体系提供了两套完全独立的文件系统抽象，分别面向不同的使用场景。理解它们的区别是正确编写插件的基础。

## 1. 两种文件系统

### 设备文件系统 — DeviceFileSystemService

`DeviceFileSystemService` 操作的是 **Android 设备上的文件**。它底层通过 ADB 的 sync 协议实现文件推送（push）和拉取（pull），以及目录列举（listDir）。所有操作都需要传入一个 `AdbDeviceHandle` 来指定目标设备。

典型场景：

- 向设备推送 APK、配置文件、脚本
- 从设备拉取日志、截图、数据库
- 浏览设备目录结构

### 插件本地存储 — PluginContext.fs / usePluginFs

`PluginContext.fs` 提供的是 **插件自己的持久化数据目录**。它实现了 `IFileSystem` 接口，存储位置在宿主应用的数据目录下（浏览器端为 OPFS，桌面端为本地文件系统）。每个插件拥有独立的命名空间，互不干扰。

典型场景：

- 保存插件配置（用户偏好、上次连接的设备等）
- 缓存从设备拉取的文件
- 存储插件运行产生的中间数据

::: tip 关键区别
`DeviceFileSystemService` 操作远端设备，需要设备连接；`usePluginFs()` 操作本地存储，随时可用。两者的 API 完全不同，不要混淆。
:::

## 2. DeviceFileSystemService — 设备文件操作

`DeviceFileSystemService` 是一个注册在 IoC 容器中的 Service，位于 `@autumnbox/core` 包。它封装了 `IAdbDriver` 的底层文件传输能力，提供三个核心方法。

### 获取 DeviceFileSystemService

在 React 组件中，通过 `useService` hook 获取实例：

```typescript
import { DeviceFileSystemService } from '@autumnbox/core';
import { useService } from '@autumnbox/app';

const fileService = useService(DeviceFileSystemService);
```

在 Service 中，通过构造函数的 `ServiceContainer` 获取：

```typescript
import type { ServiceContainer } from '@autumnbox/common';
import { DeviceFileSystemService } from '@autumnbox/core';

export class MyService {
  private readonly fileService: DeviceFileSystemService;

  constructor(container: ServiceContainer) {
    this.fileService = container.getService(DeviceFileSystemService);
  }
}
```

### push — 推送文件到设备

将本地文件推送到设备上的指定目录。

**签名：**

```typescript
async push(
  device: AdbDeviceHandle,
  deviceDir: string,
  source: PushSource,
  signal?: AbortSignal,
): Promise<void>
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `device` | `AdbDeviceHandle` | 目标设备 |
| `deviceDir` | `string` | 设备上的目标目录路径 |
| `source` | `PushSource` | 要推送的文件数据 |
| `signal` | `AbortSignal` | 可选，用于取消传输 |

`PushSource` 是一个联合类型，支持两种形式：

```typescript
// 形式 1：本地文件路径（仅桌面端可用）
type PushSource = string;

// 形式 2：内存中的文件数据（浏览器和桌面端均可用）
type PushSource = IFileData;

interface IFileData {
  data: Blob | ArrayBuffer;
  name: string;
  size: number;
}
```

**示例 — 从用户选择的文件推送到设备：**

```typescript
import { DeviceFileSystemService } from '@autumnbox/core';
import { useService, useRequiredDevice } from '@autumnbox/app';

function UploadButton() {
  const fileService = useService(DeviceFileSystemService);
  const device = useRequiredDevice();

  const handleUpload = async () => {
    // 让用户选择文件
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      await fileService.push(device, '/sdcard/Download/', {
        data: file,
        name: file.name,
        size: file.size,
      });
    };
    input.click();
  };

  return <Button onClick={handleUpload}>上传文件到设备</Button>;
}
```

### pull — 从设备拉取文件

从设备拉取文件到本地。拉取的目标通过 `PullDest` 联合类型指定。

**签名：**

```typescript
async pull(
  device: AdbDeviceHandle,
  devicePath: string,
  dest: PullDest,
  signal?: AbortSignal,
): Promise<void>
```

`PullDest` 支持两种形式：

```typescript
// 形式 1：拉取到本地路径（仅桌面端）
interface IPullToLocal {
  type: 'local';
  path: string;
}

// 形式 2：流式读取（浏览器和桌面端均可用）
interface IPullToReader {
  type: 'reader';
  chunkCallback: (chunk: Uint8Array) => Promise<void>;
}

type PullDest = IPullToLocal | IPullToReader;
```

**示例 — 流式拉取文件并组装成 Blob：**

```typescript
const chunks: Uint8Array[] = [];

await fileService.pull(device, '/sdcard/Download/log.txt', {
  type: 'reader',
  chunkCallback: async (chunk) => {
    chunks.push(chunk);
  },
});

const blob = new Blob(chunks);
const text = await blob.text();
console.log('文件内容：', text);
```

**示例 — 拉取后触发浏览器下载：**

```typescript
async function downloadFromDevice(
  fileService: DeviceFileSystemService,
  device: AdbDeviceHandle,
  remotePath: string,
  fileName: string,
) {
  const chunks: Uint8Array[] = [];

  await fileService.pull(device, remotePath, {
    type: 'reader',
    chunkCallback: async (chunk) => {
      chunks.push(chunk);
    },
  });

  const blob = new Blob(chunks);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
```

### listDir — 列出设备目录

列出设备上指定目录的内容。返回值自动过滤掉 `.` 和 `..` 条目。

**签名：**

```typescript
async listDir(
  device: AdbDeviceHandle,
  remotePath: string,
): Promise<readonly IAdbFileEntry[]>
```

每个 `IAdbFileEntry` 包含以下字段：

```typescript
interface IAdbFileEntry {
  path: string;       // 完整路径
  name: string;       // 文件名
  size: number;       // 文件大小（字节）
  mode: number;       // Unix 权限模式
  isDirectory: boolean; // 是否为目录
  modifiedAt?: Date;  // 最后修改时间
}
```

**示例：**

```typescript
const entries = await fileService.listDir(device, '/sdcard/');

for (const entry of entries) {
  if (entry.isDirectory) {
    console.log(`[目录] ${entry.name}`);
  } else {
    console.log(`[文件] ${entry.name} (${entry.size} bytes)`);
  }
}
```

### AbortSignal — 取消长时间传输

`push` 和 `pull` 都接受可选的 `AbortSignal` 参数，用于取消正在进行的文件传输。这在处理大文件时尤其重要。

```typescript
import { useState, useRef } from 'react';

function LargeFileTransfer() {
  const fileService = useService(DeviceFileSystemService);
  const device = useRequiredDevice();
  const [transferring, setTransferring] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const startTransfer = async (file: File) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setTransferring(true);

    try {
      await fileService.push(
        device,
        '/sdcard/Download/',
        { data: file, name: file.name, size: file.size },
        controller.signal,
      );
      console.log('传输完成');
    } catch (err) {
      if (controller.signal.aborted) {
        console.log('传输已取消');
      } else {
        throw err;
      }
    } finally {
      setTransferring(false);
      abortRef.current = null;
    }
  };

  const cancelTransfer = () => {
    abortRef.current?.abort();
  };

  return (
    <Space>
      <Button
        onClick={() => {/* 触发文件选择并调用 startTransfer */}}
        loading={transferring}
      >
        上传大文件
      </Button>
      {transferring && (
        <Button danger onClick={cancelTransfer}>
          取消
        </Button>
      )}
    </Space>
  );
}
```

## 3. 插件本地存储

每个插件都拥有独立的数据目录，用于持久化配置、缓存和其他运行时数据。数据目录位于：

```
{autumnHome}/plugins/data/{pluginId}/
```

其中 `autumnHome` 是 AutumnBox 的全局数据根目录，`pluginId` 来自 `package.json` 的 `name` 字段（`@` 前缀被去除，`/` 替换为 `-`）。

### usePluginFs / usePluginHome

在 React 组件中通过 hook 获取：

```typescript
import { usePluginFs, usePluginHome } from '@autumnbox/app';

function MyComponent() {
  const fs = usePluginFs();     // IFileSystem 实例
  const home = usePluginHome(); // 插件数据目录路径字符串

  // fs 的操作路径以 home 为根
  // 例如 fs.resolve(home, 'config.json') 得到完整路径
}
```

在 `pluginMain` 入口函数中，直接从 `PluginContext` 获取：

```typescript
export function pluginMain(context: PluginContext) {
  const fs = context.fs;
  const home = context.pluginHome;
}
```

### IFileSystem 接口

`IFileSystem` 是插件本地存储的完整接口定义：

```typescript
interface IFileSystem {
  /** 人类可读的描述（如 "OPFS" 或 "Node.js FS"） */
  readonly description: string;

  /** 返回 AutumnBox 全局数据根目录路径 */
  autumnHome(): string;

  /** 读取文件内容，返回可读流 */
  readFile(path: string): Promise<ReadableStream<Uint8Array>>;

  /** 写入文件 */
  writeFile(path: string, data: Blob): Promise<void>;

  /** 获取文件/目录的元信息 */
  stat(path: string): Promise<IFileStat>;

  /** 删除文件或目录 */
  remove(path: string): Promise<void>;

  /** 判断路径是否存在 */
  exists(path: string): Promise<boolean>;

  /** 创建目录（递归） */
  mkdir(path: string): Promise<void>;

  /** 列出目录内容，返回文件名数组 */
  readdir(path: string): Promise<string[]>;

  /** 拼接路径片段，类似 path.join */
  resolve(...segments: string[]): string;

  /** 返回临时目录路径 */
  tmpdir(): string;
}

interface IFileStat {
  size: number;
  mode: number;
  isDirectory: boolean;
  modifiedAt: Date;
}
```

::: warning 注意
`readFile` 返回的是 `ReadableStream<Uint8Array>`，不是字符串。如果需要文本内容，需要手动解码：

```typescript
const stream = await fs.readFile(path);
const reader = stream.getReader();
const chunks: Uint8Array[] = [];
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  chunks.push(value);
}
const text = new TextDecoder().decode(
  new Blob(chunks).arrayBuffer
    ? await new Blob(chunks).arrayBuffer().then((buf) => new Uint8Array(buf))
    : new Uint8Array()
);
```

更简洁的写法是使用 `Response` 对象：

```typescript
const stream = await fs.readFile(path);
const text = await new Response(stream).text();
```
:::

### 持久化配置示例

下面是一个完整的插件配置管理方案，将设置以 JSON 格式存储在插件数据目录中：

```typescript
// src/services/ConfigService.ts
import type { ServiceContainer } from '@autumnbox/common';
import type { IFileSystem } from '@autumnbox/interfaces';

interface PluginConfig {
  defaultRemotePath: string;
  maxFileSize: number;
  showHiddenFiles: boolean;
  recentPaths: string[];
}

const DEFAULT_CONFIG: PluginConfig = {
  defaultRemotePath: '/sdcard/',
  maxFileSize: 100 * 1024 * 1024, // 100 MB
  showHiddenFiles: false,
  recentPaths: [],
};

export class ConfigService {
  private config: PluginConfig = { ...DEFAULT_CONFIG };
  private configPath = '';
  private fs: IFileSystem | null = null;

  constructor(_container: ServiceContainer) {
    // ServiceContainer 注入，但 fs 和 path 需要从 PluginContext 初始化
  }

  /** 插件初始化时调用，传入 PluginContext 的 fs 和 pluginHome */
  async init(fs: IFileSystem, pluginHome: string): Promise<void> {
    this.fs = fs;
    this.configPath = fs.resolve(pluginHome, 'config.json');
    await this.load();
  }

  get(): PluginConfig {
    return { ...this.config };
  }

  async update(partial: Partial<PluginConfig>): Promise<void> {
    this.config = { ...this.config, ...partial };
    await this.save();
  }

  async addRecentPath(path: string): Promise<void> {
    const paths = this.config.recentPaths.filter((p) => p !== path);
    paths.unshift(path);
    this.config.recentPaths = paths.slice(0, 10);
    await this.save();
  }

  private async load(): Promise<void> {
    if (!this.fs) return;
    try {
      if (await this.fs.exists(this.configPath)) {
        const stream = await this.fs.readFile(this.configPath);
        const text = await new Response(stream).text();
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(text) as Partial<PluginConfig> };
      }
    } catch {
      // 配置损坏，使用默认值
      this.config = { ...DEFAULT_CONFIG };
    }
  }

  private async save(): Promise<void> {
    if (!this.fs) return;
    const json = JSON.stringify(this.config, null, 2);
    await this.fs.writeFile(this.configPath, new Blob([json]));
  }
}
```

在 `pluginMain` 中初始化：

```typescript
export function pluginMain(context: PluginContext) {
  const configService = context.getService(ConfigService);
  // 将 PluginContext 的文件系统传给 ConfigService
  configService.init(context.fs, context.pluginHome);
}
```

在 App 组件中使用：

```typescript
function SettingsPanel() {
  const configService = useService(ConfigService);
  const [config, setConfig] = useState(configService.get());

  const toggleHidden = async () => {
    await configService.update({ showHiddenFiles: !config.showHiddenFiles });
    setConfig(configService.get());
  };

  return (
    <Switch
      checked={config.showHiddenFiles}
      onChange={toggleHidden}
      checkedChildren="显示隐藏文件"
      unCheckedChildren="隐藏"
    />
  );
}
```

## 4. 插件资源文件

### resources/ 目录

插件项目根目录下的 `resources/` 文件夹中的所有文件都会被打包进 `.atmb` 压缩包。它们在构建时嵌入，运行时通过 `PluginContext` 懒加载。

```
my-plugin/
├── src/
│   └── ...
├── resources/
│   ├── lang/
│   │   ├── zh-CN.json     ← 自动加载的语言文件
│   │   └── en-US.json
│   ├── icon.png            ← 插件自定义图标
│   └── data/
│       └── default-config.json  ← 默认配置模板
└── package.json
```

::: tip
`resources/lang/` 下的语言文件会在 `pluginMain` 调用前自动加载到 `LanguageService`，不需要手动读取。其他资源需要通过下面的 API 显式获取。
:::

### usePluginResource — React Hook

在 React 组件中，`usePluginResource` 是加载资源的最便捷方式。它返回一个包含 `data`、`loading`、`error` 三个字段的对象，自动处理异步加载状态。

```typescript
import { usePluginResource } from '@autumnbox/app';

function PluginIcon() {
  const { data, loading, error } = usePluginResource('icon.png');

  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error.message} />;
  if (!data) return <Alert type="warning" message="资源不存在" />;

  const url = URL.createObjectURL(data);
  return <img src={url} alt="插件图标" style={{ width: 64, height: 64 }} />;
}
```

加载 JSON 资源并解析：

```typescript
function DefaultConfigLoader() {
  const { data, loading } = usePluginResource('data/default-config.json');
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!data) return;
    data.text().then((text) => {
      setConfig(JSON.parse(text) as Record<string, unknown>);
    });
  }, [data]);

  if (loading) return <Spin />;
  if (!config) return null;

  return <pre>{JSON.stringify(config, null, 2)}</pre>;
}
```

### context.getResource — 命令式 API

在非 React 上下文中（如 Service 或 `pluginMain` 函数），使用 `context.getResource()` 直接获取资源。返回 `Promise<Blob | null>`，资源不存在时返回 `null`。

```typescript
export function pluginMain(context: PluginContext) {
  // 加载默认配置模板
  context.getResource('data/default-config.json').then(async (blob) => {
    if (!blob) {
      console.warn('默认配置模板缺失');
      return;
    }
    const text = await blob.text();
    const defaults = JSON.parse(text) as Record<string, unknown>;
    console.log('默认配置：', defaults);
  });
}
```

::: warning
`getResource` 的路径是相对于 `resources/` 目录的。传入 `'icon.png'` 会查找 `resources/icon.png`，不需要加前缀。如果资源不存在，返回 `null` 而不是抛出异常。
:::

## 5. 完整示例 — 设备文件管理器

下面是一个功能完整的文件管理器 App，综合运用本文介绍的所有文件系统 API：

- 浏览设备目录结构
- 下载设备文件到本地
- 上传本地文件到设备
- 支持取消传输

```typescript
// src/apps/FileManagerApp.tsx
import { useState, useRef, useCallback } from 'react';
import { Button, Table, Breadcrumb, Space, message, Progress, Upload } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  DownloadOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { defineApp } from '@autumnbox/app';

import type { IAdbFileEntry } from '@autumnbox/interfaces';
import { DeviceFileSystemService } from '@autumnbox/core';
import { useService, useRequiredDevice } from '@autumnbox/app';

function FileManagerApp() {
  const fileService = useService(DeviceFileSystemService);
  const device = useRequiredDevice();

  const [currentPath, setCurrentPath] = useState('/sdcard/');
  const [entries, setEntries] = useState<readonly IAdbFileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ── 加载目录 ──

  const loadDir = useCallback(
    async (path: string) => {
      setLoading(true);
      try {
        const result = await fileService.listDir(device, path);
        // 目录排在前面，文件在后面
        const sorted = [...result].sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) {
            return a.isDirectory ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        setEntries(sorted);
        setCurrentPath(path);
      } catch (err) {
        message.error(`无法打开目录：${String(err)}`);
      } finally {
        setLoading(false);
      }
    },
    [fileService, device],
  );

  // ── 进入子目录 ──

  const enterDir = (entry: IAdbFileEntry) => {
    if (entry.isDirectory) {
      const next = currentPath.endsWith('/')
        ? `${currentPath}${entry.name}/`
        : `${currentPath}/${entry.name}/`;
      loadDir(next);
    }
  };

  // ── 返回上级目录 ──

  const goUp = () => {
    const parts = currentPath.replace(/\/$/, '').split('/');
    if (parts.length > 1) {
      parts.pop();
      const parent = parts.join('/') + '/';
      loadDir(parent || '/');
    }
  };

  // ── 下载文件 ──

  const downloadFile = async (entry: IAdbFileEntry) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setTransferring(true);

    try {
      const chunks: Uint8Array[] = [];
      await fileService.pull(
        device,
        entry.path,
        {
          type: 'reader',
          chunkCallback: async (chunk) => {
            chunks.push(chunk);
          },
        },
        controller.signal,
      );

      // 触发浏览器下载
      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = entry.name;
      a.click();
      URL.revokeObjectURL(url);
      message.success(`${entry.name} 下载完成`);
    } catch (err) {
      if (controller.signal.aborted) {
        message.info('下载已取消');
      } else {
        message.error(`下载失败：${String(err)}`);
      }
    } finally {
      setTransferring(false);
      abortRef.current = null;
    }
  };

  // ── 上传文件 ──

  const uploadFile = async (file: File) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setTransferring(true);

    try {
      await fileService.push(
        device,
        currentPath,
        { data: file, name: file.name, size: file.size },
        controller.signal,
      );
      message.success(`${file.name} 上传完成`);
      // 刷新当前目录
      await loadDir(currentPath);
    } catch (err) {
      if (controller.signal.aborted) {
        message.info('上传已取消');
      } else {
        message.error(`上传失败：${String(err)}`);
      }
    } finally {
      setTransferring(false);
      abortRef.current = null;
    }
  };

  // ── 取消传输 ──

  const cancelTransfer = () => {
    abortRef.current?.abort();
  };

  // ── 面包屑导航 ──

  const pathParts = currentPath.split('/').filter(Boolean);
  const breadcrumbItems = [
    { title: <a onClick={() => loadDir('/')}>/</a>, key: 'root' },
    ...pathParts.map((part, i) => {
      const fullPath = '/' + pathParts.slice(0, i + 1).join('/') + '/';
      return {
        title: <a onClick={() => loadDir(fullPath)}>{part}</a>,
        key: fullPath,
      };
    }),
  ];

  // ── 文件大小格式化 ──

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${String(bytes)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // ── 表格列定义 ──

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: IAdbFileEntry) => (
        <Space>
          {record.isDirectory ? <FolderOutlined /> : <FileOutlined />}
          {record.isDirectory ? (
            <a onClick={() => enterDir(record)}>{name}</a>
          ) : (
            <span>{name}</span>
          )}
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: number, record: IAdbFileEntry) =>
        record.isDirectory ? '-' : formatSize(size),
    },
    {
      title: '修改时间',
      dataIndex: 'modifiedAt',
      key: 'modifiedAt',
      width: 200,
      render: (date?: Date) => (date ? date.toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: IAdbFileEntry) =>
        record.isDirectory ? null : (
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => downloadFile(record)}
            disabled={transferring}
          >
            下载
          </Button>
        ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      {/* 工具栏 */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={goUp}>
          上级目录
        </Button>
        <Button onClick={() => loadDir(currentPath)} loading={loading}>
          刷新
        </Button>
        <Upload
          showUploadList={false}
          beforeUpload={(file) => {
            uploadFile(file);
            return false; // 阻止 antd 默认上传行为
          }}
        >
          <Button icon={<UploadOutlined />} disabled={transferring}>
            上传文件
          </Button>
        </Upload>
        {transferring && (
          <Button danger icon={<StopOutlined />} onClick={cancelTransfer}>
            取消传输
          </Button>
        )}
      </Space>

      {/* 面包屑路径 */}
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 12 }} />

      {/* 文件列表 */}
      <Table
        dataSource={entries as IAdbFileEntry[]}
        columns={columns}
        rowKey="path"
        loading={loading}
        pagination={{ pageSize: 50 }}
        size="small"
        onRow={(record) => ({
          onDoubleClick: () => enterDir(record),
        })}
      />
    </div>
  );
}

// ── App 定义 ──

export const FileManagerAppDef = defineApp({
  id: 'file-manager',
  name: 'app.fileManager',
  icon: 'data:image/svg+xml,...', // 替换为实际图标
  shallSelectAdbDevice: true,
  component: FileManagerApp,
  tags: ['tools', 'device'],
});
```

::: tip
这个示例使用了 `shallSelectAdbDevice: true`，这意味着打开 App 时系统会先提示用户选择设备。App 内通过 `useRequiredDevice()` 获取的设备对象保证非空。
:::

## 6. 最佳实践

1. **区分两套文件系统**。设备文件操作用 `DeviceFileSystemService`，插件本地数据用 `usePluginFs()`。
2. **始终传入 AbortSignal**。文件传输可能很慢，用户应有能力取消操作。
3. **readFile 返回流**。`IFileSystem.readFile()` 返回 `ReadableStream`，用 `new Response(stream).text()` 快速获取文本内容。
4. **writeFile 接受 Blob**。写入文本时用 `new Blob([jsonString])` 包装。
5. **资源路径是相对的**。`getResource('icon.png')` 对应 `resources/icon.png`，不要写绝对路径。
6. **配置使用 JSON**。插件配置推荐用 JSON 格式存储在 `pluginHome` 下，便于读写和调试。
7. **处理 null 返回值**。`getResource()` 在资源不存在时返回 `null`，务必做空值检查。
