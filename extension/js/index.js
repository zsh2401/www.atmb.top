var INDEX_PATH="exts/index.html"
var __LINE_FMT = 
    "<tbody>"+
    "<td>{0}</td>"+
    "<td>{1}</td>"+
    "<td><button type=\"button\" class=\"btn btn-danger\" "+
    "onclick=\"javascrtpt:___gotoX(\'{2}\');\">"+
     "详情</button></td>" +
    "</tbody>"
function init(){
    __idxShowLoading();
    __setByIndex(function(jIndex){
        for(var index in jIndex.exts){
            __add(jIndex.exts[index]);
        }
        __indexCloseLoading();
    })
}
function __idxShowLoading(){}
function __indexCloseLoading(){}
function __add(json){
    var html = document.getElementById("table").innerHTML;
    var fmt =__LINE_FMT.format(json.name,json.desc,json.info);
    console.log(fmt)
    document.getElementById("table").innerHTML += fmt;
}

function ___gotoX(jArgName){
    window.open("extension.html?j=" + jArgName);
}

function __setByIndex(fun){
    var src = null;
    $.ajax({
        url:INDEX_PATH,
        type:'GET',
        success:function(data){
            console.log(data);
            var json = eval("("+ data +")");
            fun(json);
        }
    });
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