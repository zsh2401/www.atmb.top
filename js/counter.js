var __DOWNLOAD_ADD_PRE = "https://atmb.xxwhite.com/api/downexts?id=";
var __DOWNLOAD_QUERT_PRE = "https://atmb.xxwhite.com/api/extension?id=";
function addDownloadCount(id){
    try {
        if(id == null)return;
        urlx = __DOWNLOAD_ADD_PRE + id;
        $.ajax({
            url: urlx,
            type: "GET",
            success: function (data) {
                console.log(id + "下载量+1~");
            }
        });
    } catch (error) {
        console.log("添加下载API访问失败: " + error);
    }
    
}
function queryDownloadCount(id,success){
    try {
        if(id == null)return 0;
        urlx = __DOWNLOAD_QUERT_PRE + id;
        $.ajax({
            url: urlx,
            type: "GET",
            success: function (data) {
                success(data[0].downloadTimes);
            }
        });
    } catch (error) {
        console.log("下载量查询API访问失败:" + error);
    }
}