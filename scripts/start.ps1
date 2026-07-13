$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js non trovato. Installa Node.js LTS e riprova."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm non trovato. Verifica l'installazione di Node.js."
}

if (-not (Test-Path "package.json")) {
  Write-Error "package.json non trovato. Esegui lo script dalla cartella IronHabit."
}

if (-not (Test-Path "node_modules")) {
  npm run setup
}

npx expo start -c
