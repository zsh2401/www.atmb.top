import { IExtInfo } from "./ExtInfo";
import fs from 'fs'
import path from 'path'
export default function(_extspath:string):Array<IExtInfo>{
    let result = new Array<IExtInfo>();
    fs.readdirSync(_extspath)
    .forEach(e=>{
        try{
            let text = fs.readFileSync(path.resolve(_extspath,e),'utf-8');
            let jObj = JSON.parse(text);
            jObj.___jfilename = e;
            result.push(jObj);
        }catch{
        }
    });
    return result;
}