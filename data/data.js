var fs = require('fs');
var base = require('../base');
function read(){
    let data = {};
    data.donate = readDonateData();
    data.jades = tryReadJSON('jades.json');
    data.go = tryReadJSON('go.json');
    data.web = tryReadJSON('web.json');
    data.web.menu = tryReadJSON('webmenu.json');
    data.software = tryReadJSON('software.json');
    data.story = tryReadJSON('story.json');
    data.exts = readExts();
    data.guides = getGuideFiles();
    return data;
}
function readExts(){
    var files = fs.readdirSync(__dirname + '/exts');
    let data = [];
    for(let i = 0;i<files.length;i++){
        data[data.length] = tryReadJSON('exts/' + files[i]);
    }
    return data;
}
function getGuideFiles(){
    return fs.readdirSync(__dirname +  '/guides/');
}
function readGuideFile(fileName){
    return fs.readFileSync(__dirname +  '/guides/' + fileName,'utf-8')
}
function tryReadJSON(fileName){
    try {
        return JSON.parse(fs.readFileSync(__dirname + "/" +fileName,'utf-8'));
    } catch (error) {
        console.log(error);
        return null;
    }
}
function readJSON(fileName){
    return JSON.parse(fs.readFileSync(__dirname + "/" +fileName,'utf-8'));
}
function readDonateData(){
    let donateData = {};
    donateData.donors = tryReadJSON('donors.json');
    donateData.donateTotalAmount = 0;
    donateData.donateTimes = 0;
    for(let i =0;i<donateData.donors.length;i++){
        donateData.donateTotalAmount += donateData.donors[i].amount;
        donateData.donateTimes ++;
    }
    donateData.donors = donateData.donors.sort(donateDataSort);
    donateData.donors = donateData.donors.sort((a,b)=> {
        return b.priority - a.priority});
    donateData.donateTotalAmount = donateData.donateTotalAmount.toFixed(2);
    return donateData;
}
function donateDataSort(a, b) {
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
exports.readJSON = readJSON;
exports.tryReadJSON = tryReadJSON;
exports.readGuideFile = readGuideFile;
exports.getGuideFiles = getGuideFiles;
exports.read = read;
exports.readExts = readExts;