/**atmb.top template.js
 * depend on 
 * -Vue.js
 * JQuery
 */
var __afooter_name = "afooter";
var __afooter_template = 
`<footer>
<div style="display:none"><script src="https://s13.cnzz.com/z_stat.php?id=1272395513&web_id=1272395513" language="JavaScript"></script></div>
<p>Copyright © 2017 - 2018 zsh2401,All Rights Reserved</p>
</footer>
`;

var __anavbar_name = "anavbar";
var __anavbar_template = `
<nav class="navbar navbar-default navbar-fixed-top" role="navigation" style="border-radius: 0px;">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse"
                  data-target="#navbar-c">
                  <span class="sr-only">切换导航</span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="/">秋之盒</a>
            </div>
            <div class="collapse navbar-collapse" id="navbar-c">
                <ul class="nav navbar-nav">
                  <li><a href="/"><span class="glyphicon glyphicon-home"> 主页</a></li>
                  <li><a href="/extension/"><span class="glyphicon glyphicon-th"> 拓展模块</a></li>
                  <li><a href="/about/"><span class="glyphicon glyphicon-leaf"> 关于/联系</a></li>
                  <li><a href="/donate/"><span class="glyphicon glyphicon-heart-empty"> 开源/捐赠</a></li>
                  <li><a href="/comments/"><span class="glyphicon glyphicon-edit" /> 留言/软件评论</a></li>
                </ul>
            </div>
        </div>
  </nav>    
`;



function initVueComponents(){
  Vue.component(__afooter_name, {template:__afooter_template});
//   Vue.component(__anavbar_name, {template:__anavbar_template});
}
initVueComponents();