export interface IExtInfo{
    id:string;
    icon?:string;
    name:string;
    auth?:string;
    bdesc?:string;
    desc?:string;
    version?:string;
    downloadUrl:string;
    addition:IAddtion;
    pics?:string[];
}
interface IAddtion {
    [name: string]: string;
}