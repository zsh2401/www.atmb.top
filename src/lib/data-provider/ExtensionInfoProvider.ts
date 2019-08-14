const EXT_URL_PREFIX = "/_data_/exts/";
const INDEX_URL = EXT_URL_PREFIX + "index.json";

export function getExtInfoByName(name:string,callback:GetExtInfoCallback){
        fetch(EXT_URL_PREFIX + name + "/index.json",{method:"get"})
        .then(res=>res.json().then(json=>{
            json.__name = name;
            callback(json);
        }));
    }
export function getIconSrcFor(extInfo:any){
        return EXT_URL_PREFIX + "icons/" + extInfo.__name + extInfo.icon;
    }
export interface GetExtInfoCallback{
    (extInfo:any):void
}