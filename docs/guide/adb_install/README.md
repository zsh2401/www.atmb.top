---
title: 安装ADB
---

本教程将教会您如何将adb添加进PATH变量，安装完成后，即可在任意路径使用adb命令而无需添加adb路径（如图）

![](~./25.png)

# Windows用户

首先需要下载Platform-Tools工具包

下载地址：[SDK 平台工具版本说明  |  Android 开发者  |  Android Developers](https://developer.android.google.cn/studio/releases/platform-tools)

解压这个压缩包，解压后会有一个文件夹，点开后再点开里面的文件夹，然后就会看到这些：

![](~./3.png)

接着开始配置环境变量，首先右键计算机（此电脑）然后点击属性，在这个窗口找到高级系统设置

![](~./4.png)

接着找到环境变量

![](~./5.png)

复制platform tools的文件夹目录

![](~./7.png)

选择Path，点击编辑，再新建一个变量  
![](~./8.png)

![](~./24.png)

粘贴刚才复制的文件地址后确定

![](~./9.png)

确定，这样adb的环境变量就配置好了，以后不要移到或删除这个文件夹。如需移动，需要按此方法重新配置一次

# macOS及GNU/Linux用户

Mac用户可使用Homebrew快速简单的安装adb,通过在终端中输入：

`brew cask install android-platform-tools`

关于Homebrew的安装及使用不再赘述，请自行通过搜索引擎查找。

我们认为GNU/Linux用户已经熟练掌握了自己系统软件包管理器的使用，因此不再详述

`sudo apt install adb //Debian`  
`sudo pacman -S adb //Arch Linux`