import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";

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

const { chromium } = loadPlaywright();
const targetUrl = process.env.E2E_URL || "https://threshold-index.pages.dev/catalogue";
const executablePath = existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined;

const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

const getCardTitles = () =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("main h3, [class*='grid'] h3, a h3"))
      .map((el) => el.textContent?.trim() || "")
      .filter(Boolean)
      .slice(0, 10)
  );

try {
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForSelector("button[aria-label='Sort catalogue items']", { timeout: 15000 });
  await page.waitForFunction(
    () => document.body.innerText.includes("Showing 1–"),
    { timeout: 20000 }
  );

  const getVisibleTitles = () =>
    page.evaluate(() => {
      const grid = document.querySelector("div.grid.grid-cols-1.xl\\:grid-cols-2");
      if (!grid) return [];
      return Array.from(grid.children)
        .map((c) => {
          const lines = (c.innerText || "").split("\n").map((s) => s.trim()).filter(Boolean);
          return lines[1] || lines[0] || "";
        })
        .filter(Boolean)
        .slice(0, 8);
    });

  const beforeTitles = await getVisibleTitles();
  console.log("BEFORE (flow_desc):", beforeTitles);
  assert.ok(beforeTitles.length >= 4, "Expected at least 4 catalogue cards rendered");

  const sortBtn = page.locator("button[aria-label='Sort catalogue items']").first();
  await sortBtn.click();
  await page.locator("[role='option']:has-text('Most Popular')").click();
  await page.waitForTimeout(500);

  const urlAfterPopular = page.url();
  console.log("URL AFTER Most Popular:", urlAfterPopular);
  assert.ok(urlAfterPopular.includes("sort=popularity_desc"), `Expected ?sort=popularity_desc in URL, got ${urlAfterPopular}`);

  const afterTitles = await getVisibleTitles();
  console.log("AFTER (popularity_desc):", afterTitles);
  assert.notDeepEqual(afterTitles, beforeTitles, "Expected card order to change after selecting Most Popular");

  await page.reload({ waitUntil: "networkidle", timeout: 45000 });
  await page.waitForFunction(() => document.body.innerText.includes("Showing 1–"), { timeout: 20000 });
  assert.ok(page.url().includes("sort=popularity_desc"), "Expected ?sort=popularity_desc to persist across reload");
  const afterReloadTitles = await getVisibleTitles();
  assert.deepEqual(afterReloadTitles, afterTitles, "Expected card order to persist after reload");

  await sortBtn.click();
  await page.locator("[role='option']:has-text('Best Fit (Comprehension Flow)')").click();
  await page.waitForTimeout(500);
  assert.ok(!page.url().includes("sort="), `Expected sort param removed for default sort, got ${page.url()}`);

  assert.equal(consoleErrors.length, 0, `Unexpected console errors: ${consoleErrors.join("; ")}`);
  console.log("E2E PASS: Most Popular sort reordered cards, persisted ?sort=popularity_desc across reload, and had 0 console errors.");
} finally {
  await browser.close();
}
