$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$stage = Join-Path $root '.student-package'
$zip = Join-Path $root 'Lab05-UX-student.zip'
if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null
$exclude = @('node_modules','dist','solution','.student-package','Lab05-UX-student.zip','NOTES.md','INSTRUCTOR_NOTES.md')
Get-ChildItem -LiteralPath $root -Force | Where-Object { $_.Name -notin $exclude } | Copy-Item -Destination $stage -Recurse
if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zip
Remove-Item -LiteralPath $stage -Recurse -Force
Write-Host "Created $zip"
