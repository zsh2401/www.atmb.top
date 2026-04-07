---
title: 国际化
---

# 国际化（i18n）

AutumnBox 插件支持多语言。语言文件由宿主在加载插件时自动导入，开发者只需在约定目录放置 JSON 文件。

## 语言文件结构

```
my-plugin/
└── resources/
    └── lang/
        ├── zh-CN.json      ← 简体中文
        ├── zh-HK.json      ← 繁体中文（香港）
        ├── en-US.json      ← 英语
        ├── ja-JP.json      ← 日语
        ├── ko-KR.json      ← 韩语
        ├── de-DE.json      ← 德语
        ├── fr-FR.json      ← 法语
        ├── es-ES.json      ← 西班牙语
        ├── pt-BR.json      ← 葡萄牙语（巴西）
        ├── ru-RU.json      ← 俄语
        ├── it-IT.json      ← 意大利语
        ├── tr-TR.json      ← 土耳其语
        ├── th-TH.json      ← 泰语
        ├── vi-VN.json      ← 越南语
        └── id-ID.json      ← 印尼语
```

每个 JSON 文件是一个扁平的 key-value 映射：

```json
// resources/lang/zh-CN.json
{
  "app.name.file_manager": "文件管理器",
  "app.name.shell": "终端",
  "card.name.battery": "电池状态",
  "shell.no_device": "请先连接设备",
  "file_manager.upload": "上传文件",
  "file_manager.download": "下载到本地",
  "file_manager.delete_confirm": "确定删除 {name} 吗？"
}
```

```json
// resources/lang/en-US.json
{
  "app.name.file_manager": "File Manager",
  "app.name.shell": "Terminal",
  "card.name.battery": "Battery Status",
  "shell.no_device": "Please connect a device first",
  "file_manager.upload": "Upload File",
  "file_manager.download": "Download",
  "file_manager.delete_confirm": "Delete {name}?"
}
```

## 工作原理

1. **加载**：宿主在加载 `.atmb` 插件时，自动读取 `resources/lang/*.json`，调用 `LanguageService.load(pluginId, locale, content)` 注册翻译内容
2. **查找**：当 UI 需要显示翻译文本时，`LanguageService` 按当前 locale 查找对应 key
3. **回退**：如果当前 locale 没有对应翻译，回退到 `en-US`；如果 `en-US` 也没有，直接返回 key 本身
4. **切换**：用户切换语言时，所有通过 `useT()` 订阅的组件自动重新渲染

```
用户切换语言 → LanguageService.switchLocale('ja-JP')
                         ↓
              所有 IReadonlyState<string> 更新
                         ↓
              useT() 触发组件重渲染
                         ↓
              UI 显示新语言文本
```

## 在 App 和 Card 中使用

### App/Card 名称

`AutumnApp` 和 `AutumnCard` 的 `name` 字段直接作为 i18n key：

```tsx
export const ShellApp: AutumnApp = {
  id: 'shell',
  name: 'app.name.shell',    // ← 这是 i18n key，不是直接显示的文本
  icon: shellIcon,
  component: ShellAppView,
};
```

宿主在应用列表中显示该 App 时，会自动通过 `LanguageService` 将 `'app.name.shell'` 解析为当前语言的翻译文本（如「终端」或「Terminal」）。

### useT Hook

在组件内部使用 `useT` 获取翻译文本：

```tsx
import { useT } from '@autumnbox/sdk/hooks';

const MyAppView: React.FC = () => {
  const title = useT('file_manager.upload');
  const noDevice = useT('shell.no_device');

  return (
    <div>
      <h3>{title}</h3>           {/* → "上传文件" 或 "Upload File" */}
      <p>{noDevice}</p>          {/* → "请先连接设备" */}
    </div>
  );
};
```

`useT` 返回的是一个普通 `string`，**不是** `IReadonlyState`。它内部订阅了 `LanguageService` 的状态变化，当用户切换语言时会自动触发组件重渲染。

### PluginContext.t()

在非 React 环境（如 `main.ts` 或 Service 中）使用 `context.t()`：

```typescript
export function main(context: PluginContext): void {
  // context.t() 返回 IReadonlyState<string>（响应式）
  const titleState = context.t('app.name.shell');
  
  console.log(titleState.value);  // → 当前语言的翻译

  // 订阅语言变化
  titleState.subscribe((newTitle) => {
    console.log('语言切换:', newTitle);
  });
}
```

::: warning 注意区别
- `useT(key)` → 返回 `string`，用于 React 组件
- `context.t(key)` → 返回 `IReadonlyState<string>`，用于非 React 环境
:::

## Key 命名约定

推荐的 key 命名规则：

| 前缀 | 用途 | 示例 |
|------|------|------|
| `app.name.*` | App 显示名称 | `app.name.shell` |
| `card.name.*` | Card 显示名称 | `card.name.battery` |
| `{功能}.{描述}` | 功能内文案 | `shell.no_device`、`file_manager.upload` |

- 使用 **点分隔** 的层级结构
- App/Card 的 `name` 字段必须有对应的 i18n key
- 所有 key 使用 **snake_case**

## 构建时校验

`autumnbox-sdk build` 在构建时会自动校验语言文件：

1. **缺失 key 检查**：如果 `src/apps/` 或 `src/cards/` 中发现的 App/Card 的 `name` key 不存在于任何语言文件中，会输出警告
2. **跨文件一致性检查**：如果某个 key 在 `zh-CN.json` 中存在但在 `en-US.json` 中不存在（或反之），会输出警告

```
[i18n] Key "app.name.shell" not found in any language file.
[i18n] Key "shell.no_device" present in zh-CN.json but missing in en-US.json.
```

::: tip
这些只是警告，不会阻止构建。但建议保持所有语言文件的 key 完全一致，避免用户看到未翻译的原始 key。
:::

## 完整示例

### 语言文件

```json
// resources/lang/zh-CN.json
{
  "app.name.device_monitor": "设备监控",
  "card.name.device_overview": "设备概览",
  "monitor.cpu_usage": "CPU 占用",
  "monitor.memory_usage": "内存占用",
  "monitor.no_device": "未连接任何设备",
  "monitor.refresh": "刷新",
  "monitor.auto_refresh": "自动刷新"
}
```

```json
// resources/lang/en-US.json
{
  "app.name.device_monitor": "Device Monitor",
  "card.name.device_overview": "Device Overview",
  "monitor.cpu_usage": "CPU Usage",
  "monitor.memory_usage": "Memory Usage",
  "monitor.no_device": "No device connected",
  "monitor.refresh": "Refresh",
  "monitor.auto_refresh": "Auto Refresh"
}
```

```json
// resources/lang/ja-JP.json
{
  "app.name.device_monitor": "デバイスモニター",
  "card.name.device_overview": "デバイス概要",
  "monitor.cpu_usage": "CPU使用率",
  "monitor.memory_usage": "メモリ使用率",
  "monitor.no_device": "デバイスが接続されていません",
  "monitor.refresh": "更新",
  "monitor.auto_refresh": "自動更新"
}
```

### App 组件中使用

```tsx
// src/apps/DeviceMonitorApp.tsx
import { Button, Space, Typography } from 'antd';
import { useT } from '@autumnbox/sdk/hooks';

import type { AutumnApp } from '@autumnbox/sdk';

const DeviceMonitorView: React.FC = () => {
  const cpuLabel = useT('monitor.cpu_usage');
  const memLabel = useT('monitor.memory_usage');
  const noDevice = useT('monitor.no_device');
  const refreshText = useT('monitor.refresh');

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Text>{cpuLabel}: 12%</Typography.Text>
        <Typography.Text>{memLabel}: 2.1 GB / 8 GB</Typography.Text>
        <Button type="primary">{refreshText}</Button>
      </Space>
    </div>
  );
};

export const DeviceMonitorApp: AutumnApp = {
  id: 'device-monitor',
  name: 'app.name.device_monitor',      // ← i18n key
  icon: monitorIcon,
  shallSelectAdbDevice: true,
  component: DeviceMonitorView,
};
```

### Card 组件中使用

```tsx
// src/cards/DeviceOverviewCard.tsx
import { Card, Typography } from 'antd';
import { useT } from '@autumnbox/sdk/hooks';

import type { AutumnCard } from '@autumnbox/sdk';

const DeviceOverviewView: React.FC = () => {
  const title = useT('card.name.device_overview');
  const noDevice = useT('monitor.no_device');

  return (
    <Card title={title} size="small">
      <Typography.Text type="secondary">{noDevice}</Typography.Text>
    </Card>
  );
};

export const DeviceOverviewCard: AutumnCard = {
  id: 'device-overview',
  name: 'card.name.device_overview',    // ← i18n key
  component: DeviceOverviewView,
};
```

## 语言回退链

```
当前 locale (如 ja-JP) → en-US → key 本身
```

如果 `ja-JP.json` 中没有 `monitor.refresh`，会回退到 `en-US.json` 中查找。如果 `en-US.json` 也没有，则直接显示 `"monitor.refresh"` 原文。

## 添加新语言

只需在 `resources/lang/` 中新增一个 JSON 文件，文件名为 locale 代码：

```bash
# 添加韩语支持
touch resources/lang/ko-KR.json
```

```json
// resources/lang/ko-KR.json
{
  "app.name.device_monitor": "기기 모니터",
  "card.name.device_overview": "기기 개요"
}
```

不需要修改任何代码。宿主加载插件时会自动识别所有 `resources/lang/*.json` 文件。
