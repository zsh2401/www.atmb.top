var __XXWHITE = "https://dl.sm9.top/AutumuBox/%E4%B8%BB%E7%A8%8B%E5%BA%8F/%E6%B5%8B%E8%AF%95%E7%89%88/";
var __ZSH2401 = "http://dream.zsh2401.top:4396/";
var __BETA_DOWNLOAD  = "http://dream.zsh2401.top:4396/";

var __UPDATE_LOG_URL = "/_api_/update/index.html";
// var donwload_beta = "http://dream.zsh2401.top:4396/";
// var downloadUrl = "http://dream.zsh2401.top:4396/";
var vm = null;
function initVue(){
  vm = new Vue({
    el:"#ajaxInfos",
    data:{
      version:"...",
      downloadCount:"...",
      downloadBetaCount:"...",
      downloadCount2:"...",
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
    queryDownloadCount(345,function(count){
      vm.$data.downloadCount2 = count;
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
function download_1(){
  addDownloadCount(343);
  window.open(__ZSH2401);
}
function download_2(){
  addDownloadCount(345);
  window.open(__XXWHITE);
}
function download_beta(){
  addDownloadCount(344);
  window.open(__BETA_DOWNLOAD);
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
$(document).ready(()=>{
    initVue();
    fetchData();
    initComments();
});