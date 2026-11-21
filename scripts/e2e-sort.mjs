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

try {
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForSelector("button[aria-label='Sort catalogue items']", { timeout: 15000 });
  await page.waitForFunction(() => document.body.innerText.includes("Showing 1–20"), { timeout: 20000 });

  const sortBtn = page.locator("button[aria-label='Sort catalogue items']").first();
  const initialSortText = await sortBtn.innerText();
  assert.ok(initialSortText.includes("Most Popular"), `Expected default sort to be Most Popular, got ${initialSortText}`);

  const getVisibleTitles = () =>
    page.evaluate(() => {
      const grid = document.querySelector("div.grid.grid-cols-1.xl\\:grid-cols-2, div.grid.grid-cols-2.sm\\:grid-cols-3");
      if (!grid) return [];
      return Array.from(grid.children)
        .map((c) => {
          const lines = (c.innerText || "").split("\n").map((s) => s.trim()).filter(Boolean);
          return lines[1] || lines[0] || "";
        })
        .filter(Boolean);
    });

  const popularTitles = await getVisibleTitles();
  console.log("DEFAULT (popularity_desc) count:", popularTitles.length, "top 6:", popularTitles.slice(0, 6));
  assert.equal(popularTitles.length, 20, `Expected 20 cards per page (even rows in 2-col and 5-col grids), got ${popularTitles.length}`);

  await sortBtn.click();
  await page.locator("[role='option']:has-text('Best Fit (Comprehension Flow)')").click();
  await page.waitForTimeout(500);

  const urlAfterFlow = page.url();
  console.log("URL AFTER flow_desc:", urlAfterFlow);
  assert.ok(urlAfterFlow.includes("sort=flow_desc"), `Expected ?sort=flow_desc in URL, got ${urlAfterFlow}`);

  const flowTitles = await getVisibleTitles();
  console.log("AFTER (flow_desc) top 6:", flowTitles.slice(0, 6));
  assert.notDeepEqual(flowTitles, popularTitles, "Expected card order to change when switching to Comprehension Flow");

  await page.reload({ waitUntil: "networkidle", timeout: 45000 });
  await page.waitForFunction(() => document.body.innerText.includes("Showing 1–20"), { timeout: 20000 });
  assert.ok(page.url().includes("sort=flow_desc"), "Expected ?sort=flow_desc to persist across reload");

  await sortBtn.click();
  await page.locator("[role='option']:has-text('Most Popular')").click();
  await page.waitForTimeout(500);
  assert.ok(!page.url().includes("sort="), `Expected sort param removed for default Most Popular sort, got ${page.url()}`);

  assert.equal(consoleErrors.length, 0, `Unexpected console errors: ${consoleErrors.join("; ")}`);
  console.log("E2E PASS: Most Popular is default, 20 cards/page fills 5-col & 2-col grids evenly, sort persists across reload, 0 console errors.");
} finally {
  await browser.close();
}
