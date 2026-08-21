$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'backend'
$ml = Join-Path $root 'ml_services'
$frontend = Join-Path $root 'frontend\index.html'
$venvPython = Join-Path $ml 'venv\Scripts\python.exe'

if (-not (Test-Path $backend)) { throw "Backend folder not found: $backend" }
if (-not (Test-Path $ml)) { throw "ML folder not found: $ml" }
if (-not (Test-Path $frontend)) { throw "Frontend file not found: $frontend" }

$python = if (Test-Path $venvPython) { $venvPython } else { 'python' }

Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$ml'; & '$python' app.py"
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$backend'; npm start"
Start-Process $frontend

Write-Host ''
Write-Host 'MongoDB must already be running at mongodb://127.0.0.1:27017'
Write-Host 'If the ML service does not start, create the virtual environment and install ml_services/requirements.txt first.'