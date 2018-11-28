var __INDEX_DATA_URL = "/_data_/extensions/index.html";
var vm = null;
function initVue(){
    vm = new Vue({
    el:"#extensions",
    data:{
        extensions:null
    }, 
    methods:{
        onClickExt:function(e){
            window.open("extension.html?j=" + e.srcElement.getAttribute("info"));
        }
    }});
}
function fetchData(){
    fetch(__INDEX_DATA_URL)
        .then(response=>response.text())
        .then(data=>{
            var jObj = eval("(" +data +")");
            vm.$data.extensions = jObj.exts;
            // for(var i =0;i<vm.$data.extensions.length;i++){
            //     var currentValue = vm.$data.extensions[i]
            //     currentValue.downloadTimes = "...";
            //     console.log(currentValue.id);
            //     queryDownloadCount(currentValue.id,(times)=>{
            //         console.log(times);
            //         vm.$data.extensions[i].downloadTimes = times;
            //     })
            // };
        }).catch(err=>{
            console.log(err);
        })
    }
$(document).ready(()=>{
    initVue();
    fetchData();
});