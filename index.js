// File: index.js
// CLI: node index.js "/path/to/file.pdf"

import Tesseract from "tesseract.js";
import pkgPdf2Pic from "pdf2pic";              // CJS interop
const { fromPath: pdfFromPath } = pkgPdf2Pic;   // extract function
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import EPub from "epub-gen";
import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import { CONFIG, mergeConfig } from "./config.js";
import { ensureBinaries } from "./src/preflight.js";

// Fail early if gm/gs are missing
await ensureBinaries();

class ImagePDFToEpub {
  constructor(userConfig = {}) {
    this.config = mergeConfig(userConfig);
    this.tempDir = this.config.directories.temp;
    this.outputDir = this.config.directories.output;
  }

  async ensureDirectories() {
    await fs.ensureDir(this.tempDir);
    await fs.ensureDir(this.outputDir);
  }

  async convertPDFToImages(pdfPath, options = {}) {
    console.log("Converting PDF to images...");

    const opts = {
      density: options.density ?? this.config.pdfToImage.density,
      saveFilename: "page",
      savePath: this.tempDir,
      format: this.config.pdfToImage.format,
      width: options.width ?? this.config.pdfToImage.width,
      height: options.height ?? this.config.pdfToImage.height,
      quality: this.config.pdfToImage.quality,
    };

    const convert = pdfFromPath(pdfPath, opts);

    try {
      const results = await convert.bulk(-1);
      console.log(`Converted ${results.length} pages to images`);
      return results.map((r) => r.path);
    } catch (e) {
      // Why: clarify native deps when gm/pdf2pic fails at runtime
      console.error("gm/pdf2pic failed. Ensure GraphicsMagick + Ghostscript are installed.");
      throw e;
    }
  }

  async preprocessImage(imagePath, overrides = {}) {
    console.log(`Preprocessing image: ${path.basename(imagePath)}`);
    const p = this.config.imageProcessing;
    const resize = overrides.width && overrides.height
      ? { width: overrides.width, height: overrides.height }
      : p.resize;

    const out = imagePath.replace(/\.png$/i, "_processed.png");

    let pipeline = sharp(imagePath).resize(resize.width, resize.height);
    if (p.greyscale) pipeline = pipeline.greyscale();
    if (p.normalize) pipeline = pipeline.normalize();
    if (p.enhance?.sharpen?.sigma) pipeline = pipeline.sharpen({ sigma: p.enhance.sharpen.sigma });

    pipeline = pipeline.modulate({
      brightness: overrides.brightness ?? p.enhance.brightness,
      contrast: overrides.contrast ?? p.enhance.contrast,
    });

    await pipeline.png({ quality: p.quality }).toFile(out);
    return out;
  }

  async performOCR(imagePath, language = this.config.ocr.languages) {
    console.log(`Performing OCR on: ${path.basename(imagePath)}`);

    const result = await Tesseract.recognize(imagePath, language, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      tessedit_pageseg_mode: Tesseract.PSM[this.config.ocr.pageSegMode] || Tesseract.PSM.AUTO,
      tessedit_ocr_engine_mode: Tesseract.OEM[this.config.ocr.engine] || Tesseract.OEM.LSTM_ONLY,
      tessedit_char_whitelist: this.config.ocr.whiteList,
      preserve_interword_spaces: this.config.ocr.preserveSpaces ? "1" : "0",
      user_defined_dpi: String(this.config.ocr.dpi),
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words,
    };
  }

  async createTextPDF(ocrResults, originalPdfName) {
    console.log("Creating text-only PDF...");

    const cfg = this.config.textPdf;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts[cfg.font] || StandardFonts.TimesRoman);

    let allText = "";
    ocrResults.forEach((r, i) => {
      if (r.text?.trim()) {
        allText += `\n--- Página ${i + 1} ---\n\n` + r.text.trim() + "\n\n";
      }
    });

    const fontSize = cfg.fontSize;
    const margin = cfg.margin;
    const pageWidth = cfg.pageSize.width;
    const pageHeight = cfg.pageSize.height;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = fontSize * cfg.lineHeight;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    for (const line of allText.split("\n")) {
      if (line.trim() === "") { y -= lineHeight; continue; }
      const words = line.split(" ");
      let current = "";
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        const w = font.widthOfTextAtSize(test, fontSize);
        if (w <= maxWidth) current = test; else {
          if (current) {
            if (y < margin) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - margin; }
            page.drawText(current, { x: margin, y, size: fontSize, font, color: rgb(cfg.color.r, cfg.color.g, cfg.color.b) });
            y -= lineHeight;
          }
          current = word;
        }
      }
      if (current) {
        if (y < margin) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - margin; }
        page.drawText(current, { x: margin, y, size: fontSize, font, color: rgb(cfg.color.r, cfg.color.g, cfg.color.b) });
        y -= lineHeight;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const out = path.join(this.outputDir, `${originalPdfName}_text.pdf`);
    await fs.writeFile(out, pdfBytes);
    console.log(`Text PDF created: ${out}`);
    return out;
  }

  async createEPUB(ocrResults, originalPdfName) {
    console.log("Creating EPUB...");
    const chapters = ocrResults
      .map((r, i) => {
        const content = (r.text || "").trim();
        if (!content) return null;
        return {
          title: `Página ${i + 1}`,
          data: `<h2>Página ${i + 1}</h2><p>${content.replace(/\n/g, "</p><p>")}</p>`,
        };
      })
      .filter(Boolean);

    const options = {
      title: `${originalPdfName} (Convertido)`,
      author: "Convertido via OCR",
      publisher: "ImagePDF to EPUB Converter",
      content: chapters,
      css: this.config.epub.css,
      fonts: [],
      lang: this.config.epub.language,
      tocTitle: "Índice",
      appendChapterTitles: true,
      verbose: false,
    };

    const epubPath = path.join(this.outputDir, `${originalPdfName}.epub`);
    await new EPub(options, epubPath).promise;
    console.log(`EPUB created: ${epubPath}`);
    return epubPath;
  }

  async cleanup() {
    try {
      await fs.remove(this.tempDir);
      await fs.ensureDir(this.tempDir);
      console.log("🧹 Temporary files cleaned up");
    } catch (e) {
      console.warn("Warning: Could not clean up temporary files:", e.message);
    }
  }

  async convertImagePDFToEpub(pdfPath) {
    await this.ensureDirectories();
    try {
      console.log("Starting PDF to EPUB conversion...");
      const start = Date.now();
      const originalPdfName = path.basename(pdfPath, ".pdf");

      const images = await this.convertPDFToImages(pdfPath, {
        density: this.config.pdfToImage.density,
        width: this.config.pdfToImage.width,
        height: this.config.pdfToImage.height,
      });

      const ocrResults = [];
      for (let i = 0; i < images.length; i++) {
        const imagePath = images[i];
        console.log(`\nProcessing page ${i + 1}/${images.length}`);

        const processed = await this.preprocessImage(imagePath, {
          brightness: this.config.imageProcessing.enhance.brightness,
          contrast: this.config.imageProcessing.enhance.contrast,
        });

        const ocr = await this.performOCR(processed, this.config.ocr.languages);
        ocrResults.push(ocr);

        console.log(`Page ${i + 1} OCR confidence: ${ocr.confidence?.toFixed?.(2) ?? 0}%`);
        console.log(`Text preview: ${(ocr.text || "").substring(0, 100)}...`);

        await fs.remove(imagePath).catch(() => {});
        await fs.remove(processed).catch(() => {});
      }

      const textPdfPath = await this.createTextPDF(ocrResults, originalPdfName);
      const epubPath = await this.createEPUB(ocrResults, originalPdfName);

      await this.cleanup();

      const duration = (Date.now() - start) / 1000 / 60;
      console.log("\n✅ Conversion completed successfully!");
      console.log(`⏱️  Total time: ${duration.toFixed(2)} minutes`);
      console.log(`📄 Text PDF: ${textPdfPath}`);
      console.log(`📚 EPUB: ${epubPath}`);

      return { textPdf: textPdfPath, epub: epubPath, ocrResults, processingTime: duration };
    } catch (error) {
      console.error("❌ Error during conversion:", error);
      await this.cleanup();
      throw error;
    }
  }
}

async function main() {
  const converter = new ImagePDFToEpub();
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("📖 Image PDF to EPUB Converter");
    console.log("Usage: node index.js <pdf-file-path>");
    console.log("Example: node index.js ./document.pdf");
    process.exit(1);
  }

  const pdfPath = args[0];
  if (!(await fs.pathExists(pdfPath))) {
    console.error(`❌ File not found: ${pdfPath}`);
    process.exit(1);
  }

  try {
    await converter.convertImagePDFToEpub(pdfPath);
  } catch (error) {
    console.error("❌ Conversion failed:", error.message || String(error));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ImagePDFToEpub;
