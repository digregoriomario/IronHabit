#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js non trovato. Installa Node.js LTS e riprova." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm non trovato. Verifica l'installazione di Node.js." >&2
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo "package.json non trovato. Esegui lo script dalla cartella IronHabit." >&2
  exit 1
fi

if [ ! -d "node_modules" ]; then
  npm run setup
fi

npx expo start -c
