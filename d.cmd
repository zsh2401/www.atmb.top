@ECHO OFF
echo 'building...'
npm run build
echo 'deploying...'
cd dist
echo 'removing old git files...'
rd/s/q .git
echo 'reinit git env'
git init
git remote add origin git@git.dev.tencent.com:zsh1937/www.atmb.top.git
echo 'adding...'
git add .
git commit -m "deploy"
echo 'pushing...'
git push -f --set-upstream origin master