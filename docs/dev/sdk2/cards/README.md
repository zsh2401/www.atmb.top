---
title: Card
---

# Card

## 概念

Card（卡片）是 AutumnBox 首页侧边栏中的仪表盘小组件。每个 Card 占据侧边栏的一个区域，用于展示摘要信息、实时状态或快捷操作按钮。

与 App 不同，Card **不需要用户主动打开**——只要插件被加载，其注册的 Card 就会始终显示在首页侧边栏中。Card 没有独立的标签页，也不支持设备选择弹窗，更像是一个始终可见的 widget。

### Card 在 UI 中的位置

```
┌──────────────────────────────────────────────────────┐
│  AutumnBox                                           │
├──────────┬───────────────────────────────────────────┤
│ 侧边栏    │  标签页内容区                                │
│          │                                           │
│ [设备列表] │  ┌─────────────────────────────────────┐  │
│          │  │                                     │  │
│ ── Cards ── │  │           App 内容                  │  │
│ ┌────────┐ │  │                                     │  │
│ │电池状态 │ │  │                                     │  │
│ │ 87% ⚡ │ │  │                                     │  │
│ └────────┘ │  │                                     │  │
│ ┌────────┐ │  │                                     │  │
│ │设备状态 │ │  │                                     │  │
│ │CPU 12% │ │  │                                     │  │
│ └────────┘ │  └─────────────────────────────────────┘  │
│ ┌────────┐ │                                           │
│ │快速重启 │ │                                           │
│ │[系统][R]│ │                                           │
│ └────────┘ │                                           │
└──────────┴───────────────────────────────────────────┘
```

Card 位于侧边栏的设备列表下方，以垂直列表的方式排列。每个 Card 被包裹在一个 Ant Design `<Card>` 容器中，由宿主应用统一管理样式和错误边界。

## 创建一个 Card

### 目录结构

Card 文件放在插件的 `src/cards/` 目录下：

```
my-plugin/
└── src/
    ├── cards/
    │   ├── BatteryCard.tsx          # 单文件方式
    │   ├── DeviceStatusCard.tsx
    │   └── RebootCard/
    │       └── index.tsx            # 目录方式（适合复杂 Card）
    └── apps/
        └── ...
```

### 最小示例

```tsx
// src/cards/HelloCard.tsx
import type { AutumnCard } from '@autumnbox/sdk';

const HelloCardView: React.FC = () => {
  return <div style={{ textAlign: 'center', padding: 8 }}>Hello, AutumnBox!</div>;
};

export const HelloCard: AutumnCard = {
  id: 'hello',
  name: 'card.name.hello',
  component: HelloCardView,
};
```

就这么多。`autumnbox-sdk build` 会自动扫描 `src/cards/`，找到 `export const HelloCard`，在 `src/__entry__.ts` 中生成注册代码。插件加载后，Card 自动显示在首页侧边栏。

## 完整类型定义

`AutumnCard` 是一个**判别联合类型（discriminated union）**，支持 React 组件模式和自定义 DOM 挂载模式：

```typescript
/** Card 基础字段 */
interface ICardBase {
  /** Card 唯一标识符 */
  id: string;

  /** 显示名称（支持 i18n key） */
  name: string;
}

/**
 * AutumnCard — 统一的 Card 定义类型。
 * 提供 `component`（React 模式）或 `mount`（自定义 DOM 模式），二选一。
 */
type AutumnCard = ICardBase &
  (
    | { component: React.FC; mount?: undefined }
    | { mount: (container: HTMLElement) => () => void; component?: undefined }
  );
```

这是一个排他联合：你要么提供 `component`（React 组件），要么提供 `mount`（手动 DOM 挂载函数），不能同时提供两者。TypeScript 编译器会在编译时检查这一约束。

## 字段参考表

| 属性 | 类型 | 必须 | 说明 |
|------|------|:----:|------|
| `id` | `string` | ✅ | 唯一标识符。在同一插件内不可重复，建议使用 kebab-case（如 `"battery"`、`"device-status"`） |
| `name` | `string` | ✅ | 显示名称。支持 i18n key（如 `"card.name.battery"`），会经过翻译系统解析 |
| `component` | `React.FC` | ✅* | React 组件。**不接收任何 props**，通过 hooks 获取数据 |
| `mount` | `(container: HTMLElement) => () => void` | ✅* | 自定义 DOM 挂载函数。接收容器元素，返回 dispose 函数用于清理 |

> \* `component` 和 `mount` 二选一，必须提供其中之一。

与 App 相比，Card **没有**以下属性：

- 没有 `icon` — Card 标题由宿主容器管理
- 没有 `singleton` — Card 始终只有一个实例
- 没有 `shallSelectAdbDevice` — Card 不绑定特定设备
- 没有 `tags` — Card 无需分类筛选

## React 模式（推荐）

绝大多数 Card 应使用 React 模式。Card 组件**不接收 props**，所有数据通过 hooks 从服务获取。

### 完整示例：电池状态卡片

以下示例展示了一个功能完整的电池状态 Card，包含设备遍历、轮询数据、错误处理和响应式状态：

```tsx
// src/cards/BatteryCard.tsx
import type { AutumnCard } from '@autumnbox/sdk';
import type { AdbDeviceHandle } from '@autumnbox/sdk/core';

import { ThunderboltOutlined } from '@ant-design/icons';
import { useService, useServiceState } from '@autumnbox/sdk/app';
import { DevicesService, ShellService } from '@autumnbox/sdk/core';
import { List, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Text } = Typography;

interface BatteryInfo {
  level: number;
  status: 'charging' | 'discharging' | 'full';
  temperature: number;
}

function parseBatteryDump(output: string): BatteryInfo | null {
  const levelMatch = /level:\s*(\d+)/i.exec(output);
  const statusMatch = /status:\s*(\d+)/i.exec(output);
  const tempMatch = /temperature:\s*(\d+)/i.exec(output);
  if (!levelMatch || !statusMatch || !tempMatch) return null;

  const statusCode = Number(statusMatch[1]);
  const status = statusCode === 2 ? 'charging' : statusCode === 5 ? 'full' : 'discharging';

  return {
    level: Number(levelMatch[1]),
    status,
    temperature: Number(tempMatch[1]) / 10,
  };
}

/** 单个设备的电池行 */
function DeviceRow({ device }: { device: AdbDeviceHandle }): React.JSX.Element {
  const shellService = useService(ShellService);
  const [battery, setBattery] = useState<BatteryInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchBattery = async (): Promise<void> => {
      try {
        const output = await shellService.exec(device, 'dumpsys battery');
        if (!cancelled) setBattery(parseBatteryDump(output));
      } catch {
        if (!cancelled) setBattery(null);
      }
    };

    void fetchBattery();
    const interval = setInterval(() => void fetchBattery(), 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [device, shellService]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Text ellipsis style={{ flex: 1 }}>{device.sn}</Text>
      {battery ? (
        <>
          <Text strong style={{ color: battery.level > 20 ? '#52c41a' : '#ff4d4f' }}>
            {battery.level}%
          </Text>
          {battery.status === 'charging' && (
            <ThunderboltOutlined style={{ color: '#faad14' }} />
          )}
          <Text type="secondary">{battery.temperature}°C</Text>
        </>
      ) : (
        <Text type="secondary">--</Text>
      )}
    </div>
  );
}

/** Card 主组件 */
const BatteryCardView: React.FC = () => {
  const devicesService = useService(DevicesService);
  const [devices] = useServiceState(devicesService, 'devices');

  if (devices.length === 0) {
    return (
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 16 }}>
        未连接设备
      </Text>
    );
  }

  return (
    <List
      size="small"
      dataSource={devices as AdbDeviceHandle[]}
      renderItem={(device) => (
        <List.Item key={device.sn} style={{ padding: '6px 0' }}>
          <DeviceRow device={device} />
        </List.Item>
      )}
    />
  );
};

export const BatteryCard: AutumnCard = {
  id: 'battery',
  name: 'card.name.battery',
  component: BatteryCardView,
};
```

::: tip 组件名约定
Card 组件名建议使用 `XxxCardView` 后缀（如 `BatteryCardView`），**不要**以 `Card` 结尾。导出常量才以 `Card` 结尾（如 `BatteryCard`），否则构建系统的正则匹配会产生误判。
:::

## 自定义 DOM 模式

如果你不使用 React（例如需要集成 Canvas、WebGL、或第三方 DOM 库），可以使用 `mount` 模式：

```tsx
// src/cards/CanvasCard.tsx
import type { AutumnCard } from '@autumnbox/sdk';

export const CanvasCard: AutumnCard = {
  id: 'canvas-monitor',
  name: 'card.name.canvas_monitor',
  mount(container: HTMLElement): () => void {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;
    canvas.style.width = '100%';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    let animationId: number;
    let offset = 0;

    function draw(): void {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1677ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = 50 + Math.sin((x + offset) * 0.05) * 30;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      offset += 2;
      animationId = requestAnimationFrame(draw);
    }

    draw();

    // 返回 dispose 函数：清理动画和 DOM
    return () => {
      cancelAnimationFrame(animationId);
      container.removeChild(canvas);
    };
  },
};
```

::: warning mount 模式的注意事项
- `mount` 函数**必须**返回一个 dispose 函数，用于清理所有副作用（移除 DOM 节点、取消定时器、断开事件监听等）
- 宿主会在插件卸载或页面关闭时调用 dispose 函数
- `mount` 模式下无法使用 React hooks（如 `useService`、`useServiceState`），需要通过其他方式获取服务
:::

## 在 Card 中使用服务

Card 组件不接收 props，所有数据和功能通过 hooks 从 IoC 容器获取。

### useService — 获取服务实例

```tsx
import { useService } from '@autumnbox/sdk/app';
import { DevicesService, ShellService } from '@autumnbox/sdk/core';

const MyCardView: React.FC = () => {
  const devicesService = useService(DevicesService);
  const shellService = useService(ShellService);
  // ...
};
```

`useService` 从 IoC 容器中解析服务单例。服务实例在整个应用生命周期内保持不变。

### useServiceState — 订阅响应式状态

```tsx
import { useService, useServiceState } from '@autumnbox/sdk/app';
import { DevicesService } from '@autumnbox/sdk/core';

const MyCardView: React.FC = () => {
  const devicesService = useService(DevicesService);

  // 方式一：服务实例 + 属性名
  const [devices] = useServiceState(devicesService, 'devices');

  // 方式二：直接传入 IReadonlyState 对象
  const [devices2] = useServiceState(devicesService.devices);

  // 方式三：服务类 + 属性名（自动解析实例）
  const [devices3] = useServiceState(DevicesService, 'devices');
};
```

`useServiceState` 订阅一个 `IReadonlyState<V>` 并在值变化时触发重渲染。三种调用方式效果一致，选择你偏好的风格。

### useT — 国际化翻译

```tsx
import { useT } from '@autumnbox/sdk/app';

const MyCardView: React.FC = () => {
  const title = useT('card.title.my_card');
  const description = useT('card.description.my_card');

  return (
    <div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
};
```

`useT` 返回翻译后的字符串，当用户切换语言时自动更新。翻译 key 在 `resources/lang/{locale}.json` 中定义。

### 完整示例：订阅设备列表

```tsx
// src/cards/DeviceStatusCard.tsx
import type { AutumnCard } from '@autumnbox/sdk';
import type { AdbDeviceHandle } from '@autumnbox/sdk/core';

import { MobileOutlined } from '@ant-design/icons';
import { useService, useServiceState, useT } from '@autumnbox/sdk/app';
import { DevicesService } from '@autumnbox/sdk/core';
import { Tag, Typography } from 'antd';

const { Text } = Typography;

const DeviceStatusCardView: React.FC = () => {
  const devicesService = useService(DevicesService);
  const [devices] = useServiceState(devicesService, 'devices');
  const title = useT('card.title.device_status');
  const noDevices = useT('card.no_devices');

  if (devices.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <MobileOutlined style={{ fontSize: 24, opacity: 0.2 }} />
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          {noDevices}
        </Text>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {(devices as AdbDeviceHandle[]).map((d) => (
        <Tag key={d.sn} color={d.state === 'device' ? 'green' : 'red'}>
          {d.sn}
        </Tag>
      ))}
    </div>
  );
};

export const DeviceStatusCard: AutumnCard = {
  id: 'device-status',
  name: 'card.name.device_status',
  component: DeviceStatusCardView,
};
```

## 响应式状态原语

Card 的数据驱动依赖 AutumnBox 的响应式状态系统。理解这套机制有助于正确使用 `useServiceState`。

### IReadonlyState 接口

```typescript
/**
 * 只读响应式状态。消费者只能读取和订阅。
 */
interface IReadonlyState<V> {
  /** 当前值 */
  readonly value: V;

  /**
   * 订阅值变化。
   * @param listener 值变化时的回调
   * @returns 取消订阅函数
   */
  subscribe(listener: (value: V) => void): () => void;
}
```

### IState 接口（可写）

```typescript
/**
 * 可变响应式状态，继承 IReadonlyState。
 * 服务内部使用，通常不暴露给外部。
 */
interface IState<V> extends IReadonlyState<V> {
  value: V; // 可读可写
}
```

### 创建状态

```typescript
import { createReadonlyState } from '@autumnbox/common';

// 创建只读状态 + 私有 setter（类似 React 的 useState）
const [state, setState] = createReadonlyState<number>(0);

state.value;              // 0
state.subscribe((v) => console.log('changed:', v));
setState(42);             // 触发所有订阅者
```

### useServiceState 内部机制

`useServiceState` 的核心实现原理非常简洁：

```typescript
function useServiceState<V>(state: IReadonlyState<V>): [V] {
  const [value, setValue] = useState(state.value);
  useEffect(() => state.subscribe(setValue), [state]);
  return [value];
}
```

它做了三件事：
1. 用 `useState` 保存当前值
2. 用 `useEffect` 订阅状态变化，变化时调用 `setValue` 触发 React 重渲染
3. 组件卸载时，`subscribe` 返回的 unsubscribe 函数自动清理订阅

如果状态是可写的 `IState<V>`，`useServiceState` 会返回 `[value, setter]` 元组，类似 React 的 `useState`。

## 命名约定

| 规则 | 说明 | 示例 |
|------|------|------|
| 文件位置 | `src/cards/` 目录 | `src/cards/BatteryCard.tsx` |
| 目录方式 | 支持子目录 + `index.tsx` | `src/cards/BatteryCard/index.tsx` |
| 导出名 | **必须**以 `Card` 结尾 | `export const BatteryCard` |
| 组件名 | **不要**以 `Card` 结尾 | `BatteryCardView`、`BatteryPanel` |
| id | 推荐 kebab-case | `"battery"`、`"device-status"` |
| name | 推荐 i18n key 格式 | `"card.name.battery"` |

构建系统使用以下正则匹配导出：

```
export\s+const\s+(\w+Card)\b
```

这意味着：
- `export const BatteryCard` — 会被发现
- `export const batteryCard` — 不会被发现（首字母未大写不匹配 `\w+Card`... 实际上 `\w` 包含小写字母，也会匹配。但按照约定应使用 PascalCase）
- `const BatteryCard = ...` 然后 `export { BatteryCard }` — **不会被发现**（必须是 `export const` 直接导出）
- `export default BatteryCard` — **不会被发现**（必须是具名导出）

::: danger 常见错误
如果你的 React 组件名以 `Card` 结尾（如 `export const BatteryCard: React.FC = ...`），构建系统会尝试将其作为 `AutumnCard` 注册，导致运行时错误。请确保只有 `AutumnCard` 类型的对象以 `Card` 结尾。
:::

## 自动发现机制

### 构建流程

当运行 `autumnbox-sdk build` 时：

1. **扫描** — 构建系统递归扫描 `src/cards/` 目录下的所有 `.ts` / `.tsx` 文件
2. **匹配** — 对每个文件，用正则 `export\s+const\s+(\w+Card)\b` 查找所有匹配的具名导出
3. **生成** — 在 `src/__entry__.ts` 中生成 import 语句和注册代码
4. **构建** — Vite 以 `__entry__.ts` 为入口，构建 UMD bundle
5. **打包** — 生成 `.atmb` 文件

### 生成的入口代码

假设插件有两个 Card 和一个 App，生成的 `src/__entry__.ts` 类似：

```typescript
// 此文件由 autumnbox-sdk build 自动生成，请勿手动修改。
import type { PluginContext } from '@autumnbox/sdk';

import { ShellApp } from './apps/ShellApp';
import { BatteryCard } from './cards/BatteryCard';
import { RebootCard } from './cards/RebootCard';

export function __autumnbox_entry__(context: PluginContext): () => void {
  const disposers: Array<() => void> = [];

  // Apps
  disposers.push(context.registerApp(ShellApp));

  // Cards
  disposers.push(context.registerCard(BatteryCard, RebootCard));

  return () => {
    for (const dispose of disposers) dispose();
  };
}
```

`context.registerCard()` 是 `PluginContext` 提供的便捷方法，它在内部调用 `CardService.register()` 并自动填充 `source`（插件 id）。返回的 dispose 函数在插件卸载时取消注册。

### dist/package.json 元数据

构建完成后，`dist/package.json` 中会包含发现的 Card 信息：

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "autumnbox": {
    "cards": [
      { "export": "BatteryCard" },
      { "export": "RebootCard" }
    ]
  }
}
```

## Card 与 App 对比

| 特性 | App | Card |
|------|-----|------|
| **显示位置** | 标签页（Tab） | 首页侧边栏 |
| **打开方式** | 用户从应用列表点击打开 | 始终显示，无需操作 |
| **实例数** | 可以多实例（非 singleton 时） | 始终单实例 |
| **设备绑定** | 支持 `shallSelectAdbDevice` | 不支持，自行获取设备列表 |
| **图标** | 必须提供 `icon` | 无 `icon` 属性 |
| **分类标签** | 支持 `tags` | 无 `tags` |
| **组件 Props** | `React.FC<AppProps>` | `React.FC`（无 props） |
| **数据获取** | Props + hooks | 仅 hooks |
| **文件位置** | `src/apps/` | `src/cards/` |
| **导出名后缀** | `App` | `Card` |
| **典型用途** | 完整功能界面、交互式工具 | 状态摘要、快捷操作、实时监控 |
| **自定义 DOM** | 支持 `mount` | 支持 `mount` |

## 完整实战示例

### 示例一：设备连接状态卡片

展示所有已连接设备的 CPU 和内存使用率，点击可跳转到设备详情：

```tsx
// src/cards/DeviceStatusCard.tsx
import type { AutumnCard } from '@autumnbox/sdk';
import type { AdbDeviceHandle } from '@autumnbox/sdk/core';

import { MobileOutlined } from '@ant-design/icons';
import { useNavigation, useService, useServiceState, useT } from '@autumnbox/sdk/app';
import { DevicesService, ShellService } from '@autumnbox/sdk/core';
import { List, Progress, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Text } = Typography;

function parseCpuUsage(output: string): number {
  const match = /([\d.]+)%\s*TOTAL/i.exec(output);
  return match ? Math.round(Number(match[1])) : 0;
}

function parseMemUsage(output: string): number {
  const totalMatch = /MemTotal:\s*(\d+)/i.exec(output);
  const availMatch = /MemAvailable:\s*(\d+)/i.exec(output);
  if (!totalMatch || !availMatch) return 0;
  const total = Number(totalMatch[1]);
  const available = Number(availMatch[1]);
  return total === 0 ? 0 : Math.round(((total - available) / total) * 100);
}

function DeviceRow({ device }: { device: AdbDeviceHandle }): React.JSX.Element {
  const shellService = useService(ShellService);
  const navigation = useNavigation();
  const [cpuPercent, setCpuPercent] = useState<number | null>(null);
  const [memPercent, setMemPercent] = useState<number | null>(null);

  // 每 3 秒轮询 CPU 和内存
  useEffect(() => {
    let cancelled = false;

    const poll = async (): Promise<void> => {
      try {
        const [cpuOut, memOut] = await Promise.all([
          shellService.exec(device, 'dumpsys cpuinfo | head -1'),
          shellService.exec(device, 'cat /proc/meminfo'),
        ]);
        if (cancelled) return;
        setCpuPercent(parseCpuUsage(cpuOut));
        setMemPercent(parseMemUsage(memOut));
      } catch {
        if (cancelled) return;
        setCpuPercent(null);
        setMemPercent(null);
      }
    };

    void poll();
    const interval = setInterval(() => void poll(), 3000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [device, shellService]);

  const handleClick = (): void => {
    navigation.open(`autumnbox://device-detail?sn=${encodeURIComponent(device.sn)}`);
  };

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer', padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <MobileOutlined style={{ fontSize: 14 }} />
        <Text ellipsis style={{ fontSize: 13, fontWeight: 500 }}>{device.sn}</Text>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text type="secondary" style={{ fontSize: 11, width: 28 }}>CPU</Text>
          {cpuPercent != null
            ? <Progress percent={cpuPercent} size="small" style={{ flex: 1 }} />
            : <Text type="secondary">--</Text>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text type="secondary" style={{ fontSize: 11, width: 28 }}>MEM</Text>
          {memPercent != null
            ? <Progress percent={memPercent} size="small" strokeColor="#722ed1" style={{ flex: 1 }} />
            : <Text type="secondary">--</Text>}
        </div>
      </div>
    </div>
  );
}

const DeviceStatusCardView: React.FC = () => {
  const [devices] = useServiceState(DevicesService, 'devices');
  const noDevices = useT('device_status.no_devices');

  if (devices.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <MobileOutlined style={{ fontSize: 24, opacity: 0.2 }} />
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>{noDevices}</Text>
      </div>
    );
  }

  return (
    <List
      size="small"
      dataSource={devices as AdbDeviceHandle[]}
      renderItem={(device) => (
        <List.Item key={device.sn} style={{ padding: '4px 0' }}>
          <DeviceRow device={device} />
        </List.Item>
      )}
    />
  );
};

export const DeviceStatusCard: AutumnCard = {
  id: 'device-status',
  name: 'card.name.device_status',
  component: DeviceStatusCardView,
};
```

### 示例二：快速重启卡片

提供多种重启模式的快捷按钮：

```tsx
// src/cards/RebootCard.tsx
import type { AutumnCard } from '@autumnbox/sdk';
import type { AdbDeviceHandle } from '@autumnbox/sdk/core';

import { PoweroffOutlined, ToolOutlined } from '@ant-design/icons';
import { useService, useServiceState, useT } from '@autumnbox/sdk/app';
import { DevicesService, ShellService } from '@autumnbox/sdk/core';
import { Button, message } from 'antd';

interface RebootMode {
  key: string;
  labelKey: string;
  command: string;
  icon: React.ReactNode;
}

const REBOOT_MODES: RebootMode[] = [
  { key: 'system',    labelKey: 'reboot.system',    command: 'reboot',              icon: <PoweroffOutlined /> },
  { key: 'recovery',  labelKey: 'reboot.recovery',  command: 'reboot recovery',     icon: <ToolOutlined /> },
  { key: 'bootloader',labelKey: 'reboot.bootloader', command: 'reboot bootloader',  icon: <ToolOutlined /> },
  { key: 'fastboot',  labelKey: 'reboot.fastboot',  command: 'reboot fastboot',     icon: <ToolOutlined /> },
];

const RebootCardView: React.FC = () => {
  const shellService = useService(ShellService);
  const [devices] = useServiceState(DevicesService, 'devices');

  const handleReboot = async (mode: RebootMode): Promise<void> => {
    const deviceList = devices as AdbDeviceHandle[];
    if (deviceList.length === 0) {
      void message.warning('请先连接设备');
      return;
    }
    try {
      // 对所有已连接设备执行重启
      await Promise.all(deviceList.map((d) => shellService.exec(d, mode.command)));
      void message.success(`已发送 ${mode.key} 重启命令`);
    } catch {
      void message.error('重启失败');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
      {REBOOT_MODES.map((mode) => (
        <RebootButton key={mode.key} mode={mode} onClick={() => void handleReboot(mode)} />
      ))}
    </div>
  );
};

function RebootButton({
  mode,
  onClick,
}: {
  mode: RebootMode;
  onClick: () => void;
}): React.JSX.Element {
  const label = useT(mode.labelKey);
  return (
    <Button
      size="small"
      icon={mode.icon}
      onClick={onClick}
      style={{ height: 40, fontSize: 13 }}
    >
      {label}
    </Button>
  );
}

export const RebootCard: AutumnCard = {
  id: 'reboot',
  name: 'card.name.reboot',
  component: RebootCardView,
};
```

### 示例三：自定义 DOM 模式 — 实时时钟

```tsx
// src/cards/ClockCard.tsx
import type { AutumnCard } from '@autumnbox/sdk';

export const ClockCard: AutumnCard = {
  id: 'clock',
  name: 'card.name.clock',
  mount(container: HTMLElement): () => void {
    const el = document.createElement('div');
    el.style.cssText = 'text-align:center; font-size:24px; font-weight:600; padding:12px 0;';
    container.appendChild(el);

    function tick(): void {
      el.textContent = new Date().toLocaleTimeString();
    }

    tick();
    const timer = setInterval(tick, 1000);

    return () => {
      clearInterval(timer);
      container.removeChild(el);
    };
  },
};
```

## 错误处理

宿主应用会自动为每个 Card 包裹 `<ErrorBoundary>`。如果 Card 组件在渲染过程中抛出异常，不会导致整个应用崩溃，而是在该 Card 位置显示错误提示：

```
Card "card.name.battery" failed to render: Cannot read properties of undefined
```

但这不意味着你可以忽略错误处理。最佳实践：

- 对异步操作使用 try/catch
- 对可能为 null 的数据提供加载态和空态
- 使用 `cancelled` 标志防止组件卸载后的状态更新

## 国际化

Card 的 `name` 属性以及组件中使用的所有文本都应通过 i18n 系统管理。在 `resources/lang/` 下放置翻译文件：

```json
// resources/lang/zh-CN.json
{
  "card.name.battery": "电池状态",
  "card.name.device_status": "设备状态",
  "card.name.reboot": "快速重启",
  "battery.no_devices": "未连接设备",
  "battery.charging": "充电中",
  "battery.discharging": "放电中"
}
```

```json
// resources/lang/en.json
{
  "card.name.battery": "Battery",
  "card.name.device_status": "Device Status",
  "card.name.reboot": "Quick Reboot",
  "battery.no_devices": "No devices connected",
  "battery.charging": "Charging",
  "battery.discharging": "Discharging"
}
```

构建时 SDK 会校验 i18n 完整性：如果某个 Card 的导出名在任何语言文件中都没有对应 key，会输出警告。

## 常见问题

### Card 没有出现在首页

1. 检查文件是否在 `src/cards/` 目录下
2. 检查导出是否使用 `export const` + `Card` 后缀
3. 运行构建，查看控制台输出 `Discovered ... card(s)` 确认被发现
4. 检查 `src/__entry__.ts` 是否包含该 Card 的 import 和注册代码

### useServiceState 没有触发更新

确保订阅的是 `IReadonlyState` 对象，而非普通属性。服务中需要使用 `createReadonlyState` 创建响应式状态：

```typescript
// 正确 — DevicesService.devices 是 IReadonlyState<...>
const [devices] = useServiceState(devicesService, 'devices');

// 错误 — 普通属性不是响应式的
const value = devicesService.someNonReactiveProperty;
```

### 一个文件导出多个 Card

完全支持。构建系统的正则会匹配文件中所有的 `export const XxxCard`：

```tsx
export const BatteryCard: AutumnCard = { id: 'battery', /* ... */ };
export const TemperatureCard: AutumnCard = { id: 'temperature', /* ... */ };
```
