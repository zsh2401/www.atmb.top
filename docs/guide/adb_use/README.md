---
title: ADB命令简介
author: 神经元
---
我们默认本文读者已经详细掌握了自己所使用系统的Terminal的使用方法，并对Linux系统的文件系统及基本命令有了初步的了解，同时应具备一定的英语水平，否则请转而寻求可信来源的图形化工具的帮助。

## 查询设备
`adb devices`  
使用此命令以列出所有当前连接至此计算机的Android设备和此电脑上的Android模拟器，您可以添加`-l`参数以显示设备的详细信息。第一列显示的是设备的序列号。  
![](~./1.jpg)

## 将命令发送至特定设备
如果您的计算机上连接了多个Android设备或模拟器，您需要在发送命令时使用`-s`参数指定目标设备，否则会抛出错误。在`-s`参数后加上目标设备的序列号。  
![](~./2.jpg)

## 安装应用
`install`会将计算机上的应用安装包安装至Android设备或模拟器上，例如，以下命令将会安装当前路径下的*demo.apk*文件。  
`adb install ./demo.apk`  

## 将文件复制到设备/从设备复制文件
您可以使用`pull`和`push`命令将文件复制到设备或从设备复制文件。  
例如，想要将手机中的照片拷贝至计算机，可以使用如下命令，他会将照片存储在当前路径下。
`adb pull /sdcard/DCIM/Camera ./`
欲将计算机当前路径下的*photo.jpg*复制至设备的SD卡中，可以使用以下命令。  
`adb push ./photo.jpg /sdcard`

## 发出Shell命令
您可以使用*shell*命令通过*adb*发出设备命令，也可以启动交互式*shell*。要发出单个命令，请使用*shell*命令，如下所示：  
`adb shell echo 'Hello,Android!'`  
![](~./3.jpg)  
要在设备上启动交互式*shell*，请使用*shell*命令，如下所示：  
`adb shell`    
![](~./4.jpg)  
对于Android/Linux Shell的使用介绍已偏离本文主题，请自行学习Linux系统中Shell的相关命令。

### 调用 Activity 管理器 (am)
在*adb shell*中，您可以使用 Activity 管理器 (am) 工具发出命令以执行各种系统操作，如启动Activity、强行停止进程、广播 intent、修改设备屏幕属性等。  
|  命令   |  说明  |
|  -----  |  ----  |
| `start intent`  | 启动由*intent*指定的 Activity。|
| `startservice intent` | 启动由*intent*指定的 Service。 |
| `force-stop package` | 强行停止与 *package*(应用的软件包名称）关联的所有进程。|
| `kill-all` | 终止所有后台进程。 |
| `broadcast intent` | 发出广播 intent。 |
| `display-size widthxheight` | 替换设备显示尺寸。 |
| `display-density dpi` | 	替换设备显示密度。 |

### 调用软件包管理器
在 adb shell 中，您可以使用软件包管理器 (pm) 工具发出命令，以对设备上安装的应用软件包执行操作和查询。  
<table>    <tbody><tr>      <th>命令</th>      <th>说明</th>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    list packages [</span><var><span>options</span></var><span>] </span><var><span>filter</span></var><span>    </span></code></td>    <td>输出所有软件包，或者，仅输出软件包名称包含 <code translate="no" dir="ltr"><var><span>filter</span></var></code> 中的文本的软件包。<p>选项如下：</p><ul>        <li><code translate="no" dir="ltr">-f</code>：查看它们的关联文件。</li><li><code translate="no" dir="ltr">-d</code>：进行过滤以仅显示已停用的软件包。</li><li><code translate="no" dir="ltr">-e</code>：进行过滤以仅显示已启用的软件包。</li><li><code translate="no" dir="ltr">-s</code>：进行过滤以仅显示系统软件包。</li><li><code translate="no" dir="ltr">-3</code>：进行过滤以仅显示第三方软件包。</li><li><code translate="no" dir="ltr">-i</code>：查看软件包的安装程序。</li><li><code translate="no" dir="ltr">-u</code>：也包括卸载的软件包。</li><li><code translate="no" dir="ltr">--user <var>user_id</var></code>：要查询的用户空间。</li></ul>    </td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    list permission-groups    </span></code></td>    <td>输出所有已知的权限组。</td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    list permissions [</span><var><span>options</span></var><span>] </span><var><span>group</span></var><span>    </span></code></td>    <td>输出所有已知的权限，或者，仅输出 <code translate="no" dir="ltr"><var><span>group</span></var></code> 中的权限。<p>选项如下：</p><ul>        <li><code translate="no" dir="ltr">-g</code>：按组进行整理。</li><li><code translate="no" dir="ltr">-f</code>：输出所有信息。</li><li><code translate="no" dir="ltr">-s</code>：简短摘要。</li><li><code translate="no" dir="ltr">-d</code>：仅列出危险权限。</li><li><code translate="no" dir="ltr">-u</code>：仅列出用户将看到的权限。</li></ul>    </td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    list users    </span></code></td>    <td>输出系统中的所有用户。</td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    path </span><var><span>package</span></var><span>    </span></code></td>    <td>输出给定 <code translate="no" dir="ltr"><var><span>package</span></var></code> 的 APK 的路径。</td>    </tr>    <tr id="-t-option">    <td><code translate="no" dir="ltr"><span>    install [</span><var><span>options</span></var><span>]  </span><var><span>path</span></var><span>    </span></code></td>    <td>将软件包（通过 <code translate="no" dir="ltr"><var><span>path</span></var></code> 指定）安装到系统。<p>选项如下：</p><ul>        <li><code translate="no" dir="ltr">-r</code>：重新安装现有应用，保留其数据。</li>        <li><code translate="no" dir="ltr">-i <var>installer_package_name</var></code>：指定安装程序软件包名称。</li>        <li><code translate="no" dir="ltr">--install-location <var>location</var></code>：使用以下某个值来设置安装位置：<ul><li type="square"><code translate="no" dir="ltr">0</code>：使用默认安装位置。</li>            <li type="square"><code translate="no" dir="ltr">1</code>：在内部设备存储上安装。</li>            <li type="square"><code translate="no" dir="ltr">2</code>：在外部介质上安装。</li>          </ul>        </li>        <li><code translate="no" dir="ltr">-f</code>：在内部系统内存上安装软件包。</li>        <li><code translate="no" dir="ltr">-d</code>：允许版本代码降级。</li>        <li><code translate="no" dir="ltr">-g</code>：授予应用清单中列出的所有权限。</li>        <li><code translate="no" dir="ltr">--fastdeploy</code>：通过仅更新已更改的 APK 部分来快速更新安装的软件包。</li>      </ul>    </td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    uninstall [</span><var><span>options</span></var><span>] </span><var><span>package</span></var><span>    </span></code></td>    <td>从系统中移除软件包。<p>选项如下：</p><ul>        <li><code translate="no" dir="ltr">-k</code>：移除软件包后保留数据和缓存目录。</li></ul>    </td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    clear </span><var><span>package</span></var><span>    </span></code></td>    <td>删除与软件包关联的所有数据。</td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    enable </span><var><span>package_or_component</span></var><span>    </span></code></td>    <td>启用给定的软件包或组件（写为“package/class”）。</td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    disable </span><var><span>package_or_component</span></var><span>    </span></code></td>    <td>停用给定的软件包或组件（写为“package/class”）。</td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    grant </span><var><span>package_name</span></var><span> </span><var><span>permission</span></var><span>    </span></code></td>    <td>向应用授予权限。在搭载 Android 6.0（API 级别 23）及更高版本的设备上，该权限可以是应用清单中声明的任何权限。在搭载 Android 5.1（API 级别 22）及更低版本的设备上，该权限必须是应用定义的可选权限。</td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    revoke </span><var><span>package_name</span></var><span> </span><var><span>permission</span></var><span>    </span></code></td>    <td>从应用撤消权限。在搭载 Android 6.0（API 级别 23）及更高版本的设备上，该权限可以是应用清单中声明的任何权限。在搭载 Android 5.1（API 级别 22）及更低版本的设备上，该权限必须是应用定义的可选权限。</td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    set-install-location </span><var><span>location</span></var><span>    </span></code></td>    <td>更改默认安装位置。位置值如下：<ul><li><code translate="no" dir="ltr">0</code>：自动 - 让系统决定最合适的位置。</li><li><code translate="no" dir="ltr">1</code>：内部 - 在内部设备存储上安装。</li><li><code translate="no" dir="ltr">2</code>：外部 - 在外部介质上安装。</li></ul>    <p class="note"><strong>注意</strong>：此命令仅用于调试目的；使用此命令会导致应用中断和其他意外行为。</p>    </td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    get-install-location    </span></code></td>    <td>返回当前安装位置。返回值如下：<ul><li><code translate="no" dir="ltr">0 [auto]</code>：让系统决定最合适的位置</li><li><code translate="no" dir="ltr">1 [internal]</code>：在内部设备存储上安装</li><li><code translate="no" dir="ltr">2 [external]</code>：在外部介质上安装</li></ul>    </td>    </tr>    <tr>    <td><code translate="no" dir="ltr"><span>    set-permission-enforced </span><var><span>permission</span></var><span> [true |<wbr> false]    </span></code></td>    <td>指定是否应强制执行给定的权限。</td>    </tr>    </tbody></table>

### 截取屏幕截图
`screencap`命令可以在*shell*中截取设备显示屏的屏幕截图。例如，以下命令将在命令行中截取屏幕截图并保存在/sdcard下。  
`adb shell screencap /sdcard/screen.png`

### 录制视频
`screenrecord`命令可以在*shell*中录制设备显示屏。（需要Android 4.4或更高）例如，以下命令将在命令行中录制屏幕并保存在/sdcard下。  
`adb shell screenrecord /sdcard/demo.mp4`  
按 Ctrl + C 键（在 Mac 上，按 Command + C 键）停止屏幕录制；否则，到三分钟或 --time-limit 设置的时间限制时，录制将自动停止。  
<table>      <tbody><tr>        <th>选项</th>        <th>说明</th>      </tr>           <tr>        <td style="white-space:nowrap">          <code translate="no" dir="ltr"><span>--size </span><var><span>width</span></var><span>x</span><var><span>height</span></var></code>        </td>        <td>设置视频大小：<code translate="no" dir="ltr"><span>1280x720</span></code>。默认值为设备的本机显示屏分辨率（如果支持）；如果不支持，则为 1280x720。</td>      </tr>      <tr>        <td><code translate="no" dir="ltr"><span>--bit-rate </span><var><span>rate</span></var></code></td>        <td>设置视频的视频比特率（以 MB/秒为单位）。默认值为 4Mbps。您可以增加比特率以提升视频品质，但这么做会导致视频文件变大。          </td>      </tr>      <tr>        <td><code translate="no" dir="ltr"><span>--time-limit </span><var><span>time</span></var></code></td>        <td>设置最大录制时长（以秒为单位）。默认值和最大值均为 180（3 分钟）。</td>      </tr>      <tr>        <td><code translate="no" dir="ltr"><span>--verbose</span></code></td>        <td>在命令行屏幕显示日志信息。如果您不设置此选项，则该实用程序在运行时不会显示任何信息。</td>      </tr>    </tbody></table>
  

---  
*Portions of this page are modifications based on work created and [shared by the Android Open Source Project](http://code.google.com/policies.html) and used according to terms described in the [Creative Commons 2.5 Attribution License](http://creativecommons.org/licenses/by/2.5/).*