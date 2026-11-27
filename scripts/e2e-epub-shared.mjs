import assert from "node:assert/strict";
import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
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

async function buildSampleEpubBuffer() {
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`
  );
  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="2.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>E2E Owl Book</dc:title><dc:creator>Test</dc:creator><dc:language>es</dc:language></metadata><manifest><item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/></manifest><spine toc="ncx"><itemref idref="ch1"/></spine></package>`
  );
  zip.file(
    "OEBPS/ch1.xhtml",
    `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Capítulo 1</h1><p>La gran lechuza volaba por el bosque oscuro.</p></body></html>`
  );
  return zip.generateAsync({ type: "nodebuffer" });
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server did not start at ${url}`);
}

const previewPort = 4173;
const baseUrl = process.env.E2E_BASE_URL || `http://127.0.0.1:${previewPort}`;
let serverProc = null;

if (!process.env.E2E_BASE_URL) {
  serverProc = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", String(previewPort)], {
    stdio: "ignore",
    detached: true,
  });
  await waitForServer(baseUrl);
}

const { chromium } = loadPlaywright();
const executablePath = existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined;
const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 850 }, acceptDownloads: true });
const page = await context.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

try {
  // Mock backend APIs so test is deterministic and offline-safe
  await page.route("**/auth/v1/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: null, session: null }) });
  });
  await page.route("**/rest/v1/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  await page.route("**/api/parse/batch", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    const blocks = (body.texts || []).map((text) => {
      const idx = text.indexOf("lechuza");
      const tokens = idx >= 0 ? [
        { surface: "La", start: 0, end: 2, is_word: true, pos: "DET", user_status: "known", canonical: { id: "can-la", canonical_id: "can-la", lemma: "el", pos: "DET", level: "A1", rank: 1, rank_source: "TubeLex", definitions: ["the"] } },
        { surface: "lechuza", start: idx, end: idx + 7, is_word: true, pos: "NOUN", user_status: null, canonical: { id: "can-lechuza", canonical_id: "can-lechuza", lemma: "lechuza", pos: "NOUN", level: "B2", rank: 8420, rank_source: "TubeLex", definitions: ["barn owl"] } },
        { surface: "volaba", start: idx + 8, end: idx + 14, is_word: true, pos: "VERB", user_status: "known", canonical: { id: "can-volar", canonical_id: "can-volar", lemma: "volar", pos: "VERB", level: "A2", rank: 1200, rank_source: "TubeLex", definitions: ["to fly"] } },
      ] : [];
      return { text, tokens, phrases: [], stats: { total_tokens: tokens.length, phrases_count: 0 } };
    });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ blocks }) });
  });

  await page.route("**/api/sentence-bank*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        rows: [{
          id: "ex-all-1", media_item_id: "m1", sentence: "Una lechuza blanca duerme aquí.", token_count: 5,
          source_context: "Corpus All", canonical_ids: ["can-lechuza"],
          tokens: [{ surface: "lechuza", start_char: 4, end_char: 11, canonical_id: "can-lechuza" }],
        }],
        elapsed_ms: 14,
      }),
    });
  });

  await page.route("**/rest/v1/rpc/get_word_sentences_fast", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{
        id: "ex-all-1", media_item_id: "m1", sentence: "Una lechuza blanca duerme aquí.", token_count: 5,
        source_context: "Corpus All", canonical_ids: ["can-lechuza"],
        tokens: [{ surface: "lechuza", start_char: 4, end_char: 11, canonical_id: "can-lechuza" }],
      }]),
    });
  });

  await page.route("**/rest/v1/sentence_examples*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{
        id: "ex-all-1", media_item_id: "m1", sentence: "Una lechuza blanca duerme aquí.", token_count: 5,
        source_context: "Corpus All", canonical_ids: ["can-lechuza"],
        tokens: [{ surface: "lechuza", start_char: 4, end_char: 11, canonical_id: "can-lechuza" }],
      }]),
    });
  });

  await page.route("**/rest/v1/rpc/get_i_plus_one_sentences", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    const maxU = body.p_max_unknown || 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{
        id: `ex-i${maxU}`, media_item_id: "m1", sentence: `Oración i+${maxU} con lechuza.`, token_count: 4,
        source_context: `Bank i+${maxU}`, canonical_ids: ["can-lechuza"], unknown_count: maxU,
        tokens: [{ surface: "lechuza", start_char: 15, end_char: 22, canonical_id: "can-lechuza" }],
      }]),
    });
  });

  await page.route("**/translate.googleapis.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([[["The great owl was flying through the dark forest.", "La gran lechuza volaba por el bosque oscuro."]]]) });
  });

  await page.route("**/wikipedia.org/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        query: { pages: { "1": { index: 1, title: "Tyto alba", fullurl: "https://es.wikipedia.org/wiki/Tyto_alba", thumbnail: { source: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" } } } },
      }),
    });
  });

  await page.goto(`${baseUrl}/epub`, { waitUntil: "networkidle", timeout: 30000 });
  const epubBuf = await buildSampleEpubBuffer();
  const fileInput = page.locator('input[type="file"][accept*=".epub"]').first();
  await fileInput.setInputFiles({ name: "owl.epub", mimeType: "application/epub+zip", buffer: epubBuf });

  const wordBtn = page.locator("span", { hasText: /^lechuza$/ }).first();
  await wordBtn.waitFor({ state: "visible", timeout: 15000 });
  await wordBtn.click();

  const popover = page.locator("[data-epub-popover]");
  await popover.waitFor({ state: "visible", timeout: 10000 });
  const popText = await popover.innerText();
  assert.ok(popText.includes("lechuza"), "Popover should show lemma");
  assert.ok(popText.includes("B2"), "Popover should show level B2");
  assert.ok(popText.includes("TubeLex #8420"), "Popover should show rank");
  assert.ok(popText.includes("barn owl"), "Popover should show definition");

  // Verify S/M/L toggle is NOT directly on the word popover header, and size setting scales width & fonts
  assert.equal(await popover.locator('[aria-label="Popover size"]').count(), 0, "Size toggle should not be directly on word popover");
  const measurePopover = () => popover.evaluate((el) => ({
    w: el.getBoundingClientRect().width,
    lemma: parseFloat(getComputedStyle(el.querySelector("[data-popover-lemma]")).fontSize),
    badge: parseFloat(getComputedStyle(el.querySelector("[data-popover-badge]")).fontSize),
    def: parseFloat(getComputedStyle(el.querySelector("ul li")).fontSize),
  }));
  const mSm = await measurePopover();
  await popover.getByTitle("Close (Esc)").click();
  await page.evaluate(() => localStorage.setItem("threshold_popover_size", "lg"));
  await wordBtn.click();
  await popover.waitFor({ state: "visible", timeout: 5000 });
  const mLg = await measurePopover();
  assert.ok(mSm.w < mLg.w && mSm.lemma < mLg.lemma && mSm.badge < mLg.badge && mSm.def < mLg.def,
    `Expected lg > sm across width & fonts, got ${JSON.stringify({ mSm, mLg })}`);
  await page.evaluate(() => localStorage.setItem("threshold_popover_size", "sm"));

  // Sentence tab + Sentence Bank + Anki (.apkg)
  await popover.getByRole("button", { name: "Sentence" }).click();
  await page.waitForFunction(() => document.querySelector("[data-epub-popover]")?.textContent?.includes("Sentence Bank"), { timeout: 5000 });
  assert.ok((await popover.innerText()).includes("Corpus All"), "Sentence Bank All mode should render");
  const popBox = await popover.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, vh: window.innerHeight, vw: window.innerWidth };
  });
  assert.ok(popBox.top >= 8 && popBox.bottom <= popBox.vh - 8, `Popover clipped vertically: ${JSON.stringify(popBox)}`);
  assert.ok(popBox.left >= 8 && popBox.right <= popBox.vw - 8, `Popover clipped horizontally: ${JSON.stringify(popBox)}`);

  await popover.getByRole("button", { name: "Translate" }).click();
  await page.waitForFunction(() => document.querySelector("[data-epub-popover]")?.textContent?.includes("The great owl"), { timeout: 5000 });

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 10000 }),
    popover.getByRole("button", { name: /Anki/i }).click(),
  ]);
  assert.ok(download.suggestedFilename().endsWith(".apkg"), `Expected .apkg download, got ${download.suggestedFilename()}`);

  // Visual tab
  await popover.getByRole("button", { name: "Visual" }).click();
  await page.waitForFunction(() => document.querySelector("[data-epub-popover]")?.textContent?.includes("es.wikipedia"), { timeout: 5000 });

  // Close & test right-click Action Wheel
  await popover.getByTitle("Close (Esc)").click();
  await popover.waitFor({ state: "hidden", timeout: 5000 });
  await wordBtn.click({ button: "right" });
  await page.waitForFunction(() => document.body.innerText.includes("Inspect") && document.body.innerText.includes("Audio"), { timeout: 5000 });
  await page.getByRole("button", { name: "Inspect" }).click();
  await popover.waitFor({ state: "visible", timeout: 5000 });

  assert.equal(errors.length, 0, `Unexpected errors: ${errors.join("; ")}`);
  console.log("E2E EPUB PASS: Popover, Sentence Bank, Translate, Anki .apkg, Visual tab, and Action Wheel verified with 0 errors.");
} finally {
  await browser.close();
  if (serverProc) {
    try { process.kill(-serverProc.pid); } catch {}
  }
}
