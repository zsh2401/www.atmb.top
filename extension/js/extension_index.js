var __INDEX_DATA_URL = "/_data_/extensions/index.json";
var __EXTENSION_PAGE_PRE = "extension.html?j=";
var vm = null;
function initVue(){
    vm = new Vue({
    el:"#extensions",
    data:{
        extensions:[],
        dltimes:{},
    }, 
    methods:{
    }});
}
function fetchData(){
    queryDownloadCount("",(json)=>{
        vm.$data.dltimes = json;
    })
    fetch(__INDEX_DATA_URL)
        .then(response=>response.json())
        .then(json=>{
            var extInfos = json.exts;
            total = extInfos.length;
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
        var data = {extPage:extPage,info:json,fdesc:getfdesc(json)};
        vm.$data.extensions.push(data);
    });
}
function getfdesc(json){
    if(json.desc != null){
        if(json.desc.length > 10){
           return json.desc.substring(0,10);
        }else{
            return json.desc;
        }
    }else if(json.fdesc != null){
        return fdesc;
    }else{
        return null;
    }
}
$(document).ready(()=>{
    initValine();
    initVue();
    fetchData();
});