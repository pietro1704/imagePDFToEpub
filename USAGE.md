# Guia de Uso - Image PDF to EPUB Converter

## 🚀 Início Rápido

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Converter um PDF**
   ```bash
   node index.js seu-documento.pdf
   ```

3. **Verificar resultados na pasta `output/`**

## 📋 Comandos Disponíveis

```bash
npm test          # Executar testes
npm run example   # Ver exemplos de uso
npm run setup     # Criar diretórios necessários
npm run clean     # Limpar arquivos temporários
```

## 🔧 Configuração Avançada

### Usando Presets

```javascript
import ImagePDFToEpub from './index.js';
import { PRESETS } from './config.js';

// Alta qualidade (mais lento)
const converter = new ImagePDFToEpub(PRESETS.highQuality);

// Processamento rápido
const converter = new ImagePDFToEpub(PRESETS.fast);

// Otimizado para português
const converter = new ImagePDFToEpub(PRESETS.portuguese);
```

### Configuração Personalizada

```javascript
const customConfig = {
    ocr: {
        languages: 'por+eng+fra',    // Português, Inglês, Francês
        dpi: 400                     // Alta resolução
    },
    pdfToImage: {
        density: 350,                // Densidade personalizada
        width: 2800,
        height: 3800
    },
    imageProcessing: {
        enhance: {
            brightness: 1.15,        // Mais brilho
            contrast: 1.25          // Mais contraste
        }
    }
};

const converter = new ImagePDFToEpub(customConfig);
```

## 📊 Qualidade vs Velocidade

### Alta Qualidade ⭐⭐⭐
- **Densidade**: 400 DPI
- **Resolução**: 3300x4677 pixels
- **Tempo**: ~5-10 min por página
- **Uso**: Documentos importantes, textos pequenos

### Qualidade Padrão ⭐⭐
- **Densidade**: 300 DPI  
- **Resolução**: 2480x3508 pixels
- **Tempo**: ~2-5 min por página
- **Uso**: Maioria dos documentos

### Processamento Rápido ⭐
- **Densidade**: 200 DPI
- **Resolução**: 1654x2339 pixels  
- **Tempo**: ~1-2 min por página
- **Uso**: Testes, textos grandes

## 🌍 Idiomas Suportados

```javascript
// Configurações de idioma
'por'           // Português
'eng'           // Inglês
'spa'           // Espanhol
'fra'           // Francês
'ita'           // Italiano
'deu'           // Alemão
'por+eng'       // Multilíngue
'por+eng+spa'   // Múltiplos idiomas
```

## 📁 Estrutura de Saída

```
output/
├── documento_text.pdf    # PDF somente texto
└── documento.epub        # Arquivo EPUB
```

## 🔍 Solução de Problemas

### OCR com baixa precisão
- ✅ Use densidade maior (400 DPI)
- ✅ Aumente contraste e brilho
- ✅ Verifique idioma correto
- ✅ Use preset `highQuality`

### Processamento muito lento  
- ✅ Use preset `fast`
- ✅ Reduza densidade para 200 DPI
- ✅ Processe páginas menores por vez

### Erro de memória
- ✅ Processe PDFs menores
- ✅ Feche outros programas
- ✅ Use preset `fast`

### Texto cortado no PDF/EPUB
- ✅ Ajuste margens no config.js
- ✅ Verifique configurações de fonte
- ✅ Use fonte menor

## 📈 Exemplo de Pipeline Completo

```javascript
import ImagePDFToEpub from './index.js';

async function processDocument() {
    // 1. Configurar conversor
    const converter = new ImagePDFToEpub({
        ocr: { languages: 'por+eng' },
        logging: { level: 'debug' }
    });
    
    try {
        // 2. Converter
        const result = await converter.convertImagePDFToEpub('./input.pdf');
        
        // 3. Verificar qualidade
        const avgConfidence = result.ocrResults
            .reduce((sum, page) => sum + page.confidence, 0) 
            / result.ocrResults.length;
            
        console.log(`Confiança média: ${avgConfidence.toFixed(1)}%`);
        
        if (avgConfidence < 80) {
            console.warn('⚠️  Baixa confiança detectada. Considere:');
            console.warn('   - Usar preset highQuality');
            console.warn('   - Verificar idioma do documento');
            console.warn('   - Ajustar brilho/contraste');
        }
        
        // 4. Resultados
        console.log(`📄 PDF: ${result.textPdf}`);
        console.log(`📚 EPUB: ${result.epub}`);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

processDocument();
```

## 🛠️ Configurações Avançadas

### Para documentos técnicos
```javascript
const technicalConfig = {
    ocr: {
        languages: 'eng',
        whiteList: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?()-+*/=<>[]{}|\\@#$%^&_~`"\' \n\t'
    },
    imageProcessing: {
        enhance: {
            brightness: 1.0,
            contrast: 1.4,
            sharpen: { sigma: 0.5 }
        }
    }
};
```

### Para documentos manuscritos
```javascript
const handwrittenConfig = {
    pdfToImage: {
        density: 400,
        width: 3300,
        height: 4677
    },
    imageProcessing: {
        enhance: {
            brightness: 1.2,
            contrast: 1.1,
            sharpen: { sigma: 0.3 }
        }
    },
    advanced: {
        minConfidence: 20  // Aceitar menor confiança
    }
};
```

## 📚 Scripts Úteis

### Processamento em lote
```bash
# Processar múltiplos PDFs
for pdf in *.pdf; do
    echo "Processando: $pdf"
    node index.js "$pdf"
done
```

### Monitoramento de qualidade
```bash
# Ver apenas estatísticas
node index.js documento.pdf | grep -E "(confiança|confidence|páginas|páginas)"
```

## 🎯 Dicas de Otimização

1. **Teste primeiro**: Use preset `fast` para testar
2. **Ajuste gradual**: Aumente qualidade conforme necessário  
3. **Monitore confiança**: Objetivo > 85%
4. **Use idioma correto**: Fundamental para precisão
5. **Pré-processe imagens**: Escaneie em 300+ DPI
6. **Limpe regularmente**: Use `npm run clean`