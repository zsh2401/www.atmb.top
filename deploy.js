const ghpages = require('gh-pages')
const path = require('path');
ghpages.publish(path.resolve(__dirname,'./docs/.vuepress/dist'),{
    branch:"master",
    repo:"git@e.coding.net:studio2401/www.atmb.top/deploy.git"
});
