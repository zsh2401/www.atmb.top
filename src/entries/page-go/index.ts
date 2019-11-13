import goRecord from "./record.json";
let key = getUrlParam("a");
let url = goRecord[key];
if(url){
    window.location.href = url;
}else{
    alert("找不到跳转目标....");
    window.location.href = "/";
}
export function getUrlParam(name:string){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return decodeURI(r[2]); return null; //返回参数值
}