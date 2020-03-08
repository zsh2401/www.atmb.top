---
title: 如何跳过Google的开机向导
author: sora
---

# 如何跳gapps

Android 手机在刷了 Gapps 之后，在开机进入系统时会进入 Gapps 的开机引导（也就是设置 Google 帐号神马的）。但是这需要连 Google 进行验证，于是......

对于这种情况，可以通过以下方法解决：

- 连 Google 进行验证
- 断网
- 顺时针点屏幕四角
- 更改 USER_SETUP_COMPLETE 和 DEVICE_PROVISIONED

## 1. 连 Google 进行验证

这个方法就不多说了，只要能连上 Google，就不会卡在这里了。至于怎么连 Google，请自行寻找魔法上网的方法或买一张出境的机票。

参考：[过Google账户锁 | Nexus6p吧教程站](https://nexus6p.singleNeuron.me/port/%E7%B3%BB%E7%BB%9F/passgoogle/)

## 2. 断网

这个 Gapps 的开机引导是需要连网进行的，默认的情况下如果不连网的情况下是会自动跳过的。但是许多系统在默认情况下 Wifi 和数据是会自动打开，就算把卡取了，也还会有 Wifi，一样无法跳过。对此，可选择先不刷 Gapps，进入系统后将 Wifi 的数据关闭，再刷 Gapps，此方法有一定弊端，有可能会导致 Gapps 某些应用发生某些玄学问题...，比如闪退，未响应，停止运行等

## 3. 顺时针点屏幕四角

这可能是最玄学的一个方法了，据传连点屏幕四角就可跳过此引导（顺时针方向，从左上角开始）。但是！！！但是！！！这是看你运气的时刻，时灵时不灵。别问我是怎么知道的。 (╯‵□′)╯︵┻━┻

## 4. 更改 USER_SETUP_COMPLETE 和 DEVICE_PROVISIONED

敲黑板！！！ 这是我所试过最科学的方法。在开机情况下，将手机连上电脑，使用 adb 工具来修改 USER_SETUP_COMPLETE 和 DEVICE_PROVISIONED 的值。具体操作如下：

打开命令行，输入命令：

```
adb shell settings put secure user_setup_complete 1
adb shell settings put global device_provisioned 1
```

重启，搞定。

*注意：如果没有把adb.exe添加到环境变量的话输入上述命令会出现错误！！*

一般的类原生系统 ADB 默认是打开的，及时没有进入系统，依旧可以通过 ADB 设置，手机官方系统一般 ADB 默认关闭的

注：
在 WINDOWS 下，如果未将 adb.exe 文件所在路径添加至环境变量中，则需要在 adb.exe 文件所在目录下打开命令行，而后将上述命令中的 adb更改为./adb.exe。
上述命令运行错误时会有提示，而成功则没有。

## 5. 终极方法

有twrp的话在TWRP里的终端输入
```
dd if=/dev/zero of=/dev/block/bootdevice/by-name/frp
```
即可跳过

PS：进入TWRP终端的方法请度娘。