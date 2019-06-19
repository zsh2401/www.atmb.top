/*Version 0.7 */
function getJsonFrom(url,gettedFunction){
    fetch(url)
    .then(response=>response.json())
    .then(json=>{
        success(json);
    }).catch(err=>{
        console.log(err);
    })
}
function getHtmlFrom(url,success){
    fetch(url)
    .then(response=>response.text())
    .then(text=>{
        success(text);
    }).catch(err=>{
        console.log(err);
    })
}
function getUrlParam(name){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}
String.prototype.toJObj = function(){
    return eval("(" +this+ ")");
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