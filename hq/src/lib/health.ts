import "server-only";
import tls from "node:tls";
import { configOrNull } from "@/lib/connectors/config";
import { aiAvailable } from "@/lib/ai";
import { healthSummaryTool } from "@/lib/ai-tools";
import { fetchJson, UA } from "@/lib/http";
import { sendMail } from "@/lib/mail";
import { getReviews } from "@/lib/reviews";
import { getSettings, logActivity } from "@/lib/settings";
import { read, uid, update } from "@/lib/store";
import { addTaskOnce } from "@/lib/tasks";
import type { HealthCheck, HealthResult, HealthRun } from "@/lib/types";

/** Contrôles proposés automatiquement à partir des réglages. */
export async function effectiveChecks(): Promise<HealthCheck[]> {
  const s = await getSettings();
  const custom = s.health.checks;
  const auto: HealthCheck[] = [];
  const as = await configOrNull("appstore");
  if (s.siteUrl) {
    auto.push(
      { id: "auto-site", name: "Site en ligne", kind: "texte", url: s.siteUrl, expectText: s.businessName, maxMs: 3000, enabled: true },
      { id: "auto-ssl", name: "Certificat HTTPS", kind: "ssl", url: s.siteUrl, enabled: true },
      { id: "auto-links", name: "Liens cassés du site", kind: "liens", url: s.siteUrl, enabled: true },
    );
  }
  const appId = as?.appId || s.appStoreUrl.match(/id(\d{6,})/)?.[1];
  if (appId) auto.push({ id: "auto-appstore", name: "Fiche App Store", kind: "appstore", url: appId, enabled: true });
  if (s.playStoreUrl) auto.push({ id: "auto-play", name: "Fiche Google Play", kind: "playstore", url: s.playStoreUrl, enabled: true });
  const ids = new Set(custom.map((c) => c.id));
  return [...auto.filter((a) => !ids.has(a.id)), ...custom];
}

async function timed(url: string, init: RequestInit = {}) {
  const t0 = performance.now();
  const res = await fetch(url, { redirect: "follow", cache: "no-store", headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000), ...init });
  const body = await res.text();
  return { res, body, ms: Math.round(performance.now() - t0) };
}

function certDaysLeft(url: string) {
  return new Promise<{ days: number; issuer: string }>((resolve, reject) => {
    const host = new URL(url).hostname;
    const socket = tls.connect({ host, port: 443, servername: host, timeout: 10000 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      if (!cert?.valid_to) return reject(new Error("Certificat illisible"));
      resolve({ days: Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 864e5), issuer: String(cert.issuer?.O ?? "") });
    });
    socket.on("error", reject);
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("Délai dépassé"));
    });
  });
}

async function crawlLinks(url: string) {
  const { body } = await timed(url);
  const origin = new URL(url).origin;
  const links = new Set<string>();
  for (const m of body.matchAll(/(?:href|src)=["']([^"'#]+)["']/gi)) {
    try {
      const u = new URL(m[1], url);
      if (!/^https?:$/.test(u.protocol)) continue;
      if (u.origin !== origin && !/apps\.apple\.com|play\.google\.com/.test(u.host)) continue;
      links.add(u.href);
    } catch {}
  }
  const list = [...links].slice(0, 50);
  const broken: string[] = [];
  for (let i = 0; i < list.length; i += 8) {
    await Promise.all(
      list.slice(i, i + 8).map(async (l) => {
        try {
          let r = await fetch(l, { method: "HEAD", redirect: "follow", headers: { "User-Agent": UA }, signal: AbortSignal.timeout(12000) });
          if (r.status === 405 || r.status === 403) r = await fetch(l, { redirect: "follow", headers: { "User-Agent": UA }, signal: AbortSignal.timeout(12000) });
          if (r.status >= 400) broken.push(`${r.status} · ${l}`);
        } catch {
          broken.push(`injoignable · ${l}`);
        }
      }),
    );
  }
  return { checked: list.length, broken };
}

export async function runCheck(c: HealthCheck): Promise<HealthResult> {
  const base = { checkId: c.id, name: c.name, kind: c.kind };
  try {
    switch (c.kind) {
      case "http":
      case "texte":
      case "json": {
        const { res, body, ms } = await timed(c.url);
        const expected = c.expectStatus ?? 200;
        const problems: string[] = [];
        if (res.status !== expected) problems.push(`statut ${res.status} (attendu ${expected})`);
        if (c.kind === "texte" && c.expectText && !body.toLowerCase().includes(c.expectText.toLowerCase())) problems.push(`texte « ${c.expectText} » absent`);
        if (c.kind === "json") {
          try {
            const data = JSON.parse(body);
            if (c.expectText && !JSON.stringify(data).includes(c.expectText)) problems.push(`valeur « ${c.expectText} » absente du JSON`);
          } catch {
            problems.push("la réponse n'est pas du JSON");
          }
        }
        const slow = c.maxMs && ms > c.maxMs;
        if (problems.length) return { ...base, ok: false, severity: "panne", ms, detail: problems.join(", ") };
        return { ...base, ok: !slow, severity: slow ? "attention" : "ok", ms, detail: slow ? `Lent : ${ms} ms (max ${c.maxMs} ms)` : `Répond en ${ms} ms` };
      }
      case "ssl": {
        const { days, issuer } = await certDaysLeft(c.url);
        return { ...base, ok: days > 21, severity: days < 7 ? "panne" : days <= 21 ? "attention" : "ok", detail: `Expire dans ${days} jours${issuer ? ` (${issuer})` : ""}` };
      }
      case "liens": {
        const { checked, broken } = await crawlLinks(c.url);
        return { ...base, ok: broken.length === 0, severity: broken.length ? "attention" : "ok", detail: broken.length ? `${broken.length} lien(s) cassé(s) sur ${checked}` : `${checked} liens vérifiés, aucun cassé`, items: broken };
      }
      case "appstore": {
        const data = await fetchJson<{ resultCount: number; results: { version: string; averageUserRating?: number; userRatingCount?: number; currentVersionReleaseDate?: string; trackName: string }[] }>(
          `https://itunes.apple.com/lookup?id=${encodeURIComponent(c.url)}&country=fr`,
        );
        if (!data.resultCount) return { ...base, ok: false, severity: "panne", detail: "L'app n'apparaît plus sur l'App Store français." };
        const a = data.results[0];
        const low = (a.averageUserRating ?? 5) < 4;
        return {
          ...base,
          ok: !low,
          severity: low ? "attention" : "ok",
          detail: `${a.trackName} v${a.version} en ligne · note ${a.averageUserRating?.toFixed(2) ?? "—"} (${a.userRatingCount ?? 0} notes)`,
        };
      }
      case "playstore": {
        const { res, ms } = await timed(c.url);
        return { ...base, ok: res.status === 200, severity: res.status === 200 ? "ok" : "panne", ms, detail: res.status === 200 ? "Fiche accessible" : `La fiche répond ${res.status}` };
      }
    }
  } catch (e) {
    return { ...base, ok: false, severity: "panne", detail: e instanceof Error ? e.message : String(e) };
  }
}

async function sentryResult(): Promise<HealthResult | null> {
  const cfg = await configOrNull("sentry");
  if (!cfg) return null;
  const base = { checkId: "sentry", name: "Erreurs de l'app (Sentry)", kind: "sentry" as const };
  try {
    const issues = await fetchJson<{ title: string; count: string; userCount: number; firstSeen: string; permalink: string; level: string }[]>(
      `https://${cfg.host || "sentry.io"}/api/0/projects/${cfg.org}/${cfg.project}/issues/?query=is:unresolved&statsPeriod=24h&sort=freq&limit=10`,
      { headers: { Authorization: `Bearer ${cfg.authToken}` } },
    );
    const fresh = issues.filter((i) => Date.now() - new Date(i.firstSeen).getTime() < 864e5);
    const severity = fresh.length ? "panne" : issues.length ? "attention" : "ok";
    return {
      ...base,
      ok: !fresh.length,
      severity,
      detail: fresh.length ? `${fresh.length} nouvelle(s) erreur(s) en 24 h` : issues.length ? `${issues.length} erreur(s) non résolue(s), aucune nouvelle` : "Aucune erreur non résolue",
      items: issues.slice(0, 6).map((i) => `${i.count}× ${i.title} (${i.userCount} utilisateurs)`),
    };
  } catch (e) {
    return { ...base, ok: false, severity: "attention", detail: `Sentry injoignable : ${e instanceof Error ? e.message : e}` };
  }
}

async function reviewsResult(): Promise<HealthResult | null> {
  const { reviews, live } = await getReviews();
  // Les avis d'exemple ne doivent pas fausser le score.
  if (!live) return null;
  const recent = reviews.filter((r) => r.bug && Date.now() - new Date(r.date).getTime() < 7 * 864e5);
  return {
    checkId: "avis-bugs",
    name: "Bugs signalés dans les avis (7 j)",
    kind: "avis",
    ok: recent.length === 0,
    severity: recent.length >= 3 ? "panne" : recent.length ? "attention" : "ok",
    detail: recent.length ? `${recent.length} avis parlent d'un bug` : "Aucun avis récent ne signale de bug",
    items: recent.map((r) => `${r.store === "appstore" ? "iOS" : "Android"} ${r.rating}★ : ${r.body.slice(0, 120)}`),
  };
}

export interface E2eReport {
  at: string;
  passed: number;
  failed: number;
  failures: { name: string; error: string }[];
  consoleErrors: string[];
  url?: string;
}

function e2eResult(r: E2eReport | null): HealthResult | null {
  if (!r || Date.now() - new Date(r.at).getTime() > 36 * 36e5) return null;
  return {
    checkId: "e2e",
    name: "Tests navigateur (parcours du site)",
    kind: "e2e",
    ok: r.failed === 0 && r.consoleErrors.length === 0,
    severity: r.failed ? "panne" : r.consoleErrors.length ? "attention" : "ok",
    detail: r.failed ? `${r.failed} test(s) en échec sur ${r.passed + r.failed}` : `${r.passed} tests réussis${r.consoleErrors.length ? `, ${r.consoleErrors.length} erreur(s) JavaScript` : ""}`,
    items: [...r.failures.map((f) => `${f.name} : ${f.error}`), ...r.consoleErrors.slice(0, 5)],
  };
}

export async function runHealth(trigger: HealthRun["trigger"]): Promise<HealthRun> {
  const checks = (await effectiveChecks()).filter((c) => c.enabled);
  const results = await Promise.all(checks.map(runCheck));
  const extra = await Promise.all([sentryResult(), reviewsResult(), read<E2eReport | null>("health:e2e", null).then(e2eResult)]);
  results.push(...(extra.filter(Boolean) as HealthResult[]));

  const weights = { ok: 1, attention: 0.5, panne: 0 };
  const score = results.length ? Math.round((results.reduce((s, r) => s + weights[r.severity], 0) / results.length) * 100) : 100;
  const run: HealthRun = { id: uid("h"), at: new Date().toISOString(), trigger, results, score };

  const failing = results.filter((r) => r.severity !== "ok");
  if (failing.length && (await aiAvailable())) {
    run.summary = await healthSummaryTool(failing.map((r) => `- [${r.severity}] ${r.name} : ${r.detail}${r.items?.length ? `\n  ${r.items.slice(0, 5).join("\n  ")}` : ""}`).join("\n")).catch(() => undefined);
  }
  await update<HealthRun[]>("health:runs", [], (runs) => [run, ...runs].slice(0, 90));

  const s = await getSettings();
  const pannes = results.filter((r) => r.severity === "panne");
  if (s.health.createTasks) {
    for (const p of pannes) await addTaskOnce(`sante:${p.checkId}`, { title: `Réparer : ${p.name} (${p.detail})`, priority: "haute", tag: "Santé" });
  }
  if (pannes.length && s.health.alertEmail && trigger !== "manuel") {
    const cfg = await configOrNull("mail");
    const to = s.ownerEmail || cfg?.user;
    if (cfg && to) {
      await sendMail(cfg, {
        to,
        subject: `⚠️ Keeply : ${pannes.length} problème(s) détecté(s)`,
        text: `Le test automatique de ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} a trouvé :\n\n${pannes.map((p) => `• ${p.name} : ${p.detail}`).join("\n")}\n\n${run.summary ?? ""}\n\nScore de santé : ${score}/100`,
      }).catch(() => undefined);
    }
  }
  await logActivity("sante", `Test ${trigger} : score ${score}/100, ${failing.length} point(s) à surveiller`, pannes.length ? "erreur" : "succes");
  return run;
}

/** Lancé par la tâche planifiée : un passage par jour, à l'heure choisie (heure de Paris). */
export async function dailyHealthTick() {
  const s = await getSettings();
  const tz = process.env.HQ_TIMEZONE || "Europe/Paris";
  const day = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: tz });
  const hour = Number(new Date().toLocaleString("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" }));
  if (hour < s.health.dailyHour) return "pas encore l'heure";
  const today = day(new Date());
  const runs = await read<HealthRun[]>("health:runs", []);
  if (runs.some((r) => r.trigger === "quotidien" && day(new Date(r.at)) === today)) return "déjà fait aujourd'hui";
  const hasSources = (await effectiveChecks()).some((c) => c.enabled) || !!(await configOrNull("sentry")) || (await getReviews()).live;
  if (!hasSources) return "aucun contrôle configuré";
  const run = await runHealth("quotidien");
  return `score ${run.score}`;
}
