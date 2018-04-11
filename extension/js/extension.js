var __EXTS_PATH = "exts/"
function init(){
    ___showLoadingUI();
    var fileName = __EXTS_PATH +  ___getArgs("j");
    $.get(fileName,function(src){
        var json = ___parseToJson(src);
        ___setEleByJson(json);
        ___closeLoadingUI();
    })
}
function ___getArgs(name){
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}
function ___parseToJson(src){
    return eval("("+ src +")");
} 
function ___setEleByJson(json){
    document.title = '[拓展]' + json.name;
    console.log("name->" + json.name);
    console.log("auth->"+ json.auth);
}
function ___showLoadingUI(){
    console.log("loading");
}
function ___closeLoadingUI(){
    console.log("loaded");
}
