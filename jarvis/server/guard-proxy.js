import dns from "node:dns/promises";
import http from "node:http";
import net from "node:net";

/* ============================================================
   Relais du navigateur de Jarvis : tout son trafic passe ici.
   Pour chaque connexion, on résout le nom puis on refuse les
   adresses du Mac et du réseau local (127.x, 10.x, 192.168.x,
   169.254.x, ::1…). On se connecte à l'adresse vérifiée elle-même :
   ni une redirection, ni un nom qui pointe vers le Mac, ni un
   changement d'adresse en cours de route ne passent.
   ============================================================ */

function privateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const x = ip.toLowerCase();
  if (x.startsWith("::ffff:")) return privateIp(x.slice(7));
  return x === "::" || x === "::1" || x.startsWith("fc") || x.startsWith("fd") || x.startsWith("fe8") || x.startsWith("fe9") || x.startsWith("fea") || x.startsWith("feb") || x.startsWith("ff");
}

async function safeAddress(host) {
  const h = host.replace(/^\[|\]$/g, "");
  const ips = net.isIP(h) ? [h] : (await dns.lookup(h, { all: true })).map((r) => r.address);
  if (!ips.length || ips.some(privateIp)) throw new Error("adresse locale refusée");
  return ips[0];
}

export function startGuardProxy() {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      // HTTP simple (sans chiffrement)
      try {
        const u = new URL(req.url);
        if (u.protocol !== "http:") throw new Error("protocole refusé");
        const ip = await safeAddress(u.hostname);
        const up = http.request({ host: ip, port: u.port || 80, method: req.method, path: u.pathname + u.search, headers: { ...req.headers, host: u.host }, timeout: 20000 }, (r) => {
          res.writeHead(r.statusCode || 502, r.headers);
          r.pipe(res);
        });
        up.on("error", () => res.destroy());
        req.pipe(up);
      } catch {
        res.writeHead(403).end("Bloqué par Jarvis");
      }
    });
    // HTTPS : tunnel vers l'adresse vérifiée
    server.on("connect", async (req, sock, head) => {
      try {
        const [host, port = "443"] = String(req.url).split(/:(?=\d+$)/);
        if (!["443", "80"].includes(port)) throw new Error("port refusé");
        const ip = await safeAddress(host);
        const up = net.connect(Number(port), ip, () => {
          sock.write("HTTP/1.1 200 Connection Established\r\n\r\n");
          if (head?.length) up.write(head);
          up.pipe(sock);
          sock.pipe(up);
        });
        up.on("error", () => sock.destroy());
        sock.on("error", () => up.destroy());
      } catch {
        sock.end("HTTP/1.1 403 Forbidden\r\n\r\n");
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}
