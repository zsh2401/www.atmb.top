---
title: 叶之模块
---
## 原始人
前面提到过，程序集中实现了`IClassExtension`的类都会被秋之盒视为拓展模块并加载。而`EmptyExtension`在实现`IClassExtension`的同时，带有一些基础的元信息，如果想编写一个原始，简单的模块，继承自`EmptyExtension`准没错。可那实在是太原始了，不是吗？
## 叶之模块
在前面的学习中，我们编写了一个这样的模块：
```java
using AutumnBox.OpenFramework.Extension.Leaf;
namespace AtmbExtDemo
{
    class EHelloAutumnBox : LeafExtensionBase
    {
        [LMain]
        public void Run(){
            //业务逻辑
        }
    }
}
```
可以注意到，其继承自[LeafExtensionBase](https://github.com/zsh2401/AutumnBox/blob/master/src/AutumnBox.OpenFramework.Shared/Extension/Leaf/LeafExtensionBase.cs)，也就是叶之模块。
### 低耦合
在叶之模块中，我们的主要方法可以随意取名，修饰符也是任意的，只需要被挂上[LMain]特性即可:
```java
class EHelloAutumnBox : LeafExtensionBase
{
    [LMain] void Run(){
        //逻辑
    }
}
```
### 依赖注入
前面的学习中，我们要获取一个API需要编写这样的代码：
```java
//耦合度太高了!
var nm = LakeProvider.Get<INotificationManager>();
```
得益于`Leafx`中提供的依赖注入方法库，叶之拓展中获取API会方便很多。
```java
class EHelloAutumnBox : LeafExtensionBase
{
    //在主方法参数中获取
    [LMain] 
    private void Run(INotificationManager nm,IStorage storage){
        //逻辑
    }

    //在字段中获取
    [AutoInject]
    IAppManager am;

    //在属性中获取
    //一定要有setter，否则无法注入。
    [AutoInject]
    private IUx Ux {get;set;}
}
```
除了开放框架中的标准API，我们还可以通过以上的方法获取一些特殊的东西:
```java
void Run(IDevice device,ICommandExecutor executor){
    //device: 当前选择的设备，如果没有选择则为null。
    //executor: 命令执行器
}
```

建议尽可能使用`LeafExtesnionBase`开发你的拓展模块。
