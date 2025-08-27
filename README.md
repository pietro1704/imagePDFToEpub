# Image PDF to EPUB Converter

Converte PDFs de imagem para EPUB usando OCR de alta qualidade.

## Características

- 🔍 **OCR de Alta Qualidade**: Usa Tesseract.js com configurações otimizadas
- 📸 **Pré-processamento de Imagem**: Melhora a qualidade das imagens antes do OCR
- 📄 **Gera PDF de Texto**: Cria um PDF somente texto com o conteúdo extraído
- 📚 **Conversão para EPUB**: Converte o texto extraído para formato EPUB
- 🌍 **Suporte Multilíngue**: Português e Inglês por padrão
- ⚡ **Processamento Otimizado**: Configurações para máxima precisão

## Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## Instalação

```bash
npm install
```

## Uso

```bash
# Converter um PDF
node index.js caminho/para/seu/arquivo.pdf

# Exemplo
node index.js ./documento.pdf
```

## Outputs

O aplicativo gera dois arquivos na pasta `output/`:

1. **arquivo_text.pdf** - PDF somente texto com o conteúdo extraído via OCR
2. **arquivo.epub** - Arquivo EPUB para leitura em e-readers

## Configurações de OCR

O aplicativo usa as seguintes configurações para máxima qualidade:

- **Densidade**: 300 DPI para conversão de PDF para imagem
- **Resolução**: 2480x3508 pixels (A4 em alta resolução)
- **Pré-processamento**: Escala de cinza, normalização, nitidez
- **OCR Engine**: LSTM (mais preciso)
- **Idiomas**: Português e Inglês

## Estrutura de Pastas

```
imagePDFToEpub/
├── index.js           # Aplicativo principal
├── package.json       # Dependências
├── temp/             # Arquivos temporários (criada automaticamente)
└── output/           # Arquivos de saída (criada automaticamente)
```

## Dependências Principais

- **tesseract.js**: OCR engine
- **pdf2pic**: Conversão de PDF para imagem
- **pdf-lib**: Criação de PDFs
- **epub-gen**: Geração de EPUBs
- **sharp**: Processamento de imagens
- **jimp**: Manipulação adicional de imagens

## Exemplo de Saída

```
📖 Image PDF to EPUB Converter
Converting PDF to images...
Converted 10 pages to images

Processing page 1/10
Preprocessing image: page.1.png
Performing OCR on: page.1_processed.png
OCR Progress: 100%
Page 1 OCR confidence: 95.67%

...

Creating text-only PDF...
Creating EPUB...

✅ Conversion completed successfully!
⏱️  Total time: 2.45 minutes
📄 Text PDF: ./output/documento_text.pdf
📚 EPUB: ./output/documento.epub
```

## Limitações

- PDFs devem conter imagens de texto (não texto selecionável)
- Melhor qualidade com imagens de alta resolução
- Tempo de processamento varia com o número de páginas
- Requer boa qualidade de imagem para OCR preciso

## Resolução de Problemas

1. **Erro "File not found"**: Verifique o caminho do arquivo
2. **OCR com baixa precisão**: Use PDFs de maior qualidade
3. **Falta de memória**: Processe PDFs menores por vez
4. **Dependências faltando**: Execute `npm install` novamente