import ImagePDFToEpub from './index.js';

async function example() {
    const converter = new ImagePDFToEpub();
    
    console.log('🚀 Exemplo de uso do Image PDF to EPUB Converter');
    console.log('================================================');
    
    // Exemplo de uso programático
    try {
        // Substitua pelo caminho do seu PDF
        const pdfPath = './sample.pdf';
        
        console.log(`📖 Convertendo: ${pdfPath}`);
        
        const result = await converter.convertImagePDFToEpub(pdfPath);
        
        console.log('\n📊 Estatísticas da conversão:');
        console.log(`⏱️  Tempo total: ${result.processingTime.toFixed(2)} minutos`);
        console.log(`📄 Total de páginas: ${result.ocrResults.length}`);
        
        // Calcular confiança média do OCR
        const avgConfidence = result.ocrResults.reduce((sum, page) => sum + page.confidence, 0) / result.ocrResults.length;
        console.log(`🎯 Confiança média do OCR: ${avgConfidence.toFixed(2)}%`);
        
        console.log('\n📁 Arquivos gerados:');
        console.log(`📄 PDF de texto: ${result.textPdf}`);
        console.log(`📚 EPUB: ${result.epub}`);
        
        // Estatísticas detalhadas por página
        console.log('\n📋 Detalhes por página:');
        result.ocrResults.forEach((page, index) => {
            const wordCount = page.text.split(/\s+/).filter(word => word.length > 0).length;
            console.log(`  Página ${index + 1}: ${wordCount} palavras (${page.confidence.toFixed(1)}% confiança)`);
        });
        
    } catch (error) {
        console.error('❌ Erro na conversão:', error.message);
    }
}

// Função para usar com configurações personalizadas
async function advancedExample() {
    const converter = new ImagePDFToEpub();
    
    console.log('\n🔧 Exemplo com configurações avançadas');
    console.log('=====================================');
    
    // Você pode acessar métodos individuais para mais controle
    try {
        const pdfPath = './sample.pdf';
        
        // 1. Converter PDF para imagens
        const images = await converter.convertPDFToImages(pdfPath, {
            density: 400, // Alta densidade para melhor qualidade
            width: 3000,
            height: 4000
        });
        
        console.log(`📸 ${images.length} imagens extraídas`);
        
        // 2. Processar cada imagem
        const ocrResults = [];
        for (const imagePath of images) {
            // Pré-processar imagem
            const processedImage = await converter.preprocessImage(imagePath, {
                brightness: 1.2,
                contrast: 1.4
            });
            
            // OCR com idiomas específicos
            const ocrResult = await converter.performOCR(processedImage, 'por+eng+spa'); // Português, Inglês, Espanhol
            ocrResults.push(ocrResult);
        }
        
        // 3. Criar outputs
        const textPdf = await converter.createTextPDF(ocrResults, 'exemplo_avancado');
        const epub = await converter.createEPUB(ocrResults, 'exemplo_avancado');
        
        console.log(`✅ Conversão avançada concluída!`);
        console.log(`📄 PDF: ${textPdf}`);
        console.log(`📚 EPUB: ${epub}`);
        
        // Limpar arquivos temporários
        await converter.cleanup();
        
    } catch (error) {
        console.error('❌ Erro na conversão avançada:', error.message);
    }
}

// Executar exemplos
if (import.meta.url === `file://${process.argv[1]}`) {
    example()
        .then(() => advancedExample())
        .then(() => console.log('\n🎉 Exemplos concluídos!'))
        .catch(error => console.error('❌ Erro nos exemplos:', error));
}