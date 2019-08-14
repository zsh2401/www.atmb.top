const EXT_URL_PREFIX = "/_data_/exts/";
const INDEX_URL = EXT_URL_PREFIX + "index.json";
export class ExtensionManager{
    getExtsList(callback:Function){
        fetch(INDEX_URL,{method:"GET"})
        .then(res=>res.json().then(json=>{
            callback(json);
        }));
    }
    getExtInfoByName(name:string,callback:Function){
        fetch(EXT_URL_PREFIX + name + "/index.json",{method:"get"})
        .then(res=>res.json().then(json=>{
            json.__name = name;
            callback(json);
        }));
    }
    getIconSrcFor(extInfo:any){
        return EXT_URL_PREFIX + "icons/" + extInfo.__name + extInfo.icon;
    }
}
export class CachedExtensionManager extends ExtensionManager{
    isCacheAvaliable(){
        
    }
}