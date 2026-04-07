---
title: 设备管理
---

# 设备管理

本章介绍如何在 AutumnBox 插件中发现、监听和操作 Android 设备。核心 API 围绕 `DevicesService` 和 `AdbDeviceHandle` 展开，配合 React Hooks 可以轻松构建设备感知的 UI。

## 1. DevicesService 概述

`DevicesService` 是 AutumnBox 设备发现的核心服务。它通过底层 `IAdbDriver` 定期轮询已连接的设备列表，并将结果暴露为响应式的 `IReadonlyState` 属性，供 UI 层订阅。

### 获取方式

在 React 组件中，通过 `useService` Hook 获取：

```typescript
import { DevicesService } from '@autumnbox/core';
import { useService } from '@autumnbox/app';

const devicesService = useService(DevicesService);
```

在非 React 环境中（如 Service 构造函数或 `pluginMain`），通过 IoC 容器获取：

```typescript
const devicesService = container.getService(DevicesService);
```

### 核心能力

| 能力 | 说明 |
|------|------|
| 设备列表发现 | 通过 `devices` 属性获取当前已连接的所有设备 |
| 状态监听 | `devices` 是响应式的 `IReadonlyState`，设备列表变化时自动通知订阅者 |
| 手动刷新 | 调用 `refresh()` 立即拉取最新设备列表 |
| 自动轮询 | 调用 `startPolling()` 开启定时轮询，`stopPolling()` 停止 |

### 设计哲学：无全局选中设备

AutumnBox 不维护"全局选中设备"的概念。`DevicesService` 只负责发现设备，每个 App 自行决定操作哪台设备。这种设计使得多设备并行操作自然流畅。

## 2. 设备列表

### 完整类定义

```typescript
class DevicesService {
  /** 响应式的设备列表，值变化时自动通知所有订阅者 */
  readonly devices: IReadonlyState<readonly AdbDeviceHandle[]>;

  /** 立即从驱动层拉取最新设备列表 */
  async refresh(): Promise<void>;

  /** 开启定时轮询，默认间隔 2000ms */
  startPolling(intervalMs?: number): void;

  /** 停止定时轮询 */
  stopPolling(): void;
}
```

`devices` 属性的类型是 `IReadonlyState<readonly AdbDeviceHandle[]>`，这意味着：

- **只读**：插件不能直接修改设备列表，只有 `DevicesService` 内部可以更新
- **响应式**：当设备列表发生变化时，所有通过 `.subscribe()` 或 `useServiceState()` 订阅的代码都会收到通知
- **不可变数组**：使用 `readonly AdbDeviceHandle[]`，确保消费者不会意外修改列表内容

### 在 React 中订阅设备列表

最常用的方式是配合 `useServiceState` Hook：

```tsx
import { DevicesService } from '@autumnbox/core';
import { useService, useServiceState } from '@autumnbox/app';

const MyDeviceList: React.FC = () => {
  const devicesService = useService(DevicesService);
  const [devices] = useServiceState(devicesService.devices);

  return (
    <ul>
      {devices.map((device) => (
        <li key={device.sn}>{device.sn}</li>
      ))}
    </ul>
  );
};
```

`useServiceState` 内部通过 `useState` + `subscribe` 实现，当设备列表变化时自动触发 React 重渲染。返回值是一个元组 `[value]`，因为 `devices` 是只读状态，不提供 setter。

### 在非 React 环境中订阅

如果你在 Service、`pluginMain` 或其他非 React 代码中需要监听设备变化：

```typescript
const devicesService = container.getService(DevicesService);

// subscribe 返回取消订阅函数
const unsubscribe = devicesService.devices.subscribe((devices) => {
  console.log('设备列表已更新:', devices.length, '台设备');
  for (const device of devices) {
    console.log(`  - ${device.sn}`);
  }
});

// 不再需要时取消订阅
unsubscribe();
```

### 手动刷新

通常 `DevicesService` 通过 `startPolling()` 自动刷新设备列表（宿主启动时已调用）。但有时你需要手动触发刷新，例如用户点击"刷新"按钮：

```typescript
await devicesService.refresh();
```

`refresh()` 是一个异步方法，完成后 `devices` 的值会更新，所有订阅者会收到通知。

## 3. AdbDeviceHandle

`AdbDeviceHandle` 是 AutumnBox 中表示一台 Android 设备的轻量级句柄类型。它是所有设备操作 API 的入口——你需要持有一个 Handle 才能对设备执行命令。

### 类型定义

```typescript
type AdbDeviceHandle = Readonly<{
  sn: string;
}>;
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `sn` | `string` | 设备序列号（Serial Number），是设备的唯一标识符 |

### 关键特性

- **不可变**：`AdbDeviceHandle` 使用 `Readonly<>` 包裹，你不能修改它的任何属性
- **轻量级**：Handle 只包含标识信息，不持有连接或资源，可以安全地传递和存储
- **Handle-first API**：AutumnBox 的所有设备操作方法都以 Handle 作为第一个参数，如 `shell.exec(device, command)`

### 序列号格式

`sn` 字段的值取决于连接方式：

- **USB 连接**：形如 `ABCDEF123456`（制造商分配的序列号）
- **WiFi 连接**：形如 `192.168.1.100:5555`（IP 地址和端口）
- **WebUSB 连接**：浏览器环境下的设备标识符

### 获取设备详细信息

Handle 本身只有序列号，若需要获取设备的系统版本、CPU 架构等详细信息，可以使用 `IAdbDriver.getDeviceInfo()`：

```typescript
import { DriverService } from '@autumnbox/core';

const driver = container.getService(DriverService).getAdbDriver();
const info = await driver.getDeviceInfo(device);
// info.sdk     — API Level (如 34)
// info.release — Android 版本 (如 "14")
// info.abi     — CPU 架构 (如 "arm64-v8a")
// info.device  — 设备代号 (如 "oriole")
```

## 4. useRequiredDevice

在很多 App 中，设备是必需的前提条件——没有设备就无法正常工作。`useRequiredDevice` Hook 专为这种场景设计。

### 基本用法

```typescript
import { useRequiredDevice } from '@autumnbox/app';

const MyDeviceApp: React.FC = () => {
  const device = useRequiredDevice();
  // device 保证非 null，可以直接使用
  return <div>当前设备: {device.sn}</div>;
};
```

### 工作原理

`useRequiredDevice` 从 App 的运行时上下文中获取目标设备。它的前提是你的 App 定义中设置了 `shallSelectAdbDevice: true`：

```typescript
import { defineApp } from '@autumnbox/sdk';

export const MyDeviceApp = defineApp({
  id: 'my-device-app',
  name: 'app.name.my_device',
  icon: myIcon,
  shallSelectAdbDevice: true,  // 关键：要求用户先选择设备
  component: MyDeviceAppView,
});
```

当 `shallSelectAdbDevice` 为 `true` 时，用户点击 App 图标后：

1. 如果有多台设备连接，弹出设备选择器
2. 如果只有一台设备，自动选中
3. 如果没有设备，显示警告提示，不会打开 App

选中的设备通过 `AppProps.targetDevice` 传递给 App 组件，`useRequiredDevice` 从中读取。

### 安全保证

`useRequiredDevice` 返回类型是 `AdbDeviceHandle`（不是 `AdbDeviceHandle | undefined`），因此你可以放心地直接使用，无需 null 检查。如果由于某种异常原因设备不存在，Hook 会 throw 错误，由插件的 ErrorBoundary 捕获并显示友好提示。

### 适用场景

| 场景 | 是否使用 |
|------|----------|
| App 必须操作某台特定设备 | 使用 `useRequiredDevice` |
| App 需要展示所有设备列表 | 使用 `DevicesService.devices` |
| App 不涉及设备操作 | 都不需要 |

## 5. useRequestDevice

`useRequestDevice` 用于触发浏览器的 WebUSB 设备配对流程。这是 Web 平台特有的需求——浏览器出于安全考虑，要求用户主动授权才能访问 USB 设备。

### 基本用法

```typescript
import { useRequestDevice } from '@autumnbox/app';

const PairDeviceButton: React.FC = () => {
  const requestDevice = useRequestDevice();

  // requestDevice 可能为 null（在 Tauri 桌面端不需要配对流程）
  if (!requestDevice) {
    return null;
  }

  return (
    <button onClick={() => void requestDevice()}>
      配对新设备
    </button>
  );
};
```

### 返回值

```typescript
function useRequestDevice(): RequestDeviceFn | null;

type RequestDeviceFn = () => Promise<void>;
```

- **返回函数**：在 WebUSB 环境中，返回一个异步函数，调用后弹出浏览器原生的 USB 设备选择对话框
- **返回 `null`**：在 Tauri 桌面端，设备管理走本地 adb CLI，不需要 WebUSB 配对，此时返回 `null`

### 平台差异处理

编写跨平台插件时，务必检查 `requestDevice` 是否为 `null`：

```tsx
const requestDevice = useRequestDevice();

return (
  <div>
    {requestDevice && (
      <Button onClick={() => void requestDevice()}>
        添加 USB 设备
      </Button>
    )}
    <p>
      {requestDevice
        ? '点击上方按钮通过 WebUSB 配对设备'
        : '桌面端通过本地 ADB 自动发现设备'}
    </p>
  </div>
);
```

### WebUSB 配对流程

当用户点击配对按钮后：

1. 浏览器弹出 USB 设备选择器
2. 用户从列表中选择 Android 设备
3. 配对完成后，设备出现在 `DevicesService.devices` 列表中
4. 后续刷新页面时，浏览器可能记住授权（取决于浏览器实现）

::: tip
WebUSB 要求页面运行在 HTTPS 或 `localhost` 下。在开发环境中，Vite 的 `localhost:5173` 天然满足条件。
:::

## 6. 完整示例：设备列表 App

下面是一个功能完整的设备列表 App，展示了本章介绍的所有 API 的实际用法。

### 功能清单

- 显示所有已连接设备的序列号和系统信息
- 通过 shell 命令获取每台设备的电量信息
- 提供手动刷新按钮
- 在 Web 端显示设备配对按钮
- 对不同设备状态显示相应的 UI 提示

### App 定义

```typescript
// src/apps/DeviceListApp.tsx
import { defineApp } from '@autumnbox/sdk';
import deviceListIcon from '../assets/device_list.png';
import { DeviceListView } from './DeviceListView';

export const DeviceListApp = defineApp({
  id: 'device-list',
  name: 'app.name.device_list',
  icon: deviceListIcon,
  singleton: true,
  tags: ['tools', 'device'],
  component: DeviceListView,
  // 注意：这里不设置 shallSelectAdbDevice，因为本 App 展示所有设备
});
```

### 组件实现

```tsx
// src/apps/DeviceListView.tsx
import { useCallback, useEffect, useState } from 'react';
import { Button, Card, List, Space, Tag, Typography, Empty, Spin } from 'antd';
import { ReloadOutlined, UsbOutlined } from '@ant-design/icons';

import { DevicesService, DriverService, ShellService } from '@autumnbox/core';
import { useService, useServiceState, useRequestDevice, useShell } from '@autumnbox/app';

import type { AdbDeviceHandle, IAdbDeviceInfo } from '@autumnbox/interfaces';

const { Text, Title } = Typography;

/** 单台设备的详细信息（异步加载） */
interface DeviceDetail {
  info: IAdbDeviceInfo | null;
  battery: number | null;
  loading: boolean;
}

const DeviceListView: React.FC = () => {
  const devicesService = useService(DevicesService);
  const driverService = useService(DriverService);
  const shell = useShell();
  const requestDevice = useRequestDevice();

  const [devices] = useServiceState(devicesService.devices);
  const [details, setDetails] = useState<Record<string, DeviceDetail>>({});
  const [refreshing, setRefreshing] = useState(false);

  // 获取单台设备的详细信息
  const fetchDeviceDetail = useCallback(
    async (device: AdbDeviceHandle): Promise<DeviceDetail> => {
      try {
        const driver = driverService.getAdbDriver();
        const info = await driver.getDeviceInfo(device);

        // 通过 shell 命令获取电量
        let battery: number | null = null;
        try {
          const result = await shell.exec(device, 'dumpsys battery');
          const match = /level:\s*(\d+)/.exec(result.stdout);
          if (match?.[1]) {
            battery = parseInt(match[1], 10);
          }
        } catch {
          // 电量获取失败不影响其他信息
        }

        return { info, battery, loading: false };
      } catch {
        return { info: null, battery: null, loading: false };
      }
    },
    [driverService, shell],
  );

  // 设备列表变化时，加载每台设备的详情
  useEffect(() => {
    for (const device of devices) {
      if (!details[device.sn]) {
        setDetails((prev) => ({
          ...prev,
          [device.sn]: { info: null, battery: null, loading: true },
        }));
        void fetchDeviceDetail(device).then((detail) => {
          setDetails((prev) => ({ ...prev, [device.sn]: detail }));
        });
      }
    }
  }, [devices, details, fetchDeviceDetail]);

  // 手动刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setDetails({}); // 清空缓存，重新加载
    await devicesService.refresh();
    setRefreshing(false);
  }, [devicesService]);

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 标题栏 */}
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            已连接设备
          </Title>
          <Tag color="blue">{devices.length} 台</Tag>
          <Button
            icon={<ReloadOutlined />}
            loading={refreshing}
            onClick={() => void handleRefresh()}
          >
            刷新
          </Button>
          {requestDevice && (
            <Button
              icon={<UsbOutlined />}
              onClick={() => void requestDevice()}
            >
              配对新设备
            </Button>
          )}
        </Space>

        {/* 设备列表 */}
        {devices.length === 0 ? (
          <Empty description="未检测到已连接的设备" />
        ) : (
          <List
            dataSource={[...devices]}
            renderItem={(device) => {
              const detail = details[device.sn];
              return (
                <Card
                  key={device.sn}
                  size="small"
                  style={{ marginBottom: 12 }}
                >
                  <Space direction="vertical" size="small">
                    <Space>
                      <Text strong>序列号:</Text>
                      <Text code>{device.sn}</Text>
                    </Space>

                    {detail?.loading ? (
                      <Spin size="small" />
                    ) : detail?.info ? (
                      <>
                        <Space>
                          <Text strong>Android 版本:</Text>
                          <Text>{detail.info.release ?? '未知'}</Text>
                          {detail.info.sdk !== null && (
                            <Tag>API {detail.info.sdk}</Tag>
                          )}
                        </Space>
                        <Space>
                          <Text strong>CPU 架构:</Text>
                          <Text>{detail.info.abi ?? '未知'}</Text>
                        </Space>
                        <Space>
                          <Text strong>设备代号:</Text>
                          <Text>{detail.info.device ?? '未知'}</Text>
                        </Space>
                        {detail.battery !== null && (
                          <Space>
                            <Text strong>电量:</Text>
                            <Text
                              type={detail.battery < 20 ? 'danger' : undefined}
                            >
                              {detail.battery}%
                            </Text>
                          </Space>
                        )}
                      </>
                    ) : (
                      <Text type="secondary">无法获取设备信息</Text>
                    )}
                  </Space>
                </Card>
              );
            }}
          />
        )}
      </Space>
    </div>
  );
};

export { DeviceListView };
```

### 代码解析

1. **设备发现**：通过 `useServiceState(devicesService.devices)` 订阅设备列表，设备插拔时 UI 自动更新
2. **设备信息**：通过 `IAdbDriver.getDeviceInfo()` 获取系统版本、CPU 架构等
3. **电量获取**：通过 `useShell().exec()` 执行 `dumpsys battery` 命令并解析输出
4. **平台适配**：`useRequestDevice()` 在桌面端返回 `null` 时隐藏配对按钮
5. **手动刷新**：调用 `devicesService.refresh()` 重新拉取设备列表

## 7. 多设备操作

AutumnBox 的 Handle-first API 天然支持多设备并行操作。每个 API 调用都需要显式传入 `AdbDeviceHandle`，不存在"当前设备"的隐式状态，因此对多台设备执行操作只需要遍历设备列表。

### 基本模式

```typescript
import { DevicesService, ShellService } from '@autumnbox/core';
import { useService, useServiceState, useShell } from '@autumnbox/app';

const MultiDeviceExample: React.FC = () => {
  const devicesService = useService(DevicesService);
  const [devices] = useServiceState(devicesService.devices);
  const shell = useShell();

  const getVersions = async () => {
    for (const device of devices) {
      const result = await shell.exec(
        device,
        'getprop ro.build.version.release',
      );
      console.log(`${device.sn}: Android ${result.stdout.trim()}`);
    }
  };

  return <button onClick={() => void getVersions()}>查询所有设备版本</button>;
};
```

### 并行执行

如果操作之间互相独立，可以使用 `Promise.all` 并行执行：

```typescript
const getAllBatteryLevels = async () => {
  const results = await Promise.all(
    devices.map(async (device) => {
      const result = await shell.exec(device, 'dumpsys battery');
      const match = /level:\s*(\d+)/.exec(result.stdout);
      return {
        sn: device.sn,
        battery: match?.[1] ? parseInt(match[1], 10) : null,
      };
    }),
  );

  // results: Array<{ sn: string; battery: number | null }>
  for (const r of results) {
    console.log(`${r.sn}: ${r.battery !== null ? `${r.battery}%` : '未知'}`);
  }
};
```

### 多设备批量安装

一个更实际的例子——批量安装 APK 到所有设备：

```typescript
import { DeviceFileSystemService } from '@autumnbox/core';

const installToAll = async (
  fileService: DeviceFileSystemService,
  devices: readonly AdbDeviceHandle[],
  apkPath: string,
) => {
  const results: Array<{ sn: string; success: boolean; error?: string }> = [];

  for (const device of devices) {
    try {
      // 推送 APK 到设备
      const driver = driverService.getAdbDriver();
      await driver.push(device, '/data/local/tmp/', apkPath);

      // 执行安装命令
      const result = await shell.exec(
        device,
        'pm install /data/local/tmp/' + apkPath.split('/').pop(),
      );
      results.push({
        sn: device.sn,
        success: result.stdout.includes('Success'),
      });
    } catch (err) {
      results.push({
        sn: device.sn,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
};
```

### Handle-first 模式的优势

与"全局选中设备"模式相比，Handle-first 的优势在于：

| 全局选中设备模式 | Handle-first 模式 |
|------------------|-------------------|
| 每次操作前需要切换选中设备 | 每次调用直接指定目标设备 |
| 并行操作时需要额外同步 | 天然支持并行，无状态冲突 |
| 多标签页可能抢占选中状态 | 每个标签页独立持有自己的 Handle |
| 隐式依赖全局状态 | 依赖关系通过参数显式传递 |

## 8. 常见模式与最佳实践

### 设备连接状态提示

在 App 中友好地处理"无设备"场景：

```tsx
import { DevicesService } from '@autumnbox/core';
import { useService, useServiceState, useRequestDevice } from '@autumnbox/app';
import { Empty, Button } from 'antd';

const DeviceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const devicesService = useService(DevicesService);
  const [devices] = useServiceState(devicesService.devices);
  const requestDevice = useRequestDevice();

  if (devices.length === 0) {
    return (
      <Empty description="请连接 Android 设备">
        {requestDevice && (
          <Button type="primary" onClick={() => void requestDevice()}>
            配对 USB 设备
          </Button>
        )}
      </Empty>
    );
  }

  return <>{children}</>;
};
```

### 清理订阅

在 `pluginMain` 中订阅设备变化时，记得在清理函数中取消订阅：

```typescript
import type { PluginContext } from '@autumnbox/sdk';
import { DevicesService } from '@autumnbox/core';

export function pluginMain(context: PluginContext): () => void {
  const devicesService = context.getService(DevicesService);

  const unsubscribe = devicesService.devices.subscribe((devices) => {
    console.log('设备数量变化:', devices.length);
  });

  // 插件卸载时清理
  return () => {
    unsubscribe();
  };
}
```

### useShell 获取设备属性

`useShell` 返回的 `ShellHelper` 提供了带退出码的命令执行，适合需要检测命令是否成功的场景：

```typescript
const shell = useShell();

// exec 返回 { stdout, exitCode }
const result = await shell.exec(device, 'getprop ro.debuggable');
if (result.exitCode === 0 && result.stdout.trim() === '1') {
  console.log('设备已开启调试模式');
}

// execOrThrow 在退出码非零时抛出异常
try {
  const output = await shell.execOrThrow(device, 'ls /data/local/tmp/');
  console.log('文件列表:', output);
} catch (err) {
  console.error('命令执行失败:', err);
}
```

## 小结

| API | 用途 | 场景 |
|-----|------|------|
| `DevicesService.devices` | 响应式设备列表 | 展示所有已连接设备 |
| `DevicesService.refresh()` | 手动刷新设备列表 | 用户点击刷新按钮 |
| `useServiceState(devices)` | React 中订阅设备列表 | 设备感知的 UI 组件 |
| `devices.subscribe()` | 非 React 中订阅设备列表 | Service 或 pluginMain |
| `useRequiredDevice()` | 获取保证非 null 的设备 | 单设备操作的 App |
| `useRequestDevice()` | WebUSB 设备配对 | Web 端添加新设备 |
| `useShell()` | 执行 shell 命令 | 获取设备信息、执行操作 |
| `IAdbDriver.getDeviceInfo()` | 获取设备系统信息 | 展示 Android 版本、CPU 架构等 |

下一步，可以继续阅读 [Shell 操作指南](../guide-shell/) 了解更多命令执行的细节，或查看 [文件系统指南](../guide-filesystem/) 学习如何在设备上读写文件。
