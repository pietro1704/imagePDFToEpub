// Configurações do Image PDF to EPUB Converter
export const CONFIG = {
    // Configurações de OCR
    ocr: {
        languages: 'por+eng',           // Idiomas (por=português, eng=inglês)
        engine: 'LSTM_ONLY',           // Engine do Tesseract (LSTM_ONLY é o mais preciso)
        pageSegMode: 'AUTO',           // Modo de segmentação de página
        dpi: 300,                      // DPI para reconhecimento
        preserveSpaces: true,          // Preservar espaços entre palavras
        whiteList: '',                 // Caracteres permitidos (vazio = todos)
    },

    // Configurações de conversão PDF para imagem
    pdfToImage: {
        density: 300,                  // DPI da imagem (300 = alta qualidade)
        format: 'png',                 // Formato da imagem (png, jpg)
        width: 2480,                   // Largura em pixels (A4 em 300 DPI)
        height: 3508,                  // Altura em pixels (A4 em 300 DPI)
        quality: 100,                  // Qualidade (para JPEG)
    },

    // Configurações de pré-processamento de imagem
    imageProcessing: {
        resize: {
            width: 2480,
            height: 3508,
        },
        enhance: {
            brightness: 1.1,           // Ajuste de brilho (1.0 = original)
            contrast: 1.2,             // Ajuste de contraste (1.0 = original)
            sharpen: {
                sigma: 1.2,            // Intensidade do filtro de nitidez
            },
        },
        greyscale: true,               // Converter para escala de cinza
        normalize: true,               // Normalizar histograma
        quality: 100,                  // Qualidade da imagem processada
    },

    // Configurações do PDF de texto
    textPdf: {
        font: 'TimesRoman',           // Fonte padrão
        fontSize: 12,                  // Tamanho da fonte
        lineHeight: 1.2,              // Espaçamento entre linhas
        margin: 50,                    // Margem da página
        pageSize: {
            width: 595.28,            // Largura A4 em pontos
            height: 841.89,           // Altura A4 em pontos
        },
        color: {
            r: 0, g: 0, b: 0,         // Cor do texto (RGB)
        },
    },

    // Configurações do EPUB
    epub: {
        language: 'pt',               // Idioma do EPUB
        css: `
            body { 
                font-family: Georgia, serif; 
                line-height: 1.6; 
                margin: 20px;
                text-align: justify;
            }
            h1, h2, h3 { 
                color: #333; 
                border-bottom: 2px solid #333; 
                padding-bottom: 10px;
                margin-top: 30px;
                margin-bottom: 20px;
            }
            p { 
                margin-bottom: 15px;
                text-indent: 20px;
            }
            .page-break {
                page-break-before: always;
            }
        `,
        tocTitle: 'Índice',
        appendChapterTitles: true,
        publisher: 'ImagePDF to EPUB Converter',
        verbose: false,
    },

    // Configurações de diretórios
    directories: {
        temp: './temp',
        output: './output',
    },

    // Configurações de performance
    performance: {
        maxConcurrentPages: 1,         // Páginas processadas simultaneamente
        memoryLimit: '2gb',            // Limite de memória
        timeout: 300000,               // Timeout por página (5 minutos)
    },

    // Configurações de logging
    logging: {
        level: 'info',                 // Nível de log (debug, info, warn, error)
        showProgress: true,            // Mostrar progresso do OCR
        showPreview: true,             // Mostrar preview do texto extraído
        maxPreviewLength: 100,         // Tamanho máximo do preview
    },

    // Configurações avançadas
    advanced: {
        cleanupTempFiles: true,        // Limpar arquivos temporários
        createBackup: false,           // Criar backup do PDF original
        validateOutput: true,          // Validar arquivos de saída
        skipEmptyPages: true,          // Pular páginas sem texto
        minConfidence: 30,             // Confiança mínima do OCR (%)
    }
};

// Função para mesclar configurações personalizadas
export function mergeConfig(userConfig = {}) {
    return {
        ...CONFIG,
        ...userConfig,
        ocr: { ...CONFIG.ocr, ...(userConfig.ocr || {}) },
        pdfToImage: { ...CONFIG.pdfToImage, ...(userConfig.pdfToImage || {}) },
        imageProcessing: { 
            ...CONFIG.imageProcessing, 
            ...(userConfig.imageProcessing || {}),
            resize: { ...CONFIG.imageProcessing.resize, ...(userConfig.imageProcessing?.resize || {}) },
            enhance: { 
                ...CONFIG.imageProcessing.enhance, 
                ...(userConfig.imageProcessing?.enhance || {}),
                sharpen: { ...CONFIG.imageProcessing.enhance.sharpen, ...(userConfig.imageProcessing?.enhance?.sharpen || {}) }
            }
        },
        textPdf: { 
            ...CONFIG.textPdf, 
            ...(userConfig.textPdf || {}),
            pageSize: { ...CONFIG.textPdf.pageSize, ...(userConfig.textPdf?.pageSize || {}) },
            color: { ...CONFIG.textPdf.color, ...(userConfig.textPdf?.color || {}) }
        },
        epub: { ...CONFIG.epub, ...(userConfig.epub || {}) },
        directories: { ...CONFIG.directories, ...(userConfig.directories || {}) },
        performance: { ...CONFIG.performance, ...(userConfig.performance || {}) },
        logging: { ...CONFIG.logging, ...(userConfig.logging || {}) },
        advanced: { ...CONFIG.advanced, ...(userConfig.advanced || {}) }
    };
}

// Presets de configuração
export const PRESETS = {
    // Qualidade máxima (mais lento)
    highQuality: {
        pdfToImage: {
            density: 400,
            width: 3300,
            height: 4677
        },
        imageProcessing: {
            resize: {
                width: 3300,
                height: 4677
            },
            enhance: {
                brightness: 1.05,
                contrast: 1.15,
                sharpen: { sigma: 0.8 }
            }
        }
    },

    // Processamento rápido (menor qualidade)
    fast: {
        pdfToImage: {
            density: 200,
            width: 1654,
            height: 2339
        },
        imageProcessing: {
            resize: {
                width: 1654,
                height: 2339
            },
            enhance: {
                brightness: 1.2,
                contrast: 1.3,
                sharpen: { sigma: 1.5 }
            }
        },
        performance: {
            timeout: 120000 // 2 minutos
        }
    },

    // Otimizado para documentos em português
    portuguese: {
        ocr: {
            languages: 'por',
        }
    },

    // Otimizado para documentos em inglês
    english: {
        ocr: {
            languages: 'eng',
        }
    },

    // Multilíngue
    multilingual: {
        ocr: {
            languages: 'por+eng+spa+fra+ita',
        }
    }
};

export default CONFIG;