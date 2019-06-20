const fs = require('fs');
const jade = require('jade');
const path = require('path');
const TARGET = "../docs/extension/";
const EXTS_DIR = "./data/exts/";
const GALLERY_JADE = "./src/extgallery.jade";
const VIEW_JADE = "./src/extview.jade";
const GALLERY_INDEX = "../docs/extension/index.html";
const pageData = JSON.parse(fs.readFileSync("./data/pageconst.json"));
pageData.exts = readAllExtInfo();
function renderGallery(){
    let html = jade.renderFile(GALLERY_JADE,pageData);
    fs.writeFileSync(GALLERY_INDEX,html);
}
function renderExtViews(){
    for(let i =0;i<pageData.exts.length;i++){
        let ext = pageData.exts[i];
        pageData.ext = ext;
        let html = jade.renderFile(VIEW_JADE,pageData);
        fs.writeFileSync(TARGET + ext.id + ".html",html);
    }
}
function readAllExtInfo(){
    let data = [];
    var files  = fs.readdirSync(EXTS_DIR);
    for(let i = 0;i<files.length;i++){
        let file = files[i];
        let json = fs.readFileSync(EXTS_DIR + file,'utf-8');
        let tmp = JSON.parse(json);
        data[data.length] = tmp;
    }
    return data;
}
renderGallery();
renderExtViews();