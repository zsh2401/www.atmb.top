---
title: '[转] 原生安卓WiFi信号去叹号去叉教程5.0-Android P'
author: singleNeuron(转载自EVIL42)
---

**本文转载自 [evil42.com](https://www.evil42.com/index.php/archives/17/) ，已获得原作者授权。**  

---

在开始处理之前有一些东西了解一下还是有好处的，不然纯粹去打命令却还不知道它是干嘛的。

### 说明
Captive Portal是安卓5引入的一种检测网络是否正常连接的机制，制作的非常有创意，通过HTTP返回的状态码是否是204来判断是否成功，如果访问得到了200带网页数据，那你就可能处在一个需要登录验证才能上网的环境里，比如说校园网，再比如说一些酒店提供的客户才能免费使用的WiFi（其实是通过DNS劫持实现的），如果连接超时（根本就连接不上）就在WiFi图标和信号图标上加一个标志，安卓5和6是叹号，安卓7改成一个叉了。只不过默认访问的是谷歌自家的验证服务器，然而由于你懂的原因，就算你连接上了网络也连不上这个服务器... 嗯...那其实还是没有连接上网络嘛... 噫....

谷歌设计了一个开关来控制是否启用这个特性，同时也提供了一个变量来控制待验证的服务器地址，国内的修改版ROM通常都改成了高通中国的地址，还有一些ROM设计了代码在重启的时候恢复这个设置，不知道是出于什么目的。

没更新7.0的时候，一直用小狐狸的[叹号杀手](http://www.coolapk.com/apk/org.foxteam.noisyfox.noexclamation)，很不错的应用，可惜当时他已经很久不更新了，当时安卓N不能用，后来自己做了个小工具，想了想就干脆上架酷安吧，也能帮助大家，这样有了[CaptiveMgr工具](http://www.coolapk.com/apk/tech.evlsoc.captivemgr)，这分明就是个没有名字的名字嘛...根本就是foo, bar一样...好像也没什么好叫的了？现在代码还比较乱，要是哪天有空把这堆代码整理出来就开源了算了，毕竟纯粹体力活。

具体的原理不在这里写了，这里主要写如何去掉叹号或者叉标志。

如果有root权限直接用[我这个工具](http://www.coolapk.com/apk/tech.evlsoc.captivemgr)算了，比较方便，毕竟用命令也就是检测一下系统然后代替执行命令而已嘛。
(PS: 如果使用SS/SSR可以通过NAT模式让系统直接连接，其内部是通过iptables实现的)

如果没有root权限就得按下面操作了，做好配置以后重启WiFi和数据流量（打开再关闭飞行模式即可）就可以看到效果了。

-------

**以下需要ADB调试，配置不赘述**

### 5.0 - 6.x教程
5和6还不支持HTTPS，直接修改即可

* 检测开关相关：

先处理开关状态，这个变量删除就是默认开启的，删除操作随意执行，反正没影响，删除状态下获取这个变量会返回null。
注意：如果关闭，则无法判断当前网络是否需要登录，无法自动弹出登录页面

```bash
//删除
adb shell settings delete global captive_portal_server
//禁用
adb shell settings put global captive_portal_server 0
//查询状态
adb shell settings get global captive_portal_server
```  

* 服务器地址相关：

```bash
//删除地址就可以恢复默认的谷歌服务器
adb shell settings delete global captive_portal_server
//设置一个可用地址（高通/V2EX都推荐）
adb shell settings put global captive_portal_server captive.v2ex.co
//查询当前地址
adb shell settings get global captive_portal_server
```  

### 7.0 - 7.1教程
这两个版本相比5和6没有大的更改，只是默认连接服务器的时候使用HTTPS，但是提供了一个开关用以指定是否使用HTTPS

* 检测开关相关：

同5.0 - 6.x  

* HTTPS开关相关：
 
```bash
//删除（直接删除则默认使用HTTPS）
adb shell settings delete global captive_portal_use_https
//禁用HTTPS（写1启用 写0禁用）
adb shell settings put global captive_portal_use_https 0
//查询HTTPS开关状态
adb shell settings get global captive_portal_use_https
```

* 服务器地址相关：    
（如果启用了HTTPS需要先确定地址是否支持HTTPS）    
同5.0 - 6.x

### 7.1.1教程
这个版本把HTTPS和HTTP两个地址分开保存，并通过7.0加入的HTTPS开关来控制使用哪一个地址。

* 检测开关相关：  
同5.0 - 6.x

* HTTPS开关相关：  
同7.0 - 7.1

* 服务器地址相关：  
```bash
//删除（删除默认用HTTPS）
adb shell settings delete global captive_portal_https_url
adb shell settings delete global captive_portal_http_url
//分别修改两个地址
adb shell settings put global captive_portal_http_url http://captive.v2ex.co/generate_204
adb shell settings put global captive_portal_https_url https://captive.v2ex.co/generate_204
```

### 7.1.2教程  
此版本服务器地址判断逻辑相比7.1.1没有更改，但是检测的开关却变了。

* 检测开关：  
```bash
//删除变量：（删除以后默认启用）
adb shell settings delete global captive_portal_mode
//关闭检测：
adb shell settings put global captive_portal_mode 0
//查看当前状态：
adb shell settings get global captive_portal_mode
```

* 服务器地址相关（同7.1.1）：  
```
//删除（删除默认用HTTPS）
adb shell settings delete global captive_portal_https_url
adb shell settings delete global captive_portal_http_url
//分别修改两个地址
adb shell settings put global captive_portal_http_url http://captive.v2ex.co/generate_204
adb shell settings put global captive_portal_https_url https://captive.v2ex.co/generate_204
```

### 8.0.0和8.1.0和9.0(Android P)同上7.1.2，未做修改