const fs = require('fs');
const path = require('path'); 
const jade = require('jade');
const libmarked = require('marked');
const libbase =require('../base');
const libdata = require('../data/data');


const data = libdata.read();


const DIR_GUIDE = libbase.rootDir + "/docs/help/";
const JADE_TEMP = libbase.rootDir + "/jade/src/help.jade";
function generateToHtml(mdFileName){
    let text = libdata.readGuideFile(mdFileName);
    // console.log(text);
    let mdHtml = libmarked(text);
    data.html = mdHtml;
    jade.renderFile(JADE_TEMP,data,(error,html)=>{
        fs.writeFileSync(DIR_GUIDE + mdFileName.substring(0,mdFileName.length - 3) +  ".html",html);
    });
    data.html = undefined;
}
function renderGuide(){
    let mds = libdata.getGuideFiles();
    for(let i =0;i<mds.length;i++){
        generateToHtml(mds[i]);
    }
}
exports.renderGuide = renderGuide;
