var __DOWNLOAD_ADD_PRE = "https://atmb.xxwhite.com/api/dlta/";
var __DOWNLOAD_QUERT_PRE = "https://atmb.xxwhite.com/api/dlt/";
// var __DOWNLOAD_ADD_PRE = "https://atmb.xxwhite.com/api/downexts?id=";
// var __DOWNLOAD_QUERT_PRE = "https://atmb.xxwhite.com/api/extension?id=";
function addDownloadCount(id){
    try{
        if(id == null)return;
        urlx = __DOWNLOAD_ADD_PRE + id;
        fetch(urlx)
        .then(json=>{
            console.log(id + "下载量+1~");
        }).catch(err=>{
            console.log(err);
        })
    }catch(err){
        console.log(err);
    }
}
function queryDownloadCount(id,success){
    try {
        if(id == null)return 0;
        urlx = __DOWNLOAD_QUERT_PRE + id;
        fetch(urlx)
        .then(res=>res.json())
        .then(json=>{
            success(json.times)
        }).catch(err=>{
            console.log("下载量查询API访问失败:" + err);
        })
    } catch (error) {
        console.log("下载量查询API访问失败:" + error);
    }
}