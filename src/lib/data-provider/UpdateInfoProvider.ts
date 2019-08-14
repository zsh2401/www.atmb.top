import updateInfo from '../../constants/update.json'
export function getUpdateInfo():VersionInfo{
    return updateInfo;
}
export interface VersionInfo{
    header:string;
    message:string;
    version:string;
    date:Array<number>;
    updateUrl:string;
    directlyUrl:string;
}