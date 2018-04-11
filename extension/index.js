var INDEX_PATH="exts/index.html"
function gotoX(jsonName){
    window.location = "extension.html?j=" + jsonName;
}
function init(){
    
}
function getIndex(){
    
}
function ___getJson(){
    var result=null;
    $.get(INDEX_PATH,function(response){
        result = response;})
   return result;
}