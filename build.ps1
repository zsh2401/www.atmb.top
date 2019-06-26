Write-Output '==build.ps1,for project building=='

Write-Output '[RENDERING JADES]'
node ./jade/render.js
Write-Output '[RENDERED JADES]'

Write-Output '[COPYING SCRIPTS]'
Copy-Item -Recurse script/* docs/js/
Write-Output '[COPIED SCRIPTS]'

Write-Output '[Compiling TypeScript]'
Set-Location ./ts
tsc
Set-Location ..
Write-Output '[Compiled TypeScript]'
