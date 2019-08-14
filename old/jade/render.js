/*
ender.js v1.0
@zsh2401
对所有jade页面进行渲染与输出
*/
const fs = require("fs");
const jade = require("jade");
const dataReader = require('../data/data');
const base = require('../base');
const libextrender = require('./renderext');
const libguiderender = require('./renderGuide');
/*从数据管理器,读取数据 */
const data = dataReader.read();
/*
渲染data.jades中,只有基本数据需求的页面
*/
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
/*
调用renderext.js渲染拓展模块市场页面
和拓展模块详情
*/
function renderExtPage(){
    libextrender.renderGallery();
    libextrender.renderExtViews();
}
/*
调用renderGuide.js渲染帮助页面
*/
function renderGuide(){
    libguiderender.renderGuide();
}
/*
全部渲染
*/
function renderAll(){
    renderNormalPage();
    renderExtPage();
    renderGuide();
}
//如果是直接通过命令行调用此js
if (require.main === module) {
    //则进行编译
    console.log('called directly');
    console.log("rendering");
    renderAll();
    console.log("rendered");
} else {
    //否则,将函数导出,成为库一般的存在!
    exports.render = renderAll;
}
