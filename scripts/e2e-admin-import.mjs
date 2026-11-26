import assert from "node:assert/strict";
import { execSync, spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

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

const previewPort = 4174;
const baseUrl = process.env.E2E_BASE_URL || `http://127.0.0.1:${previewPort}`;
const apiBase = process.env.VITE_ADMIN_API_URL || "https://api.152.67.157.124.sslip.io";
const realSrt = "/run/media/drjopari/disk2.2/blackhole/La Fiera (2026) [Bluray 720p][Esp]/La Fiera (2026) [Bluray 720p][Esp].es.srt";
const fallbackSrt = "/tmp/La Fiera (2026) [Bluray 720p][Esp].es.srt";
if (!existsSync(realSrt)) {
  writeFileSync(
    fallbackSrt,
    "1\n00:00:01,000 --> 00:00:03,000\nHola, esto es una prueba de subtítulos.\n",
    "utf8"
  );
}
const srtPath = existsSync(realSrt) ? realSrt : fallbackSrt;

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
const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
const page = await context.newPage();

const errors = [];
let stagedJobId = null;
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

try {
  // Mock Supabase auth session so /admin/imports renders the workbench without real credentials
  const fakeUser = { id: "e2e-admin-user", email: "admin@example.com", role: "authenticated", aud: "authenticated" };
  const fakeSession = {
    access_token: "e2e-fake-jwt",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "e2e-refresh",
    user: fakeUser,
  };
  await page.addInitScript((session) => {
    for (const key of ["sb-127-auth-token", "sb-ohcuphfsetajpbwjbfxg-auth-token", "sb-152-auth-token"]) {
      localStorage.setItem(key, JSON.stringify(session));
    }
  }, fakeSession);

  await page.route("**/auth/v1/user", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fakeUser) });
  });
  await page.route("**/rest/v1/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  // Capture the real POST /admin/imports response so we can clean up the staged job afterwards
  const uploadResponsePromise = page.waitForResponse(
    (res) => res.url().includes("/admin/imports") && res.request().method() === "POST",
    { timeout: 30000 }
  );

  await page.goto(`${baseUrl}/admin/imports`, { waitUntil: "networkidle" });
  await page.getByText("Import Workbench").waitFor({ state: "visible", timeout: 10000 });

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(srtPath);

  const uploadRes = await uploadResponsePromise;
  assert.equal(uploadRes.status(), 200, `Expected 200 from POST /admin/imports, got ${uploadRes.status()}`);
  const job = await uploadRes.json();
  stagedJobId = job.id;
  assert.ok(stagedJobId, "Staged job id missing");
  assert.equal(job.status, "ready", `Expected job status ready, got ${job.status}`);

  // Verify the UI renders the parsed movie metadata without any error banner
  await page.getByText("La Fiera").first().waitFor({ state: "visible", timeout: 10000 });
  const errorBanner = page.locator("text=/failed to fetch/i");
  assert.equal(await errorBanner.count(), 0, "Unexpected Failed to fetch error banner");

  assert.equal(errors.length, 0, `Unexpected browser errors: ${errors.join(" | ")}`);
  console.log(`E2E ADMIN IMPORT PASS: staged ${path.basename(srtPath)} -> job ${stagedJobId} (status=${job.status}, title=${job.metadata?.title}, words=${job.metadata?.word_count})`);
} finally {
  if (stagedJobId) {
    await fetch(`${apiBase}/admin/imports/${stagedJobId}`, { method: "DELETE" }).catch(() => undefined);
  }
  await browser.close();
  if (serverProc && serverProc.pid) {
    try { process.kill(-serverProc.pid); } catch {}
  }
}
