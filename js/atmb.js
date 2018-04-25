/*Version 0.0.1 */
/*Need jquery */
function getJsonFrom(url,gettedFunction){
    alert("xxx");
    $.ajax({url:url,
        type:"GET",
        success:function(src){
        var json = eval("("+src+")");
        gettedFunction(json);
    }})
}
function getUrlParam(name){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
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
var __DOWNLOAD_ADD_PRE = "https://atmb.xxwhite.com/api/downexts?id=";
var __DOWNLOAD_QUERT_PRE = "https://atmb.xxwhite.com/api/extension?id=";
function addDownloadCount(id){
    if(id == null)return;
    urlx = __DOWNLOAD_ADD_PRE + id;
    $.ajax({
        url: urlx,
        type: "GET",
        success: function (data) {
            console.log(id + "下载量+1~");
        }
    });
}
function queryDownloadCount(id,success){
    if(id == null)return;
    urlx = __DOWNLOAD_QUERT_PRE + id;
    $.ajax({
        url: urlx,
        type: "GET",
        success: function (data) {
            success(data[0].downloadTimes);
        }
    });
}