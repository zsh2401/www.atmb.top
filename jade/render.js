const config = require("./config");
const fs = require("fs");
const jade = require("jade");
function renderAll(){
    for(let i = 0;i<config.files.length;i++){
        let crt = config.files[i];
        jade.renderFile(crt.jade,config.data,(error,html)=>{
            if(error != null){
                console.log(error);
            }else{
                fs.writeFileSync(config.outDir + crt.out,html);
            }
        });
    }
}
renderAll();
