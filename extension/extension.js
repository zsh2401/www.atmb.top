var use_defined_json=true;
function init(){
    ___showLoadingUI();
    var file = ___getArgs("j");
    console.log("json file name: " + file);
    var src = ___getSrc(file);
    console.log("src->" + src);
    var json = ___parseToJson(src);
    ___setEleByJson(json);
    ___closeLoadingUI();
}
function ___getArgs(name){
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}
function ___getSrc(fileName){
    var result=null;
    if(use_defined_json){
        result = "{\"name\":\"wow\"}"
    }else{
        $.get("index.html",function(response){
            result = response;})
    }
   return result;
}
function ___parseToJson(src){
    return eval("("+ src +")");
} 
function ___setEleByJson(json){
    console.log("name->" + json.name)
}
function ___showLoadingUI(){
    console.log("loading");
}
function ___closeLoadingUI(){
    console.log("loaded");
}
