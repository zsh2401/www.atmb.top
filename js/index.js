var downloadUrl = "https://dl.sm9.top/AutumuBox/%E4%B8%BB%E7%A8%8B%E5%BA%8F/";
var donwload_beta = "http://dream.zsh2401.top:4396/";
var __UPDATE_LOG_URL = "/_api_/update/index.html";
var vm = null;
function initVue(){
  vm = new Vue({
    el:"#ajaxInfos",
    data:{
      version:"...",
      downloadCount:"...",
      downloadBetaCount:"...",
      date:["","",""],
      latestVersionInfo:null
    }
  })
}
function fetchData(){
    queryDownloadCount(343,function(count){
      vm.$data.downloadCount = count;
    });
    queryDownloadCount(344,function(count){
      vm.$data.downloadBetaCount = count;
    })
    fetch(__UPDATE_LOG_URL)
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
  window.open(downloadUrl);
}
function download_beta(){
  addDownloadCount(344);
  window.open(donwload_beta);
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
function gotoViewScanReport(){
  window.open("http://r.virscan.org/language/zh-cn/report/67dda3a561124fe6c0818cfe32da9f9f");
}
function gotoViewScanReport2(){
  window.open("https://habo.qq.com/file/showdetail?pk=ADQGb11vB2QIOls5U2A%3D");
}
$(document).ready(()=>{
    initVue();
    fetchData();
    initComments();
});