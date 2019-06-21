/*
enderGuide.js v1.0
@zsh2401
渲染所有指南页面
*/
const fs = require('fs');
const jade = require('jade');
const libmarked = require('marked');
const libbase =require('../base');
const libdata = require('../data/data');
const DIR_GUIDE = libbase.rootDir + "/docs/help/";
const JADE_TEMP = libbase.rootDir + "/jade/src/help.jade";

//读取数据
const data = libdata.read();


/*读取md文件,并将其渲染为html */
function generateToHtml(mdFileName){
    //读取md
    let text = libdata.readGuideFile(mdFileName);
    //将md转为html
    let mdHtml = libmarked(text);
    //将html带入模板渲染数据
    data.html = mdHtml;
    //对模板进行渲染
    jade.renderFile(JADE_TEMP,data,(error,html)=>{
        //将得到的html输出到具体文件
        fs.writeFileSync(DIR_GUIDE + mdFileName.substring(0,mdFileName.length - 3) +  ".html",html);
    });
    data.html = undefined;
}
/** 渲染所有指南*/
function renderGuide(){
    //获取所有md文件名
    let mds = libdata.getGuideFiles();
    //遍历渲染
    for(let i =0;i<mds.length;i++){
        generateToHtml(mds[i]);
    }
}
exports.renderGuide = renderGuide;
