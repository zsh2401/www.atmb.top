var IDX_USE_DEFIENED_JSON = true

var INDEX_PATH="exts/index.html"
var __LINE_FMT = 
    "<tbody>"+
    "<td>{0}</td>"+
    "<td>{1}</td>"+
    "<td><button type=\"button\" class=\"btn btn-info\" "+
    "onclick=\"javascrtpt:___gotoX(\'{2}\');\">"+
     "详情</button></td>" +
    "</tbody>"
var IDX_DEFAULT_VALUE = "{\"exts\":["+
        "{\"name\":\"一键刷入小米6 TWRP REC\",\"desc\":\"如名\",\"info\":\"fmi6rec.html\"},"+
        "{\"name\":\"一键安装小米手机驱动\",\"desc\":\"这个模块可以一键安装小米手机驱动\",\"info\":\"xdi.html\"}]}";
function init(){
    var jIndex = __getIndex()
    for(var index in jIndex.exts){
        __add(jIndex.exts[index]);
    }
}
function __add(json){
    var html = document.getElementById("table").innerHTML;
    var fmt =__LINE_FMT.format(json.name,json.desc,json.info);
    console.log(fmt)
    document.getElementById("table").innerHTML += fmt;
}

function ___gotoX(jArgName){
    window.open("extension.html?j=" + jArgName);
}

function __getIndex(){
    if(IDX_USE_DEFIENED_JSON){
        return eval("(" + IDX_DEFAULT_VALUE +")")
    }else{
        var src = ___idx_getSrc(INDEX_PATH);
        return eval("("+ src +")");
    }
}

function ___idx_getSrc(fileName){
    var result=null;
    if(IDX_USE_DEFIENED_JSON){
        result = "{\"name\":\"wow\"}"
    }else{
        $.get(fileName,function(response){
            result = response;})
    }
    console.log("src->" + result);
   return result;
}

function ___getJson(){
    var result=null;
    $.get(INDEX_PATH,function(response){
        result = response;})
   return result;
}
String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg= new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}