var __UPDATE_LOG_URL = "/_api_/update/index.html";
var vm = null;
function initVue(){
  vm = new Vue({
    el:"#ajaxInfos",
    data:{
      version:"...",
      downloadCount:0,
      date:["","",""],
      latestVersionInfo:null
    }
  })
}
function gotoOS(){
  window.location = "/opensource";
}
function gotoDl(){
  window.location = "/download";
}
function fetchData() {
    queryDownloadCount([343, 344, 345, 346, 347], function (data) {
          vm.$data.downloadCount += parseInt(data[343]) + parseInt(data[344]) + parseInt(data[345]) + parseInt(data[346]) + parseInt(data[347]);
    });
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

function initComments(){
    new Valine({
      el: '#vcomments',
      placeholder:"遵守法律法规，理性讨论.建议留下邮箱,否则你无法收到回复通知",
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