const URL_MDS_PREFIX = "/_data_/help/"
export function getIndexHtml(callback:Function){
    this.getHtmlByFileName("index.md",callback);
}
export function getHtmlByFileName(name:string,callback:Function){
    fetch(URL_MDS_PREFIX + name)
    .then(res=>res.text().then(text=>{
        callback(text);
    }))
}