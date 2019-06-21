const fs = require("fs");
const jade = require("jade");
const dataReader = require('../data/data');
const base = require('../base');
const libextrender = require('./renderext');
const libguiderender = require('./renderGuide');
const data = dataReader.read();

function renderNormalPage(){
    for(let i = 0;i<data.jades.length;i++){
        let crt = data.jades[i];
        jade.renderFile(base.rootDir + crt.filename,data,(error,html)=>{
            if(error != null){
                console.log(error);
            }else{
                fs.writeFileSync(base.rootDir + crt.out,html);
            }
        });
    }
}
function renderExtPage(){
    libextrender.renderGallery();
    libextrender.renderExtViews();
}
function renderGuide(){
    libguiderender.renderGuide();
}
function renderAll(){
    renderNormalPage();
    renderExtPage();
    renderGuide();
}

if (require.main === module) {
    console.log('called directly');
    console.log("rendering");
    renderAll();
    console.log("rendered");
} else {
    exports.render = renderAll;
}
