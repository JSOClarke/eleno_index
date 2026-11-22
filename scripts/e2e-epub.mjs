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
  zip.file("OEBPS/ch1.xhtml", `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Capítulo Uno</h1><p>El gato duerme tranquilamente sobre la mesa antigua.</p><p>Sin embargo, tengo que leer.</p></body></html>`);
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
  await page.waitForSelector("button:has-text('Noun')", { timeout: 5000 });
  await page.locator("button:has-text('Sentence')").click();
  await page.waitForSelector("button:has-text('Anki (.apkg)')", { timeout: 5000 });
  await page.mouse.click(10, 10);
  await page.locator("span[role='button']:has-text('embargo')").first().click();
  await page.waitForSelector("text=/Idiom|Periphrasis/", { timeout: 5000 });
  await page.mouse.click(10, 10);
  await page.locator("button[aria-label='Toggle reading mode']").click();
  await page.waitForSelector("text=Page 1 /", { timeout: 5000 });
  const layoutCheck = await page.evaluate(() => {
    const hdrs = Array.from(document.querySelectorAll("header")).map((h) => h.getBoundingClientRect());
    const p1 = document.querySelector("[data-block-idx='0'] p")?.getBoundingClientRect();
    const nextBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Next"));
    return {
      topNavBottom: hdrs[0]?.bottom ?? 0,
      readerHeaderTop: hdrs[1]?.top ?? 0,
      readerHeaderLeft: hdrs[1]?.left ?? 0,
      p1Left: p1?.left ?? 0,
      nextBox: nextBtn?.getBoundingClientRect() ?? null,
    };
  });
  assert.ok(Math.abs(layoutCheck.readerHeaderTop - layoutCheck.topNavBottom) <= 2, `Expected zero gap between headers, got ${JSON.stringify(layoutCheck)}`);
  assert.equal(layoutCheck.readerHeaderLeft, 0, `Expected full-width reader header, got left=${layoutCheck.readerHeaderLeft}`);
  assert.ok(layoutCheck.nextBox && layoutCheck.nextBox.y + layoutCheck.nextBox.height <= 844, `Expected Next button inside 844px mobile viewport, got ${JSON.stringify(layoutCheck.nextBox)}`);
  await page.reload({ waitUntil: "networkidle", timeout: 45000 });
  await page.waitForSelector("text=Cuento de Prueba", { timeout: 15000 });
  const swReady = await page.evaluate(async () => {
    const res = await fetch("/manifest.webmanifest");
    const m = await res.json();
    const reg = await navigator.serviceWorker.ready;
    return { manifestOk: res.ok && m.icons?.length >= 2, swActive: Boolean(reg.active) };
  });
  assert.ok(swReady.manifestOk && swReady.swActive, `Expected valid PWA manifest and active SW, got ${JSON.stringify(swReady)}`);
  assert.equal(consoleErrors.length, 0, `Unexpected console errors: ${consoleErrors.join("; ")}`);
  console.log("E2E EPUB PASS (mobile 390x844): uploaded .epub, parsed Spanish chapter via API, opened word popover, toggled Paged mode, persisted in IndexedDB, 0 console errors.");
} finally {
  await browser.close();
  try { unlinkSync(tmpEpub); } catch {}
}
