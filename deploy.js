#!/usr/bin/env node
const ghpages = require('gh-pages')
const path = require('path');
if(!process.env.TOKEN){
    throw "Token is not defined in ENV!!!!!";
}
(() => {
    const repo = "https://" + process.env.TOKEN + "@e.coding.net/studio2401/www.atmb.top/deploy.git";
    // console.log(repo);
    ghpages.publish(path.resolve(__dirname, './docs/.vuepress/dist'), {
        branch: "master",
        repo
    },(err)=>{
        if(err){
            throw err;
        }
    });
})();