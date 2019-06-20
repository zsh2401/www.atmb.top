const fs = require('fs');
const jade = require('jade');
const base = require('../base');
const libdata = require('../data/data');
const data = libdata.read();

const DIR_EXTS = base.rootDir +  "/docs/extension/";

const JADE_GALLERY = base.rootDir + "/jade/src/extgallery.jade";
const JADE_EXTVIEW = base.rootDir + "/jade/src/extview.jade";
const HTML_GALLERY = base.rootDir + "/docs/extension/index.html";

function renderGallery(){
    let html = jade.renderFile(JADE_GALLERY,data);
    fs.writeFileSync(HTML_GALLERY,html);
}
function renderExtViews(){
    for(let i =0;i<data.exts.length;i++){
        let ext = data.exts[i];
        data.ext = ext;
        let html = jade.renderFile(JADE_EXTVIEW,data);
        fs.writeFileSync(DIR_EXTS + ext.id + ".html",html);
    }
    data.ext = undefined;
}
exports.renderGallery = renderGallery;
exports.renderExtViews = renderExtViews;
