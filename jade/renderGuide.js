const fs = require('fs');
const path = require('path'); 
const jade = require('jade');
const pageData = JSON.parse(fs.readFileSync("./data/pageconst.json"));
const config = JSON.parse(fs.readFileSync("./data/config.json"));
const marked = require('marked');
const DIR = "./data/helps/";
const TARGET= "../docs/help/";
const HELP ='./src/help.jade';
function getMds(){
    var dirs = fs.readdirSync(DIR);
    var mds = [];
    for(let i =0 ; i<dirs.length;i++){
        let stat = fs.statSync(DIR + dirs[i]);
        if(stat.isFile() && path.extname(dirs[i]) == '.md'){
            mds[mds.length] = dirs[i];
        }
    }
    return mds;
}
function generateToHtml(mdFileName){
    // console.log(DIR+ mdFileName);
    let text = fs.readFileSync(DIR+ mdFileName,'utf-8');
    // console.log(text);
    let mdHtml = marked(text);
    let targetFile = TARGET + mdFileName + ".html";
    pageData.html = mdHtml;
    jade.renderFile(HELP,pageData,(error,html)=>{
        fs.writeFileSync(TARGET + mdFileName.substring(0,mdFileName.length - 3) +  ".html",html);
    });
}
function renderGuide(){
    let mds = getMds();
    for(let i =0;i<mds.length;i++){
        generateToHtml(mds[i]);
    }
}
renderGuide();
