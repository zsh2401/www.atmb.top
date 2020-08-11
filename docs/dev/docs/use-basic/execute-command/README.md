---
title: 执行命令
---
~~秋之盒讲究的就是一个对命令行的封装~~
## HestExecutor
[HestExecutor](https://github.com/zsh2401/AutumnBox/blob/master/src/AutumnBox.Basic.Shared/Calling/HestExecutor.cs)实现了[ICommandExecutor](https://github.com/zsh2401/AutumnBox/blob/master/src/AutumnBox.Basic.Shared/Calling/ICommandExecutor.cs)接口，提供了稳定，可控，线程安全的执行操作系统指令的方式。   
我们可以直接直接通过构造方法获得一个`HestExecutor`。
:::tip
HestExecutor线程安全的体现在于：对`Execute()`的调用会一直阻塞至上一个命令执行完毕。是的，其中有一把锁。
:::
```java
var executor = new HestExecutor();
```
### 执行第一个命令
```java
var executor = new HestExecutor();
var exeResult = executor.Execute("cmd.exe","/c ping baidu.com");
Trace.WriteLine(exeResult.Output.ToString());
/*
* Pinging baidu.com [220.181.38.148] with 32 bytes of data:
* Reply from 220.181.38.148: bytes=32 time=50ms TTL=51
* Reply from 220.181.38.148: bytes=32 time=50ms TTL=51
* Reply from 220.181.38.148: bytes=32 time=50ms TTL=51
* Reply from 220.181.38.148: bytes=32 time=50ms TTL=51
*
* Ping statistics for 220.181.38.148:
*     Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
* Approximate round trip times in milli-seconds:
*    Minimum = 50ms, Maximum = 50ms, Average = 50ms
*
*/
Trace.WriteLine(exeResult.ExitCode);//0
```
### 实时获得输出内容
`Execute`方法会在目标命令程序退出后才会返回值，如果需要实时获取标准输出内容，可以注册`OutputReceived`事件：
```java
executor.OutputReceived += (s,e)=>{
    Trace.WriteLine(e.Text);
}
```
### 异步执行
```java
var result = await executor.ExecuteAsync("cmd.exe","/c ping baidu.com");
```

## ICommandExecutor的拓展方法
通过[CommandExecutorExtension](https://github.com/zsh2401/AutumnBox/blob/master/src/AutumnBox.Basic.Shared/Calling/CommandExecutorExtension.cs)提供的拓展方法，我们能够实现对`ADB`,`FASTBOOT`,`ADB SHELL`的操作。
### ADB
```java
ICommandExecutor executor = new HestExecutor();
var r = executor.Adb("--version");
Trace.WriteLine(r.Output.ToString());
/*
* Android Debug Bridge version 1.0.41
* Version 30.0.4-6686687
* Installed as D:\Source\AutumnBoxWorkingSpace\AutumnBox\src\AutumnBox.GUI\bin\Debug\netcoreapp3.1\adb_binary\win32\adb.exe
*/
```
针对目前选中设备执行的指令:
```java
IDevice device = LakeProvider.Get<IDeviceManager>().Selected;
var r = executor.Adb(device,"reboot");
if(r.ExitCode == 0){
    //Success
}else{
    //Error
}
```
### Fastboot
```java
//获取已连接的处于fastboot状态的设备
var r = executor.Fastboot("devices");
var fbDevices = SomeMagicMethod(r);
//重启设备到系统
executor.Fastboot(device,"reboot");
```