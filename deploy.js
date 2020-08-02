#!/usr/bin/env node
const ghpages = require('gh-pages')
const path = require('path');
if(!process.env.TOKEN){
    throw "Token not defined in !!!!!";
}
(() => {
    ghpages.publish(path.resolve(__dirname, './docs/.vuepress/dist'), {
        branch: "master",
        repo: "https://" + process.env.TOKEN + "@e.coding.net/studio2401/www.atmb.top/deploy.git"
    });
})();