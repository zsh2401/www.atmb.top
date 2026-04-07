---
title: 构建与发布
---

# 构建与发布

## 构建插件

在插件项目根目录执行：

```bash
pnpm run build
```

构建完成后，你会在项目根目录看到一个 `.atmb` 文件，这就是你的插件包。

```
my-plugin/
├── src/...
├── package.json
└── myplugins-hello-world.atmb    ← 构建产物
```

::: tip
`.atmb` 文件是插件的唯一交付物。它包含了插件运行所需的一切——代码、资源、语言文件、元数据。
:::

## 本地测试

将 `.atmb` 文件复制到秋之盒的 `builtin-plugins/` 目录，然后刷新页面：

```bash
cp *.atmb /path/to/AutumnBoxRevive/packages/app/builtin-plugins/
```

如果使用 AutumnBoxReviveWorkingSpace，可以直接用 Makefile：

```bash
make plugins    # 构建所有插件并自动复制到 builtin-plugins/
make dev        # 启动开发服务器
```

## 发布插件

### 通过插件商店

将 `.atmb` 文件上传到 [秋之盒插件商店](https://plugins.atmb.top)。用户可以直接在应用内浏览和安装。

### 手动分发

`.atmb` 文件可以通过任何方式分发——网盘、GitHub Releases、聊天工具等。用户收到 `.atmb` 文件后，在秋之盒中通过**插件管理器**导入即可。

## 检查 .atmb 内容

`.atmb` 本质上是一个 ZIP 压缩包，可以用任何解压工具查看内容：

```bash
unzip -l my-plugin.atmb
```

```
  Length      Date    Time    Name
---------  ---------- -----   ----
     2048  2026-04-04 10:00   package.json
   524288  2026-04-04 10:00   index.js
      128  2026-04-04 10:00   resources/lang/zh-CN.json
      102  2026-04-04 10:00   resources/lang/en-US.json
```

## 版本管理

插件版本由 `package.json` 的 `version` 字段决定：

```json
{
  "name": "@myplugins/hello-world",
  "version": "1.2.0"
}
```

发布新版本时，更新 `version`，重新 `pnpm run build`，上传新的 `.atmb` 即可。

## 常见问题

**Q: 插件加载后白屏或报错**

打开浏览器控制台（F12），查看错误信息。常见原因：
- 导出名称不符合约定（`*App`、`*Card`、`*Service`）
- 组件运行时错误

**Q: 如何更新已安装的插件？**

重新导入新版本的 `.atmb` 文件，会自动覆盖旧版本。

**Q: 插件在开发时正常，构建后不工作**

检查是否有 import 路径问题。构建时 `@autumnbox/sdk/*` 会被重写为宿主模块，确保没有直接 import `@autumnbox/core` 等内部包。
