#!/bin/bash
cd ./docs/.vuepress/dist
git init
git config user.email "zsh2401@163.com"
git config user.name "zsh2401"
git add .
git commit -m "Updates."
git push --force $REPO master:master        