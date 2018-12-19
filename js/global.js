/*
atmb.top global.js
1.0
depend on 
-vue.js 
-Valine
-JQuery
*/
var __websiteNoticeUrl = "/_data_/notice.json";
var __websiteNoticeCtrlId = "website-notice";
console.log("本网站仓库:https://github.com/zsh2401/www.atmb.top/ 欢迎贡献代码!");
function fetchJson(url,successCallBack){
  fetch(url)
    .then(res=>res.json())
    .then(json=>{
      successCallBack(json);
    }).catch(e=>{
        console.log("can't get " + url + " " + e);
    })
}
function initWebsiteNotice(){
    fetch(__websiteNoticeUrl)
    .then(res=>res.json())
    .then(notice=>{
        var noticeCtrl =  document.getElementById(__websiteNoticeCtrlId);
        if(notice.enable){
            noticeCtrl.style.visibility="visible";
            for(var i = 0 ;i<notice.classes.length;i++){
                noticeCtrl.classList.add(notice.classes[i]);
            }
            noticeCtrl.innerHTML = notice.content;
        }else{
            noticeCtrl.style.visibility="hidden";
        }
    }).catch(e=>{
        console.log("can't get " + url + " " + e);
    })
}
function fetchJson(url,successCallBack){
  fetch(url)
    .then(res=>res.text())
    .then(text=>{
      successCallBack(text);
    }).catch(e=>{
        console.log("can't get " + url + " " + e);
    })
}
function initValine(_el = "#vcomments",pathOfPage=null){
    new Valine({
        el: _el,
        placeholder:"遵守法律法规，理性讨论，写下你对秋之盒的建议与评论",
        appId: 'VLA81Yn1kDUEgE9A99Qwnb1u-gzGzoHsz',
        appKey: 'CpivAcjiG4W9BWNpS2z47X98',
        path: pathOfPage,
      });
}
function getUrlParam(name){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}
$(document).ready(()=>{
    initWebsiteNotice();
});