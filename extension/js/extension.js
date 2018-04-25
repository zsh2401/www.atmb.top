/*
需要:
   atmb.js
   jQuery.js
*/
function init(){
    ___showLoadingUI();
    var fileName = getUrlParam("j");
    getJsonFrom(fileName,function(json){
        ___setEleByJson(json);
        ___closeLoadingUI();
    })
}
function ___setEleByJson(json){
    document.title = '[拓展]' + json.name;
    $("#extName").html(json.name);
    $("#extAuth").html("@" + json.auth);
    var parser = new HyperDown();
    var html = parser.makeHtml(json.desc);
    $("#extVersion").html("版本号:" + json.version);
    (json.minSdk==null || json.targetSdk==null)?
    $("#extSdk").html("未指定API"):
    ($("#extSdk").html("最低API:" + json.minSdk + "    目标API:" + json.targetSdk));
    $("#extDesc").html(html);
    $("#btnDl").html("立刻下载");
    $("#btnDl").click(function(){
        window.location=json.downloadUrl;
        addDownloadCount(json.id);
    });
    queryDownloadCount(json.id,function(count){
        $("#downloadCount").html("下载量: " + count);
        $("#downloadCount").show();
        console.log(count);
    });
}
function ___showLoadingUI(){
    console.log("loading");
}
function ___closeLoadingUI(){
    console.log("loaded");
}
