var __API_HOST = "https://atmb.xxwhite.com/";
var __API_ADD_PRE = __API_HOST + "api/dlt/add/";
var __API_REG_PRE = __API_HOST + "api/dlt/register/";
var __API_QUE_PRE = __API_HOST + "api/dlt/query/";

function addDownloadCount(id, desc) {
    if (id == null) return;
    var url = __API_ADD_PRE + id;
    fetch(url)
        .then(response => response.json())
        .then(json => {
            if (json.code == "3") {
                registerId(id, desc);
            }else{
                console.log(id + "下载量+1~");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function registerId(id, desc) {
    if (id == null) return;
    var url = __API_REG_PRE + id + "?desc=" + desc;
    fetch(url)
        .then(response => response.json())
        .then(json => {
            if (json.code != "0") {
                console.log("注册失败!");
                console.log(json);
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function queryDownloadCount(id, success) {
    if (id == null) return;
    var url = __API_QUE_PRE + id;
    fetch(url)
        .then(response => response.json())
        .then(json => {
            if (json.code == "0") {
                success(json.data);
            }
        })
        .catch(err => {
            console.log(err);
        });
}