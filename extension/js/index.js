var INDEX_PATH="exts/index.html"
var __LINE_FMT = 
    "<tbody>"+
    "<td>{0}</td>"+
    "<td>{1}</td>"+
    "<td><button type=\"button\" class=\"btn btn-info\" "+
    "onclick=\"javascrtpt:___gotoX(\'{2}\');\">"+
     "详情</button></td>" +
    "</tbody>"
var IDX_USE_DEFIENED_JSON = false
function init(){
    var jIndex = __getIndex()
    for(var index in jIndex.exts){
        __add(jIndex.exts[index]);
    }
}
function ___gotoX(jArgName){
    window.open("extension.html?j=" + jArgName);
}

function __getIndex(){
    if(IDX_USE_DEFIENED_JSON == true){
        var src = ___getSrc(INDEX_PATH)
        return eval("("+ src +")")
    }else{
        return {
            "exts":[
                {"name":"一键刷入小米6REC","desc":"this is desc","info":"test.html"},
                {"name":"一键刷入小米6RECXX","desc":"this is desc","info":"test.html"}
            ]
        }
    }
}
function ___getSrc(fileName){
    var result=null;
    if(IDX_USE_DEFIENED_JSON){
        result = "{\"name\":\"wow\"}"
    }else{
        $.get("index.html",function(response){
            result = response;})
    }
   return result;
}
function __add(json){
    var html = document.getElementById("table").innerHTML;
    var fmt =__LINE_FMT.format(json.name,json.desc,json.info);
    console.log(fmt)
    document.getElementById("table").innerHTML += fmt;
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