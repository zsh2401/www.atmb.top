var __web1nDownload = "https://atmb-download.web1n.com/";
var __web1nId = "346";

var __monologuechiDownload = "https://atmb.sm9.top/AutumnBox/%E4%B8%BB%E7%A8%8B%E5%BA%8F/";
var __monoId = "345";

var __zs2401Download = "http://dream.zsh2401.top:4396/";
var __dreamId = "343";

var __baiduPanDownload = "https://pan.baidu.com/s/1bFZBAI";
var __baiduPanId = "347";

var __githubDl = "https://github.com/zsh2401/AutumnBox/releases";
var __githubId = "348";

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
function gotoBaiduPan(){
    window.open(__baiduPanDownload);
    addDownloadCount(__baiduPanId);
}
function gotoGithub(){
    window.open(__githubDl);
    addDownloadCount(__githubId);
}
var __vm = null;
function initVue(){
    __vm = new Vue({
        el:"#downloadCountInfo",
        data:{
            "version":null,
            "date":[],
            "latestVersionInfo":null,
            "baiduCount":0,
            "web1nCount":0,
            "dreamCount":0,
            "monoCount":0,
            "githubCount":0,
        }
    });
}
function fetchData(){
    queryDownloadCount(__dreamId,function(count){
        __vm.$data.dreamCount = count[__dreamId];
    })
    queryDownloadCount(__monoId,function(count){
        __vm.$data.monoCount = count[__monoId];
    })
    queryDownloadCount(__web1nId,function(count){
        __vm.$data.web1nCount = count[__web1nId];
    });
    queryDownloadCount(__githubId,function(count){
        __vm.$data.githubCount = count[__githubId];
    });
    queryDownloadCount(__baiduPanId,function(count){
        if(parseInt(count) < 9000){
            __vm.$data.baiduCount = "暂未统计";
        }else{
            __vm.$data.baiduCount = count[__baiduPanId];
        }
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
