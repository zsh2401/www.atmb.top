#!/usr/bin/env node
const ghpages = require('gh-pages')
const path = require('path');
if (!process.env.USERNAME) {
    throw "USERNAME is not defined in ENV!!!!!";
}
if (!process.env.PASSWORD) {
    throw "PASSWORD is not defined in ENV!!!!!";
}
(() => {
    const repo = `https://${USERNAME}:${PASSWORD}@e.coding.net/studio2401/www.atmb.top/deploy.git`;
    ghpages.publish(path.resolve(__dirname, './docs/.vuepress/dist'), {
        branch: "master",
        repo
    }, (err) => {
        if (err) {
            throw err;
        }
    });
})();