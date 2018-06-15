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
    if(id == null)return 0;
    urlx = __DOWNLOAD_QUERT_PRE + id;
    $.ajax({
        url: urlx,
        type: "GET",
        success: function (data) {
            success(data[0].downloadTimes);
        }
    });
}