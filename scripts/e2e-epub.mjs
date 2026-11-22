import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, writeFileSync, unlinkSync } from "node:fs";
import JSZip from "jszip";

const require = createRequire(import.meta.url);

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    const pwBin = execSync("mise which playwright", { encoding: "utf8" }).trim();
    const pkgDir = execSync(
      `dirname "$(find "$(dirname "$(dirname "$(readlink -f "${pwBin}")")")" -path "*/node_modules/playwright/package.json" | head -n 1)"`,
      { encoding: "utf8", shell: "/bin/bash" }
    ).trim();
    return require(pkgDir);
  }
}

async function createTempEpub(filePath) {
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip");
  zip.file("META-INF/container.xml", `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  zip.file("OEBPS/content.opf", `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Cuento de Prueba</dc:title><dc:creator>Autor Test</dc:creator><dc:language>es</dc:language></metadata><manifest><item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="ch1"/></spine></package>`);
  zip.file("OEBPS/ch1.xhtml", `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Capítulo Uno</h1><p>El gato duerme tranquilamente sobre la mesa antigua.</p></body></html>`);
  const buf = await zip.generateAsync({ type: "nodebuffer" });
  writeFileSync(filePath, buf);
}

const { chromium } = loadPlaywright();
const targetUrl = process.env.E2E_EPUB_URL || "https://threshold-index.pages.dev/epub";
const executablePath = existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined;
const tmpEpub = "/tmp/threshold-test-book.epub";
await createTempEpub(tmpEpub);

const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const consoleErrors = [];
page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });

try {
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.setInputFiles("input[type='file']", tmpEpub);
  await page.waitForSelector("text=Cuento de Prueba", { timeout: 15000 });
  await page.waitForSelector("span[role='button']:has-text('gato')", { timeout: 25000 });
  await page.locator("span[role='button']:has-text('gato')").first().click();
  await page.waitForSelector("button:has-text('Definitions')", { timeout: 10000 });
  await page.locator("button[aria-label='Toggle reading mode']").click();
  await page.waitForSelector("text=Page 1 /", { timeout: 5000 });
  await page.reload({ waitUntil: "networkidle", timeout: 45000 });
  await page.waitForSelector("text=Cuento de Prueba", { timeout: 15000 });
  assert.equal(consoleErrors.length, 0, `Unexpected console errors: ${consoleErrors.join("; ")}`);
  console.log("E2E EPUB PASS (mobile 390x844): uploaded .epub, parsed Spanish chapter via API, opened word popover, toggled Paged mode, persisted in IndexedDB, 0 console errors.");
} finally {
  await browser.close();
  try { unlinkSync(tmpEpub); } catch {}
}
