---
title: 叶之界面
---
前面的学习中我们使用了`IUx`接口显示了一个"Hello World"消息，这实在是太原始了！我们应当使用与叶之拓展配套的叶之界面!
:::warning
此页面文档目前仍在编辑。   
:::
建议阅读[ELeafUIDemo](https://github.com/zsh2401/AutumnBox/blob/dev/src/AutumnBox.Extensions.Essentials.Shared/Extensions/ELeafUIDemo.cs)的源代码与注释。   
外加配合运行最新[Canary版本](https://github.com/zsh2401/AutumnBox/releases)中的`LeafUI Demo`快速理解。(需要在菜单中开启秋之盒调试模式)
![](./demo.png)

## 简单的例子
没啥好说的，看代码吧
```java
//通过LeafExtension提供的依赖注入获取到一个新的ILeafUI对象
void Main(ILeafUI ui){
    ui.Show();
    ui.StatusInfo = "AB";
    ui.ShowMessage("Hello!");
    ui.Println("Test");
    ui.Finish();
}
```
![](./1.png)   
![](./2.png)   
未完待续。