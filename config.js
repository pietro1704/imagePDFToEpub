// File: config.js
// Centraliza parâmetros de conversão e OCR.

export const CONFIG = {
  directories: {
    temp: ".tmp",
    output: "output",
  },
  pdfToImage: {
    density: 300,
    format: "png",
    width: 2480,   // A4 @ 300dpi (aprox)
    height: 3508,
    quality: 100,
  },
  imageProcessing: {
    resize: { width: 2480, height: 3508 },
    greyscale: true,
    normalize: true,
    quality: 100,
    enhance: {
      sharpen: { sigma: 1.2 },
      brightness: 1.1,
      contrast: 1.2,
    },
  },
  ocr: {
    languages: "por+eng",
    dpi: 300,
    pageSegMode: "AUTO",     // Tesseract.PSM.AUTO
    engine: "LSTM_ONLY",     // Tesseract.OEM.LSTM_ONLY
    whiteList: "",           // vazio = tudo permitido
    preserveSpaces: true,
  },
  textPdf: {
    font: "TimesRoman",
    fontSize: 12,
    margin: 50,
    pageSize: { width: 595.28, height: 841.89 }, // A4 em pontos
    lineHeight: 1.2,
    color: { r: 0, g: 0, b: 0 },
  },
  epub: {
    language: "pt",
    css: `
      body{font-family:Georgia,serif;line-height:1.6;margin:20px}
      h2{color:#333;border-bottom:2px solid #333;padding-bottom:10px}
      p{text-align:justify;margin-bottom:15px}
    `,
  },
};

export function mergeConfig(user = {}) {
  return deepMerge(structuredClone(CONFIG), user);
}

function isObject(v) { return v && typeof v === "object" && !Array.isArray(v); }

function deepMerge(target, src) {
  for (const k of Object.keys(src)) {
    const sv = src[k];
    if (Array.isArray(sv)) target[k] = sv.slice();
    else if (isObject(sv)) target[k] = deepMerge(target[k] ?? {}, sv);
    else target[k] = sv;
  }
  return target;
}
