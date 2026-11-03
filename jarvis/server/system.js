import { execFile } from "node:child_process";
import os from "node:os";

/* État du Mac pour le HUD : processeur, mémoire, batterie. Très léger. */

let prev = os.cpus().map((c) => c.times);
let battery = { at: 0, v: null };

function cpuUsage() {
  const now = os.cpus().map((c) => c.times);
  let idle = 0;
  let total = 0;
  now.forEach((t, i) => {
    const p = prev[i] || t;
    const d = (k) => t[k] - p[k];
    const tot = d("user") + d("nice") + d("sys") + d("idle") + d("irq");
    idle += d("idle");
    total += tot;
  });
  prev = now;
  return total > 0 ? Math.round((1 - idle / total) * 100) : 0;
}

function readBattery() {
  if (process.platform !== "darwin") return Promise.resolve(null);
  return new Promise((resolve) => {
    execFile("pmset", ["-g", "batt"], { timeout: 2000 }, (err, out) => {
      if (err) return resolve(null);
      const pct = out.match(/(\d+)%/);
      if (!pct) return resolve(null);
      resolve({ level: Number(pct[1]), charging: /AC Power/.test(out) || /charging|charged/.test(out) });
    });
  });
}

export async function systemStats() {
  if (Date.now() - battery.at > 60_000) battery = { at: Date.now(), v: await readBattery() };
  const total = os.totalmem();
  return {
    host: os.hostname().replace(/\.local$/, ""),
    cpu: cpuUsage(),
    cores: os.cpus().length,
    memUsed: Math.round(((total - os.freemem()) / total) * 100),
    memTotalGb: Math.round(total / 1024 ** 3),
    uptimeH: Math.round(os.uptime() / 3600),
    battery: battery.v,
    jarvisMb: Math.round(process.memoryUsage().rss / 1024 ** 2),
  };
}
