---
title: 实战：APK 安装器
---

# 实战：APK 安装器

> 从零构建一个插件：用户选择本地 APK 文件，推送到 Android 设备，执行安装，实时显示结果。

## 创建项目

克隆插件模板并修改标识信息：

```bash
git clone https://github.com/zsh2401/AutumnBoxPluginTemplate.git apk-installer
cd apk-installer
```

编辑 `package.json`：

```json
{
  "name": "@autumnbox/apk-installer",
  "pluginId": "autumnbox.apk-installer",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "autumnbox-sdk build",
    "deploy": "pnpm run build && cp *.atmb ../packages/app/builtin-plugins/"
  },
  "devDependencies": {
    "@autumnbox/sdk": "workspace:*",
    "@types/react": "^19.0.0",
    "antd": "^6.3.4",
    "react": "^19.0.0"
  }
}
```

删除模板中的 `HelloApp.tsx`、`HelloCard.tsx`，只保留 `index.ts`。

## 定义插件入口

替换 `src/index.ts`：

```typescript
import type { IPlugin, IAppDefinition, IPluginContext } from '@autumnbox/sdk/app';
import type { ServiceContainer } from '@autumnbox/sdk/common';

import { ApkInstallerApp } from '~/ApkInstallerApp';

export const mainPlugin: IPlugin = {
  id: 'autumnbox.apk-installer',
  name: 'APK 安装器',
  description: '选择本地 APK 文件安装到设备',
  version: '1.0.0',
  author: 'AutumnBox',

  onInit(_services: ServiceContainer, _context: IPluginContext) {},
  onEnable() {},
  onDisable() {},
};

export const mainApps: IAppDefinition[] = [
  {
    id: 'apk-installer',
    name: 'APK 安装器',
    icon: '📦',
    type: 'react',
    singleton: false,
    shallSelectAdbDevice: true, // 打开前要求用户选择设备
    tags: ['tools'],
    component: ApkInstallerApp,
  },
];

export const mainCards = [];
```

`shallSelectAdbDevice: true` 告诉秋之盒在打开标签页之前弹出设备选择器，选定的设备会通过 `targetDevice` prop 传入组件。

## 编写 ApkInstallerApp

创建 `src/ApkInstallerApp.tsx`。以下分步讲解，[完整代码](#完整代码)在本节末尾。

### 文件选择

使用 Ant Design 的 `Upload.Dragger` 让用户拖拽或点击选择 APK。`beforeUpload` 返回 `false` 阻止自动上传，仅缓存文件引用：

```tsx
const [file, setFile] = React.useState<File | null>(null);

<Dragger
  accept=".apk"
  maxCount={1}
  beforeUpload={(f) => {
    setFile(f as unknown as File);
    return false; // 阻止自动上传
  }}
  onRemove={() => setFile(null)}
>
  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
  <p className="ant-upload-text">点击或拖拽 APK 文件到此处</p>
</Dragger>
```

### 获取服务

通过 `useService` hook 从 IoC 容器中获取 `DeviceFileSystemService` 和 `ShellService`：

```typescript
import { useService } from '@autumnbox/sdk/app';
import { DeviceFileSystemService, ShellService } from '@autumnbox/sdk/core';

const fileService = useService(DeviceFileSystemService);
const shellService = useService(ShellService);
```

### 推送与安装

安装流程分三步：推送文件到设备临时目录 → 执行 `pm install` → 清理临时文件。

```typescript
const install = async () => {
  if (!targetDevice || !file) return;
  setInstalling(true);
  setResult(null);

  try {
    const remotePath = `/data/local/tmp/${file.name}`;

    // 1. 推送 APK 到设备
    await fileService.push(targetDevice, '/data/local/tmp/', {
      data: file,
      name: file.name,
      size: file.size,
    });

    // 2. 执行 pm install
    const output = await shellService.exec(targetDevice, [
      'pm', 'install', '-r', remotePath,
    ]);

    if (output.includes('Success')) {
      setResult({ success: true, message: '安装成功' });
    } else {
      setResult({ success: false, message: output.trim() });
    }

    // 3. 清理临时文件
    await shellService.exec(targetDevice, ['rm', '-f', remotePath]);
  } catch (err) {
    setResult({
      success: false,
      message: err instanceof Error ? err.message : String(err),
    });
  } finally {
    setInstalling(false);
  }
};
```

几个要点：

- `DeviceFileSystemService.push(device, deviceDir, source)` 的第二个参数是设备上的**目录**路径，第三个参数是 `PushSource`——可以是路径字符串，也可以是 `IFileData` 对象（`{ data: Blob | ArrayBuffer; name: string; size: number }`）。浏览器环境下 `File` 继承自 `Blob`，可以直接作为 `data` 传入。
- `ShellService.exec(device, command)` 等待命令执行完毕并返回完整 stdout 字符串。
- `pm install -r` 中 `-r` 表示允许覆盖安装。

### 完整代码

`src/ApkInstallerApp.tsx`：

```tsx
import React from 'react';
import { Button, Typography, Alert, Upload, Space } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useService } from '@autumnbox/sdk/app';
import { DeviceFileSystemService, ShellService } from '@autumnbox/sdk/core';

import type { AdbDeviceHandle } from '@autumnbox/sdk/interfaces';

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface InstallResult {
  success: boolean;
  message: string;
}

export const ApkInstallerApp: React.FC<{
  targetDevice?: AdbDeviceHandle;
}> = ({ targetDevice }) => {
  const fileService = useService(DeviceFileSystemService);
  const shellService = useService(ShellService);

  const [file, setFile] = React.useState<File | null>(null);
  const [installing, setInstalling] = React.useState(false);
  const [result, setResult] = React.useState<InstallResult | null>(null);

  const install = async () => {
    if (!targetDevice || !file) return;
    setInstalling(true);
    setResult(null);

    try {
      const remotePath = `/data/local/tmp/${file.name}`;

      // 推送 APK 到设备临时目录
      await fileService.push(targetDevice, '/data/local/tmp/', {
        data: file,
        name: file.name,
        size: file.size,
      });

      // 执行安装
      const output = await shellService.exec(targetDevice, [
        'pm', 'install', '-r', remotePath,
      ]);

      if (output.includes('Success')) {
        setResult({ success: true, message: '安装成功' });
      } else {
        setResult({ success: false, message: output.trim() });
      }

      // 清理临时文件
      await shellService.exec(targetDevice, ['rm', '-f', remotePath]);
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <Title level={3}>APK 安装器</Title>
      <Text type="secondary">
        设备：{targetDevice?.sn ?? '未选择'}
      </Text>

      <div style={{ margin: '16px 0' }}>
        <Dragger
          accept=".apk"
          maxCount={1}
          beforeUpload={(f) => {
            setFile(f as unknown as File);
            return false;
          }}
          onRemove={() => {
            setFile(null);
            setResult(null);
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽 APK 文件到此处</p>
        </Dragger>
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          block
          loading={installing}
          disabled={!file || !targetDevice}
          onClick={install}
        >
          {installing ? '安装中...' : '安装到设备'}
        </Button>

        {result && (
          <Alert
            type={result.success ? 'success' : 'error'}
            message={result.success ? '安装成功' : '安装失败'}
            description={result.message}
            showIcon
          />
        )}
      </Space>
    </div>
  );
};
```

## 使用 PackageService 简化

上面的流程（推送 → 安装 → 清理）是手动实现的，便于理解原理。秋之盒的 `PackageService` 已经封装了这一流程：

```typescript
import { useService } from '@autumnbox/sdk/app';
import { PackageService } from '@autumnbox/sdk/core';

const packageService = useService(PackageService);

// 一行搞定：推送 + pm install -r + 清理临时文件
await packageService.installApk(targetDevice, {
  data: file,
  name: file.name,
  size: file.size,
});
```

`installApk` 内部执行的逻辑与手动方式完全一致。如果不需要自定义安装参数，直接用它即可。

## 构建与测试

```bash
# 在插件目录下
pnpm run build
```

构建产出：

```
dist/index.js                      # UMD bundle
autumnbox.apk-installer.atmb       # 可部署的插件包
```

将 `.atmb` 复制到秋之盒的内置插件目录：

```bash
cp autumnbox.apk-installer.atmb ../packages/app/builtin-plugins/
```

启动秋之盒开发服务器（`pnpm run dev`），在应用列表中找到「APK 安装器」，点击打开后选择设备，拖入 APK 文件即可测试。

::: tip
如果 `package.json` 中配置了 `deploy` 脚本，可以直接 `pnpm run deploy` 一步到位。
:::
