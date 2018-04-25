var __EXTS_PATH = "exts/"
function init(){
    ___showLoadingUI();
    var fileName = __EXTS_PATH +  ___getArgs("j");
    $.get(fileName,function(src){
        var json = ___parseToJson(src);
        ___setEleByJson(json);
        ___closeLoadingUI();
    })
}
function ___getArgs(name){
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}
function ___parseToJson(src){
    return eval("("+ src +")");
} 
function ___setEleByJson(json){
    document.title = '[拓展]' + json.name;
    $("#extName").html(json.name);
    $("#extAuth").html("@" + json.auth);
    var parser = new HyperDown();
    var html = parser.makeHtml(json.desc);
    console.log("md2html->" + html);
    $("#extVersion").html("版本号:" + json.version);
    (json.minSdk==null || json.targetSdk==null)?
    ($("#extSdk").html("未指定API")):
    ($("#extSdk").html("最低API:" + json.minSdk + "    目标API:" + json.targetSdk));
    $("#extDesc").html(html);
    $("#btnDl").html("立刻下载");
    $("#btnDl").click(function(){
        window.location=json.downloadUrl
        if(json.id != null){
            console.log("have id!");
            $.ajax("https://atmb.xxwhite.com/api/extension?id=" + json.id,function(data){
                console.log("download + 1");
            });
        }else{
            console.log("id not found!");
        }
    });
    ___setDownloadCountByApi(json);
}
function ___setDownloadCountByApi(json){
    $.get("https://atmb.xxwhite.com/api/extension?id=" + json.id,function(data){
        var json = eval("("+ data +")");
        $("#downloadCount").html("下载量: " + json.downloadTimes);
    })
}
function ___showLoadingUI(){
    console.log("loading");
}
function ___closeLoadingUI(){
    console.log("loaded");
}
