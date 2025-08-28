#!/usr/bin/env bash
set -euo pipefail

# File: example.sh
# Exemplo de uso no macOS/Linux

# 1) Instalar deps nativas (comente se já tiver)
# macOS: brew install graphicsmagick ghostscript
# Ubuntu/Debian: sudo apt-get update && sudo apt-get install -y graphicsmagick ghostscript

# 2) Preparar projeto
npm install
npm run setup
npm run doctor

# 3) Converter (ajuste o caminho do PDF)
PDF_PATH="./sample.pdf"

if [ ! -f "$PDF_PATH" ]; then
  echo "Arquivo não encontrado: $PDF_PATH"
  echo "Edite example.sh e ajuste a variável PDF_PATH."
  exit 1
fi

node index.js "$PDF_PATH"
