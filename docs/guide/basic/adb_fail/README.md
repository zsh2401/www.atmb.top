---
title: 无法运行ADB的解决方案
---

# 无法启动ADB服务
秋之盒基于ADB,如果秋之盒内自带的ADB无法运行,那么秋之盒也就无法运行

通常情况下,ADB无法运行是因为系统中有别的程序也创建了ADB进程,导致冲突,本文将根据这个情况进行解决说明.

注: 秋之盒创建的ADB进程会在秋之盒关闭后彻底退出,不会影响任何其它程序

# 方法:
### 彻底关闭所有手机助手

像什么`豌豆老鼠夹`,`刷砖精灵`,`360手机杀手`,`应用吊`,`华为手机助脚`,`搞机工具箱`等应用通通都要彻底退出

### 结束所有多余的ADB进程

打开任务管理器,找到所有名为adb.exe的进程,并结束他们

### 杀死手机助手残留进程

第一步提到的手机助手们有时就算退出了,还有残留进程,这时就需要你慧眼识屎了,找到所有可疑的手机助手进程,并结束他们的子进程

### 重启电脑

在重启电脑前,一定要彻底关闭所有手机助手的开机启动,否则重启了他们还是在你电脑里捣乱

### 去网吧

上面这些办法都没用的话,我建议你去网吧吧