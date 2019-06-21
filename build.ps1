Write-Output 'build.ps1,for project building'
Write-Output 'calling jade/render.js'
node ./jade/render.js

Write-Output 'Compiling TypeScript'
Set-Location ./ts
tsc
Set-Location ..
Write-Output 'Compiled TypeScript'