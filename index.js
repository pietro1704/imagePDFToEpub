import Tesseract from 'tesseract.js';
import pdf2pic from 'pdf2pic';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import EPub from 'epub-gen';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { CONFIG, mergeConfig } from './config.js';

class ImagePDFToEpub {
    constructor(userConfig = {}) {
        this.config = mergeConfig(userConfig);
        this.tempDir = this.config.directories.temp;
        this.outputDir = this.config.directories.output;
        this.ensureDirectories();
    }

    async ensureDirectories() {
        await fs.ensureDir(this.tempDir);
        await fs.ensureDir(this.outputDir);
    }

    async convertPDFToImages(pdfPath, options = {}) {
        console.log('Converting PDF to images...');
        
        const convert = pdf2pic.fromPath(pdfPath, {
            density: options.density || 300,
            saveFilename: "page",
            savePath: this.tempDir,
            format: "png",
            width: options.width || 2480,
            height: options.height || 3508
        });

        const results = await convert.bulk(-1);
        console.log(`Converted ${results.length} pages to images`);
        return results.map(result => result.path);
    }

    async preprocessImage(imagePath, options = {}) {
        console.log(`Preprocessing image: ${path.basename(imagePath)}`);
        
        const outputPath = imagePath.replace('.png', '_processed.png');
        
        await sharp(imagePath)
            .resize(options.width || 2480, options.height || 3508)
            .greyscale()
            .normalize()
            .sharpen({ sigma: 1.2 })
            .modulate({
                brightness: options.brightness || 1.1,
                contrast: options.contrast || 1.2
            })
            .png({ quality: 100 })
            .toFile(outputPath);
        
        return outputPath;
    }

    async performOCR(imagePath, language = 'por+eng') {
        console.log(`Performing OCR on: ${path.basename(imagePath)}`);
        
        const result = await Tesseract.recognize(imagePath, language, {
            logger: m => {
                if (m.status === 'recognizing text') {
                    console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
            },
            tessedit_pageseg_mode: Tesseract.PSM.AUTO,
            tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
            tessedit_char_whitelist: '',
            preserve_interword_spaces: '1',
            user_defined_dpi: '300'
        });

        return {
            text: result.data.text,
            confidence: result.data.confidence,
            words: result.data.words
        };
    }

    async createTextPDF(ocrResults, originalPdfName) {
        console.log('Creating text-only PDF...');
        
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        
        let allText = '';
        ocrResults.forEach((result, index) => {
            if (result.text.trim()) {
                allText += `\n--- Página ${index + 1} ---\n\n`;
                allText += result.text.trim();
                allText += '\n\n';
            }
        });

        const fontSize = 12;
        const margin = 50;
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const maxWidth = pageWidth - 2 * margin;
        const lineHeight = fontSize * 1.2;
        
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let yPosition = pageHeight - margin;
        
        const lines = allText.split('\n');
        
        for (const line of lines) {
            if (line.trim() === '') {
                yPosition -= lineHeight;
                continue;
            }
            
            const words = line.split(' ');
            let currentLine = '';
            
            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const textWidth = font.widthOfTextAtSize(testLine, fontSize);
                
                if (textWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        if (yPosition < margin) {
                            page = pdfDoc.addPage([pageWidth, pageHeight]);
                            yPosition = pageHeight - margin;
                        }
                        
                        page.drawText(currentLine, {
                            x: margin,
                            y: yPosition,
                            size: fontSize,
                            font: font,
                            color: rgb(0, 0, 0),
                        });
                        
                        yPosition -= lineHeight;
                    }
                    currentLine = word;
                }
            }
            
            if (currentLine) {
                if (yPosition < margin) {
                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                    yPosition = pageHeight - margin;
                }
                
                page.drawText(currentLine, {
                    x: margin,
                    y: yPosition,
                    size: fontSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                
                yPosition -= lineHeight;
            }
        }
        
        const pdfBytes = await pdfDoc.save();
        const outputPath = path.join(this.outputDir, `${originalPdfName}_text.pdf`);
        await fs.writeFile(outputPath, pdfBytes);
        
        console.log(`Text PDF created: ${outputPath}`);
        return outputPath;
    }

    async createEPUB(ocrResults, originalPdfName) {
        console.log('Creating EPUB...');
        
        const chapters = ocrResults.map((result, index) => {
            const content = result.text.trim();
            if (!content) return null;
            
            return {
                title: `Página ${index + 1}`,
                data: `<h2>Página ${index + 1}</h2><p>${content.replace(/\n/g, '</p><p>')}</p>`
            };
        }).filter(chapter => chapter !== null);

        const options = {
            title: `${originalPdfName} (Convertido)`,
            author: 'Convertido via OCR',
            publisher: 'ImagePDF to EPUB Converter',
            cover: null,
            content: chapters,
            css: `
                body { 
                    font-family: Georgia, serif; 
                    line-height: 1.6; 
                    margin: 20px;
                }
                h2 { 
                    color: #333; 
                    border-bottom: 2px solid #333; 
                    padding-bottom: 10px;
                }
                p { 
                    text-align: justify; 
                    margin-bottom: 15px;
                }
            `,
            fonts: [],
            lang: 'pt',
            tocTitle: 'Índice',
            appendChapterTitles: true,
            customOpfTemplatePath: null,
            customNcxTocTemplatePath: null,
            customHtmlTocTemplatePath: null,
            verbose: false
        };

        const epubPath = path.join(this.outputDir, `${originalPdfName}.epub`);
        
        return new Promise((resolve, reject) => {
            new EPub(options, epubPath)
                .promise
                .then(() => {
                    console.log(`EPUB created: ${epubPath}`);
                    resolve(epubPath);
                })
                .catch(reject);
        });
    }

    async convertImagePDFToEpub(pdfPath) {
        try {
            console.log('Starting PDF to EPUB conversion...');
            const startTime = Date.now();
            
            const originalPdfName = path.basename(pdfPath, '.pdf');
            
            const imagesPaths = await this.convertPDFToImages(pdfPath, {
                density: 300,
                width: 2480,
                height: 3508
            });
            
            const ocrResults = [];
            
            for (let i = 0; i < imagesPaths.length; i++) {
                const imagePath = imagesPaths[i];
                console.log(`\nProcessing page ${i + 1}/${imagesPaths.length}`);
                
                const processedImagePath = await this.preprocessImage(imagePath, {
                    brightness: 1.1,
                    contrast: 1.3
                });
                
                const ocrResult = await this.performOCR(processedImagePath, 'por+eng');
                ocrResults.push(ocrResult);
                
                console.log(`Page ${i + 1} OCR confidence: ${ocrResult.confidence.toFixed(2)}%`);
                console.log(`Text preview: ${ocrResult.text.substring(0, 100)}...`);
                
                await fs.remove(imagePath);
                await fs.remove(processedImagePath);
            }
            
            const textPdfPath = await this.createTextPDF(ocrResults, originalPdfName);
            const epubPath = await this.createEPUB(ocrResults, originalPdfName);
            
            await this.cleanup();
            
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000 / 60;
            
            console.log(`\n✅ Conversion completed successfully!`);
            console.log(`⏱️  Total time: ${duration.toFixed(2)} minutes`);
            console.log(`📄 Text PDF: ${textPdfPath}`);
            console.log(`📚 EPUB: ${epubPath}`);
            
            return {
                textPdf: textPdfPath,
                epub: epubPath,
                ocrResults: ocrResults,
                processingTime: duration
            };
            
        } catch (error) {
            console.error('❌ Error during conversion:', error);
            await this.cleanup();
            throw error;
        }
    }

    async cleanup() {
        try {
            await fs.remove(this.tempDir);
            await fs.ensureDir(this.tempDir);
            console.log('🧹 Temporary files cleaned up');
        } catch (error) {
            console.warn('Warning: Could not clean up temporary files:', error.message);
        }
    }
}

async function main() {
    const converter = new ImagePDFToEpub();
    
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('📖 Image PDF to EPUB Converter');
        console.log('Usage: node index.js <pdf-file-path>');
        console.log('Example: node index.js ./document.pdf');
        process.exit(1);
    }
    
    const pdfPath = args[0];
    
    if (!await fs.pathExists(pdfPath)) {
        console.error(`❌ File not found: ${pdfPath}`);
        process.exit(1);
    }
    
    try {
        await converter.convertImagePDFToEpub(pdfPath);
    } catch (error) {
        console.error('❌ Conversion failed:', error.message);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default ImagePDFToEpub;