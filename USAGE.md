# USO RÁPIDO

## 1) Pré-requisitos (nativos)

Instale os binários do sistema e deixe-os no `PATH`:

* macOS: `brew install graphicsmagick ghostscript`
* Ubuntu/Debian: `sudo apt-get update && sudo apt-get install -y graphicsmagick ghostscript`
* Windows (Admin PowerShell): `choco install graphicsmagick ghostscript -y`

Valide com:

```bash
gm -version
gs -v
```

## 2) Instalação do projeto

```bash
npm install
npm run setup
npm run doctor
```

## 3) Converter um PDF

```bash
# Use aspas em caminhos com espaço
node index.js "/caminho/para/arquivo.pdf"
```

Saída gerada em `output/`:

* `<nome>_text.pdf`
* `<nome>.epub`

## 4) Ajustes úteis

Edite `config.js`:

* `ocr.languages`: `por+eng` (padrão) ou outro (ex: `eng`)
* `pdfToImage.density`: menor = mais rápido; maior = melhor OCR
* `imageProcessing.enhance.*`: brilho/contraste/sharpen

## 5) Dicas & depuração

* Mensagens de erro sobre `gm`/`gs`: rode `npm run doctor` e reinstale dependências nativas.
* Quedas de performance: processe menos páginas (é simples adicionar `--pages`).
* Erros Windows com caminhos: prefira aspas duplas.
