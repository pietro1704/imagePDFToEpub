// File: src/preflight.js
// Verifica gm + gs antes de executar a conversão e falha com dicas de instalação.

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function cmdOk(cmd, args = ["-version"]) {
  try {
    await execFileAsync(cmd, args, { windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

function installHints() {
  const p = process.platform;
  if (p === "darwin") {
    return [
      "brew install graphicsmagick ghostscript",
      '# If needed: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
    ];
  }
  if (p === "linux") {
    return [
      "sudo apt-get update && sudo apt-get install -y graphicsmagick ghostscript",
      "# RPM: sudo dnf install GraphicsMagick ghostscript",
    ];
  }
  return [
    "choco install graphicsmagick ghostscript -y",
    "# or: scoop install graphicsmagick ghostscript",
  ];
}

function buildError({ gmOk, gsOk }) {
  const lines = [
    "Could not find required native tools for PDF→image conversion.",
    ` - GraphicsMagick (gm): ${gmOk ? "FOUND" : "MISSING"}`,
    ` - Ghostscript (gs): ${gsOk ? "FOUND" : "MISSING"}`,
    "",
    "Install them with one of:",
    ...installHints().map((h) => "  $ " + h),
    "",
    "After installing, re-run: npm run setup && node index.js <your.pdf>",
  ];
  const err = new Error(lines.join("\n"));
  err.code = "PRECHECK_MISSING_BINARIES";
  return err;
}

export async function ensureBinaries() {
  const isWin = process.platform === "win32";
  const gmOk = await cmdOk("gm");
  const gsOk = await cmdOk(isWin ? "gswin64c" : "gs", ["-v"]);
  if (!gmOk || !gsOk) throw buildError({ gmOk, gsOk });
  return { gmOk, gsOk };
}
