# <div class="text-center">激活DPM软件</div> 

<div class="text-center">本页面作者: zsh2401</div>

~~这可能是你下载秋之盒的唯一原因~~

# 什么是DPM软件-有哪些-干什么用
DPM软件这个说法并不准确,不过这类软件确实是在获取了DevicePolicyManager的特殊权限后,对安卓手机进行一些更有效的"治理"

例如:**冻结**与**隐藏**

而常见的依赖于DPM的安卓应用有
* [冰箱](https://www.coolapk.com/apk/com.catchingnow.icebox)
* [小黑屋](https://www.coolapk.com/apk/web1n.stopap)
* [第二空间](https://www.coolapk.com/apk/com.hld.apurikakusu)
* [黑洞](https://www.coolapk.com/apk/com.hld.apurikakusu)
* [FreezeYou!](https://www.coolapk.com/apk/cf.playhi.freezeyou)
* [空调狗](https://www.coolapk.com/apk/me.yourbay.airfrozen)
* ...

这些软件除了ROOT等模式外,最大的特色便是支持DPM模式

DPM模式无需ROOT,但激活时却有许多坎坷,如果你不使用秋之盒,你要做的事情有:
0. 下载并配置ADB环境
1. 手动删除手机上的账号,用户,应用双开等等
2. 敲命令,一个字符都不能错

如果你用秋之盒,那么一切都会简单许多.

# 国产手机及三星注意事项

[此处参考了冰箱DPM文档](https://github.com/heruoxin/Ice-Box-Docs)

安卓的碎片化让人头疼,厂商的定制ROM总是可能出现一些奇怪的问题

* 三星在激活DPM后可能会被锁定密码,[详情](https://github.com/heruoxin/Ice-Box-Docs/blob/master/Device%20Owner%20%E4%B8%89%E6%98%9F%E7%89%B9%E5%88%AB%E8%AF%B4%E6%98%8E.md)
* 华为和锤子手机会在冻结与解冻时弹出烦人的提示
* 在许多ROM通知栏会出现"该设备被您所在的单位管理",无影响但不美观
* 应用双开可能出现问题
* 一加等设备上刚解冻的APP可能无法联网,需要重启该APP
* 索尼建议在升级 9.0 之前先设置好冰箱，9.0 系统添加了隐藏帐号难以删除，如已升级，请使用二维码方式,参考[这里](https://github.com/heruoxin/Ice-Box-Docs/blob/master/Device%20Owner%20%E4%B8%89%E6%98%9F%E7%89%B9%E5%88%AB%E8%AF%B4%E6%98%8E.md)

# 使用秋之盒激活他们
秋之盒通过 [@web1n](https://https.vc) 提供的黑科技**一键删除账号用户应用双开**并**设置设备管理员**

你只需要提前删除<span class="important">删除屏幕锁指纹锁</span>(比删账号用户快多了)

接下来,我们以冰箱为例进行演示

# 激活DPM软件_以冰箱为例

#### -1.索尼手机取出手机 SIM 卡；小米用户请开启「USB 调试（安全设置）」关闭「MIUI 优化」。
#### 0.在手机上下载并安装冰箱(废话)

![](/_data_/helps/imgs/dpm/install.jpg)

******

#### 1. <span class="important">删除屏幕锁与指纹锁</span>
![](/_data_/helps/imgs/dpm/nolock.jpg)

******

#### 2. 启动秋之盒并连接手机
![](/images/demo/show_launch.gif)

******

#### 3. 找到激活冰箱功能,并双击

![](/_data_/helps/imgs/dpm/activate.gif)

******

#### 4. 在冰箱中选择DPM模式
![](/_data_/helps/imgs/dpm/selectmode.jpg)

#### 5. 大功告成!
![](/_data_/helps/imgs/dpm/successed.jpg)

## 其它
DPM软件激活步骤都差不多,而你只需要在秋之盒中选择你要的点击即可<span class="important">(特别推荐小黑屋)</span>
![](/_data_/helps/imgs/dpm/other.jpg)

# 激活失败的解决方案

[此处参考了冰箱DPM文档](https://github.com/heruoxin/Ice-Box-Docs)
![](/_data_/helps/imgs/dpm/cpoutput.jpg)

当你激活失败时,输出信息是你最好的帮手,阅读输出信息来解决问题


当输出信息中,带有以下字样:

**Not allowed to ... already several accounts on the device**
* 通常是账号没删干净,通常情况下秋之盒会帮你完成这一步,但既然没成功,就手动来吧,前往设置->同步/账号->删除

**Not allowed to ... already several users on the device**
* 通常是用户没删干净,通常情况下秋之盒会帮你完成这一步,但既然没成功,就手动来吧,删除你的多用户/访客/应用双开

**Trying to set the device owner, but device owner is already set.**
* 你已经设置其它APP为设备管理员,一山不容二虎,你必须先卸载另一个dpm软件(<span class="important"> 千万不要直接卸载,去该DPM软件设置内进行卸载!!</span>)

**Neither user xxx nor current process has android.permission.MANAGE_DEVICE_ADMINS**
* 我不开心!你为什么不好好看文档!!!出现这个问题,请关闭MIUI优化并开启MIUI安全调试!(均在开发者选项中)

