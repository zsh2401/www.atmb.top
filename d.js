const ghpages = require('gh-pages')
const path = require('path');
ghpages.publish(path.resolve(__dirname,'./dist'),{
    branch:"master",
    repo:"git@git.dev.tencent.com:zsh1937/www.atmb.top.git"
});
