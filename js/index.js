var downloadUrl = "https://pan.baidu.com/s/1bFZBAI";
console.log("本网站仓库:https://github.com/zsh2401/www.atmb.top/ 欢迎贡献代码!");
var vm = null;
function initVue(){
  vm = new Vue({
    el:"#ajaxInfos",
    data:{
      version:"...",
      downloadCount:"...",
      date:["","",""],
      latestVersionInfo:".."
    }
  })
}
function fetchData(){
    queryDownloadCount(343,function(count){
      vm.$data.downloadCount = count;
    });
    fetch("./api/update/index.html")
    .then(res=>res.json())
    .then(json=>{
      vm.$data.version = json.version;
      vm.$data.date = json.date;
      vm.$data.latestVersionInfo = json.message.replace(/\n/g,'<br>');
    }).catch(error=>{
      console.log(error);
    });
}
function download(){
    addDownloadCount(343);
    javascrtpt:window.location=downloadUrl;
}
function initComments(){
    new Valine({
      el: '#vcomments',
      placeholder:"遵守法律法规，理性讨论，写下你对秋之盒的建议与评论",
      appId: 'VLA81Yn1kDUEgE9A99Qwnb1u-gzGzoHsz',
      appKey: 'CpivAcjiG4W9BWNpS2z47X98'
    });
}
function gotoComment(){
  var ele = document.getElementById("comments");
  window.scrollTo(0,ele.offsetTop);
  window.location.hash = "#comments";
}
function gotoContact(){
  window.location = "about";
}
function initSwiper(){
  var mySwiper = new Swiper ('.swiper-container', {
    loop: true,
    autoplay:2000,
    pagination: '.swiper-pagination',
    paginationClickable: true
  })    
}
$(document).ready(()=>{
    initVue();
    fetchData();
    initComments();
});