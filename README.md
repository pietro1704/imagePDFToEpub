# image-pdf-to-epub

Converte PDFs baseados em imagem para **PDF somente texto** e **EPUB**, usando **Tesseract.js** para OCR e **GraphicsMagick (gm) + Ghostscript (gs)** para rasterizar as páginas do PDF.

---

## Requisitos nativos

> Estes binários são obrigatórios e precisam estar no `PATH` do sistema.

* **macOS**: `brew install graphicsmagick ghostscript`
* **Ubuntu/Debian**: `sudo apt-get update && sudo apt-get install -y graphicsmagick ghostscript`
* **Windows (Admin PowerShell)**: `choco install graphicsmagick ghostscript -y`

> O projeto roda um *preflight* e falha cedo com instruções de instalação se detectar ausência de `gm`/`gs`.

---

## Instalação

```bash
npm install
npm run setup
npm run doctor   # valida gm + gs
```

---

## Uso

```bash
# coloque caminhos com espaço entre aspas
node index.js "/caminho/para/arquivo.pdf"
```

### Saída

* `output/<nome>_text.pdf` – PDF com o texto reconhecido (recriado via pdf-lib)
* `output/<nome>.epub` – EPUB com um capítulo por página (texto OCR)

---

## Configuração

Edite **config.js** para ajustar:

* Resolução/dimensão de rasterização (`pdfToImage`)
* Pré-processamento da imagem (tons de cinza, normalize, sharpen, brilho/contraste)
* Idiomas do Tesseract (padrão `por+eng`)
* Layout do PDF de texto (fonte, tamanho, margens)
* CSS/idioma do EPUB

---

## Solução de problemas

* **Erro `gm identify ... binaries can't be found`**: instale `graphicsmagick` e `ghostscript` (seção *Requisitos nativos*). Rode `npm run doctor`.
* **Caminho com espaços**: use aspas em volta do caminho do PDF.
* **OCR lento**: reduza `pdfToImage.density` ou processe um subconjunto de páginas (implementar range por página é simples – peça para adicionar uma flag `--pages`).

---

## Scripts

* `npm run setup` – cria `.tmp/` e `output/`
* `npm run doctor` – verifica `gm`/`gs`
* `npm run convert` – alias para `node index.js`

---

## Licença

MIT
