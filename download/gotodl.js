var __web1nDownload = "https://atmb-download.web1n.com/";
var __web1nId = "346";

var __monologuechiDownload = "https://atmb.sm9.top/AutumnBox/%E4%B8%BB%E7%A8%8B%E5%BA%8F/";
var __monoId = "345";

var __zs2401Download = "http://dream.zsh2401.top:4396/";
var __dreamId = "343";

var __UPDATE_LOG_URL = "/_api_/update/index.html";
function gotoMono(){
    window.open(__monologuechiDownload);
    addDownloadCount(__monoId);
}
function gotoWeb1n(){
    window.open(__web1nDownload);
    addDownloadCount(__web1nId);
}
function gotoZsh2401(){
    window.open(__zs2401Download);
    addDownloadCount(__dreamId);
}
var __vm = null;
function initVue(){
    __vm = new Vue({
        el:"#downloadCountInfo",
        data:{
            "version":null,
            "date":[],
            "latestVersionInfo":null,
            
            "web1nCount":0,
            "dreamCount":0,
            "monoCount":0,
        }
    });
}
function fetchData(){
    queryDownloadCount(__dreamId,function(count){
        __vm.$data.dreamCount = count;
    })
    queryDownloadCount(__monoId,function(count){
        __vm.$data.monoCount = count;
    })
    queryDownloadCount(__web1nId,function(count){
        __vm.$data.web1nCount = count;
    });
    fetch(__UPDATE_LOG_URL)
    .then(res=>res.json())
    .then(json=>{
        __vm.$data.version = json.version;
        __vm.$data.date = json.date;
        __vm.$data.latestVersionInfo = json.message.replace(/\n/g,'<br>');
    }).catch(error=>{
      console.log(error);
    });
}
$(document).ready(function(){
    initVue();
    fetchData();
});
