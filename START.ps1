$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskNode = Get-Command node -ErrorAction SilentlyContinue
if ($taskNode) { $taskNodePath = $taskNode.Source }
else { $taskNodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $taskNodePath)) { Write-Host 'Node.js 18 or newer is required.'; Read-Host 'Press Enter to close'; exit 1 }
Write-Host 'Open http://127.0.0.1:4173 in your browser. Keep this window open while playing.'
& $taskNodePath server.mjs
