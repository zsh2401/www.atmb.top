Write-Output '==build.ps1,for project building=='

# 使用Jade对Jade页面进行渲染
Write-Output '[RENDERING JADES]'
node ./jade/render.js
Write-Output '[RENDERED JADES]'

# 根据数据设置WEB API

#将js和css文件复制到输出目录
Write-Output '[COPYING JS & CSS]'
Copy-Item -Recurse web/js/* docs/js/
Copy-Item -Recurse web/css/* docs/css/
Write-Output '[COPIED JS & CSS]'

#将ts文件夹下的TypeScript文件编译并放到docs/js下
Write-Output '[Compiling TypeScript]'
Set-Location ./ts
tsc
Set-Location ..
Write-Output '[Compiled TypeScript]'
