const fs = require("fs");
const jade = require("jade");
const pageData = JSON.parse(fs.readFileSync("./data/pageconst.json"));
const config = JSON.parse(fs.readFileSync("./data/config.json"));

pageData.donate = readDonateData();
pageData.software = readSoftwareData();
pageData.story = readStoryData();
pageData.go = readGOData();

function renderAll(){
    for(let i = 0;i<config.jades.length;i++){
        let crt = config.jades[i];
        jade.renderFile(crt.filename,pageData,(error,html)=>{
            if(error != null){
                console.log(error);
            }else{
                fs.writeFileSync(config.outDir + crt.out,html);
            }
        });
    }
}
function readGOData(){
    return (fs.readFileSync("./data/go.json"));
}
function readStoryData(){
    return JSON.parse(fs.readFileSync("./data/story.json"));
}
function readSoftwareData(){
    return JSON.parse(fs.readFileSync("./data/software.json"));
}
function readDonateData(){
    let donateData = {};
    donateData.donors = JSON.parse(fs.readFileSync("./data/donors.json"));
    donateData.donateTotalAmount = 0;
    donateData.donateTimes = 0;
    for(let i =0;i<donateData.donors.length;i++){
        donateData.donateTotalAmount += donateData.donors[i].amount;
        donateData.donateTimes ++;
    }
    donateData.donors = donateData.donors.sort(donateDataSort);
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

renderAll();
