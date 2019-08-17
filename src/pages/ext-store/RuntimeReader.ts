import { IExtInfo } from "./ExtInfo";
declare const __EXT_DATA__:Array<IExtInfo>;
export default function():Array<IExtInfo>{
    return getAll();
}
export function getAll():Array<IExtInfo>{
    return __EXT_DATA__;
}
export function findById(id:string):IExtInfo{
    return getAll().find(e=>{
        return e.id === id;
    });
}