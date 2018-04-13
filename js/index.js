function initAtmbIndex(){
    $.get("api/update/",function(src){
        var json = __idx_parse(src);
        __idx_setEleBy(json);
    })
}
function __idx_parse(src){
    return eval("("+src+")");
}
function __idx_setEleBy(json){
    var str = "最新版本 {0} ({1}/{2}/{3})";
    $("#latestVersion").html(str.format(json.version,json.date[1],json.date[2],json.date[0]));
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