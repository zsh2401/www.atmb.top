# www.atmb.top
AutumnBox官网:https://www.atmb.top    
AutumnBox开源:https://github.com/zsh2401/AutumnBox/

# 浏览代码
### 本项目涉及技术与框架:
    * node.js(项目的基础)
    * jade(html模板引擎)
    * TypeScript(脚本,尽可能多用)
    * JavaScript(脚本)
    * jquery(DOM操作与动画,尽可能少用)
    * bootstrap(响应式布局)
    * vue(MVVM数据绑定,逐渐弃用)
    
### 项目结构
    data/ 编译时使用的各种数据
    docs/ 输出目录,github pages直接进行展示
    jade/ 所有的jade模板及其渲染(编译)脚本,另有少量js/css
    ts/ 网站所有的js/ts代码都在这里,编译输出目录在docs/js

# 贡献代码
### 如何编译项目?
    0.安装node.js
    1.在本目录下安装jade模板引擎 (npm install jade)
    2.在本目录下安装marked md解析库 (npm install marked)
    3.执行./build.ps1,即可进行完整编译

### 如何编写代码?
    添加媒体,请在docs/下对应目录进行操作     
    修改页面视图请前往jade/src   
    修改数据请前往data/   
    修改脚本请前往ts/
