var __INDEX_DATA_URL = "/_data_/extensions/index.json";
var __EXTENSION_PAGE_PRE = "extension.html?j=";
var vm = null;
function initVue(){
    vm = new Vue({
    el:"#extensions",
    data:{
        extensions:[],
    }, 
    methods:{
        onClickExt:function(e){
            window.open();
        }
    }});
}
function fetchData(){
    fetch(__INDEX_DATA_URL)
        .then(response=>response.json())
        .then(json=>{
            var extInfos = json.exts;
            for(var i =0;i<extInfos.length;i++){
                handleInfo(extInfos[i])
            }
        }).catch(err=>{
            console.log(err);
        })
}
function handleInfo(infoUrl)
{
    fetch(infoUrl)
    .then(response=>response.json())
    .then(json=>{
        var extPage = __EXTENSION_PAGE_PRE + infoUrl;
        var data = {extPage:extPage,info:json,dlTimes:"N/A",fdesc:getfdesc(json.desc)};
        queryDownloadCount(json.id,(result)=>{
            console.log(result);
            console.log("wtf");
           
            data.dlTimes = result[json.id.toString()];
        });
        vm.$data.extensions.push(data);
    });
}
function getfdesc(str){
    if(str.length <= 10){
        return str;
    }else{
        return str.substr(0,10);
    }
}
$(document).ready(()=>{
    initValine();
    initVue();
    fetchData();
});