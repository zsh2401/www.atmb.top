---
title: 【非常重要】获取基础API的通用之道
---
在秋之盒开放框架中，定义了大量的API接口供第三方开发者调用用于与秋之盒主要程序进行沟通。   
详情请看[这里的源码](https://github.com/zsh2401/AutumnBox/tree/master/src/AutumnBox.OpenFramework.Shared/Open)注释。（非常易读，全中文，并且都是仅包含方法声明的Interface）
所有的API实现都在秋之盒启动时被注册。   

在你的开发中，如果你需要使用哪一款API了，可以通过下面方式获取:
```java
//...
var nm = LakeProvider.Get<INotificationManager>();
nm.Info("Hello World!");
//...
```