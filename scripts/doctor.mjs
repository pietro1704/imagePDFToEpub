// File: scripts/doctor.mjs
// Verifica dependências nativas exigidas pelo pdf2pic/tesseract pipeline.

import { ensureBinaries } from "../src/preflight.js";

try {
  await ensureBinaries();
  console.log("✅ GraphicsMagick (gm) e Ghostscript (gs) encontrados.");
  process.exit(0);
} catch (e) {
  console.error(e.message || e);
  process.exit(1);
}
