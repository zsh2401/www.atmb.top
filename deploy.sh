#!/usr/bin/bash
cd ./docs/.vuepress/dist
git init
git add .
git commit -m "Updates."
git push --force $REPO master:master        