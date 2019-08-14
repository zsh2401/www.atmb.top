# www.atmb.top
AutumnBox官网:https://www.atmb.top    
AutumnBox开源:https://github.com/zsh2401/AutumnBox/

# 浏览代码
### 本项目涉及技术与框架:
    * node.js(项目的基础)
    * jade(html模板引擎)
    * TypeScript(脚本)
    * JavaScript(脚本)
    * jquery(DOM操作与动画,尽可能少用)
    * bootstrap(响应式布局)
    * vue(MVVM数据绑定,逐渐弃用)
    
### 项目结构
    data/ 编译时使用的各种数据
    css/ 全站的css文件,构建时会被复制到docs/css中
    js/ 全站的js文件,构建时会被复制到docs/js中
    docs/ 输出目录,github pages直接进行展示
    jade/ 所有的jade模板及其渲染(编译)脚本,另有少量被直接包含在jade页面中的js/css
    ts/ 网站所有的js/ts代码都在这里,编译输出目录在docs/js

# 贡献代码
### 如何构建项目?
    0.安装node.js
    1.安装jade模板引擎 (npm install -g jade)
    2.安装marked md解析库 (npm install -g marked)
    3.执行./build.ps1,即可进行完整构建

### 如何编写代码?
    添加媒体,请在docs/下对应目录进行操作   
    修改css请前往css/或jade/css
    修改页面视图请前往jade/src   
    修改数据请前往data/   
    修改脚本请前往ts/或js/
