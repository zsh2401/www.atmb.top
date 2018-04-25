/*
需要:
   atmb.js
   jQuery.js
*/
var INDEX_PATH="/EXTS"
var __LINE_FMT = 
    "<tbody>"+
    "<td>{0}</td>"+
    "<td>{1}</td>"+
    "<td><button type=\"button\" class=\"btn btn-success\" "+
    "onclick=\"javascrtpt:___gotoX(\'{2}\');\">"+
     "详情</button></td>" +
    "</tbody>"
function initExtensionIndex(){
    __idxShowLoading();
    getJsonFrom(INDEX_PATH,function(jIndex){
        for(var index in jIndex.exts){
            __add(jIndex.exts[index]);
        }
        __indexCloseLoading();
    });
}
function __idxShowLoading(){}
function __indexCloseLoading(){}
function __add(json){
    var html = document.getElementById("table").innerHTML;
    var fmt =__LINE_FMT.format(json.name,json.desc,json.info);
    document.getElementById("table").innerHTML += fmt;
}

function ___gotoX(jArgName){
    window.location ="extension.html?j=" + jArgName;
}