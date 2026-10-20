// Test navigateur quotidien du site Keeply (lancé par GitHub Actions).
// Parcourt les pages, en ordinateur et en téléphone, et relève :
// pages en erreur, erreurs JavaScript, images ou fichiers manquants, pages trop lentes.
// Le rapport est envoyé au tableau de bord (onglet Santé).
import { chromium, devices } from "playwright";

const SITE = process.env.SITE_URL;
const PAGES = (process.env.PAGES || "/").split(",").map((p) => p.trim()).filter(Boolean);
const HQ = process.env.HQ_URL;
const TOKEN = process.env.INGEST_TOKEN;
const MAX_MS = Number(process.env.MAX_LOAD_MS || 6000);

if (!SITE) {
  console.log("SITE_URL non défini : rien à tester.");
  process.exit(0);
}

const failures = [];
const consoleErrors = new Set();
let passed = 0;

const browser = await chromium.launch();
for (const [label, ctxOpts] of [
  ["ordinateur", { viewport: { width: 1366, height: 900 } }],
  ["téléphone", devices["iPhone 14"]],
]) {
  const context = await browser.newContext(ctxOpts);
  for (const path of PAGES) {
    const url = new URL(path, SITE).href;
    const page = await context.newPage();
    const bad = [];
    page.on("console", (m) => m.type() === "error" && consoleErrors.add(`[${label}] ${path} : ${m.text().slice(0, 200)}`));
    page.on("pageerror", (e) => consoleErrors.add(`[${label}] ${path} : ${e.message.slice(0, 200)}`));
    page.on("response", (r) => {
      if (r.status() >= 400 && new URL(r.url()).origin === new URL(SITE).origin) bad.push(`${r.status()} ${r.url()}`);
    });
    const name = `${path} (${label})`;
    try {
      const t0 = Date.now();
      const res = await page.goto(url, { waitUntil: "load", timeout: 30000 });
      const ms = Date.now() - t0;
      if (!res || res.status() >= 400) throw new Error(`la page répond ${res?.status() ?? "rien"}`);
      if (ms > MAX_MS) throw new Error(`chargement lent : ${ms} ms`);
      const brokenImages = await page.$$eval("img", (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.src).map((i) => i.src));
      if (brokenImages.length) throw new Error(`${brokenImages.length} image(s) cassée(s) : ${brokenImages.slice(0, 3).join(", ")}`);
      if (bad.length) throw new Error(`fichiers en erreur : ${bad.slice(0, 3).join(", ")}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      if (overflow && label === "téléphone") throw new Error("la page déborde en largeur sur téléphone");
      passed++;
      console.log(`✓ ${name} (${ms} ms)`);
    } catch (e) {
      failures.push({ name, error: e.message });
      console.log(`✗ ${name} : ${e.message}`);
    }
    await page.close();
  }
  await context.close();
}
await browser.close();

const report = { passed, failed: failures.length, failures, consoleErrors: [...consoleErrors], url: SITE };
console.log(JSON.stringify(report, null, 2));

if (HQ && TOKEN) {
  const res = await fetch(new URL("/api/ingest/health", HQ), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(report),
  });
  console.log("Rapport envoyé au tableau de bord :", res.status);
}
process.exit(failures.length ? 1 : 0);
