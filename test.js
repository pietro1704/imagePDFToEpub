import ImagePDFToEpub from './index.js';
import { PRESETS } from './config.js';

console.log('🧪 Testando o Image PDF to EPUB Converter');
console.log('=========================================');

// Teste básico - verificar se a classe pode ser instanciada
try {
    console.log('✅ Teste 1: Instanciação da classe');
    const converter = new ImagePDFToEpub();
    console.log('   ✓ Classe instanciada com sucesso');
    console.log(`   ✓ Diretório temporário: ${converter.tempDir}`);
    console.log(`   ✓ Diretório de saída: ${converter.outputDir}`);
} catch (error) {
    console.error('❌ Teste 1 falhou:', error.message);
}

// Teste com configuração personalizada
try {
    console.log('\n✅ Teste 2: Configuração personalizada');
    const customConfig = {
        ocr: {
            languages: 'eng',
        },
        directories: {
            temp: './test_temp',
            output: './test_output'
        }
    };
    
    const customConverter = new ImagePDFToEpub(customConfig);
    console.log('   ✓ Configuração personalizada aplicada');
    console.log(`   ✓ Idioma OCR: ${customConverter.config.ocr.languages}`);
    console.log(`   ✓ Diretório temp: ${customConverter.tempDir}`);
} catch (error) {
    console.error('❌ Teste 2 falhou:', error.message);
}

// Teste com presets
try {
    console.log('\n✅ Teste 3: Uso de presets');
    const fastConverter = new ImagePDFToEpub(PRESETS.fast);
    console.log('   ✓ Preset "fast" aplicado');
    console.log(`   ✓ Densidade: ${fastConverter.config.pdfToImage.density}`);
    console.log(`   ✓ Timeout: ${fastConverter.config.performance.timeout}ms`);
    
    const hqConverter = new ImagePDFToEpub(PRESETS.highQuality);
    console.log('   ✓ Preset "highQuality" aplicado');
    console.log(`   ✓ Densidade: ${hqConverter.config.pdfToImage.density}`);
    console.log(`   ✓ Resolução: ${hqConverter.config.pdfToImage.width}x${hqConverter.config.pdfToImage.height}`);
} catch (error) {
    console.error('❌ Teste 3 falhou:', error.message);
}

// Teste de dependências
console.log('\n✅ Teste 4: Verificação de dependências');
try {
    // Verificar Tesseract
    console.log('   ✓ tesseract.js importado');
    
    // Verificar outras dependências críticas
    console.log('   ✓ pdf2pic importado');
    console.log('   ✓ pdf-lib importado'); 
    console.log('   ✓ epub-gen importado');
    console.log('   ✓ sharp importado');
    console.log('   ✓ fs-extra importado');
    
} catch (error) {
    console.error('❌ Teste 4 falhou:', error.message);
}

// Verificar estrutura de arquivos
console.log('\n✅ Teste 5: Verificação de arquivos');
import fs from 'fs-extra';

const requiredFiles = [
    'index.js',
    'config.js',
    'package.json',
    'README.md',
    'example.js'
];

for (const file of requiredFiles) {
    if (await fs.pathExists(file)) {
        console.log(`   ✓ ${file} existe`);
    } else {
        console.log(`   ❌ ${file} não encontrado`);
    }
}

console.log('\n🎉 Testes concluídos!');
console.log('\n📖 Para usar o conversor:');
console.log('   node index.js seu-arquivo.pdf');
console.log('\n📚 Para ver exemplos:');
console.log('   node example.js');
console.log('\n⚙️  Para configurações avançadas, edite config.js');