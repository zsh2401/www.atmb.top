let rawJsonData:Array<IDonor> = require("../../constants/donors.json");
export function getDonors():Array<IDonor>{
    return doMotherFuckerSort(rawJsonData);
}
export function getTotalAmountAsString():string{
    let result = 0.0;
    rawJsonData.forEach(d=>{
        result +=  parseFloat(d.amount);
    });
    return result.toFixed(2);
}
export function getTotalTimes():number{
    return rawJsonData.length;
}
function doMotherFuckerSort(data:Array<IDonor>):Array<IDonor>{
    let result = rawJsonData.sort(normalsort);
    result = result.sort(sortByPriority);
    return result;
}
function sortByPriority(a:IDonor,b:IDonor){
    if(a.priority == undefined){
        a.priority = 0;
    }
    if(b.priority == undefined){
        b.priority = 0;
    }
    return b.priority - a.priority;
}
function normalsort(a, b) {
    if (a.amount === b.amount ) {
        return isEarlyThan(a,b);
    } else {
        return b.amount - a.amount;
    } 
}
function isEarlyThan(a,b){
    const __d = new Date();
    var c0 = a.date.split('/');
    var c1 = b.date.split('/');
    var d0 = __d.setFullYear(c0[2], c0[0], c0[1]);
    var d1 = __d.setFullYear(c1[2], c1[0], c1[1]);
    return d1 - d0;
}


export interface IDonor{
    name?:string;
    date?:string;
    amount:string;
    priority?:number;
    t?:string;
}