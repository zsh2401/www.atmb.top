export function getUpdateInfo(callback:GetUpdateInfoCallback){
    fetch("/_api_/update",{
        method:"GET",
    }).then(res=>res.json().then(json=>{
        callback(json);
    }));
}
export interface VersionInfo{
    header:string;
    message:string;
    version:string;
    date:Array<number>;
    updateUrl:string;
    directlyUrl:string;
}
export interface GetUpdateInfoCallback{
    (verInfo:VersionInfo):void;
}