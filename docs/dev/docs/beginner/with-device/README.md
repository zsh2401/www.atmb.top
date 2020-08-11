---
title: 获取设备信息
---
```java
//如果没有选择设备则返回NULL
var selectedDevice = LakeProvider.Get<IDeviceManager>().Selected;
//or
selectedDevice = LakeProvider.Get<IDevice>();
```