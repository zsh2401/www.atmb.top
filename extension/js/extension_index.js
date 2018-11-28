var __INDEX_DATA_URL = "/_data_/extensions/index.json";
var __EXTENSION_PAGE_PRE = "extension.html?j=";
var vm = null;
function initVue(){
    vm = new Vue({
    el:"#extensions",
    data:{
        extensions:null
    }, 
    methods:{
        onClickExt:function(e){
            window.open(__EXTENSION_PAGE_PRE + e.srcElement.getAttribute("info"));
        }
    }});
}
function fetchData(){
    fetch(__INDEX_DATA_URL)
        .then(response=>response.json())
        .then(json=>{
            vm.$data.extensions = json.exts;
        }).catch(err=>{
            console.log(err);
        })
    }
$(document).ready(()=>{
    initVue();
    fetchData();
    initValine();
});