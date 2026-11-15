// Jarvis en app Mac : une fenêtre dédiée sur le serveur Jarvis local
// (http://127.0.0.1:4777, lancé à l'ouverture de session par l'installateur).
const { app, BrowserWindow, shell, Menu, nativeTheme, session, systemPreferences } = require("electron");
const path = require("path");
const fs = require("fs");

const JARVIS = "http://127.0.0.1:4777";
const HOST = new URL(JARVIS).host;
const STATE = path.join(app.getPath("userData"), "window.json");
const isJarvis = (url) => { try { return new URL(url).host === HOST; } catch { return false; } };

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE, "utf8")); } catch { return { width: 1380, height: 880 }; }
}

// Micro autorisé pour Jarvis seulement ; tout le reste refusé.
const ALLOWED = new Set(["media", "notifications", "clipboard-read", "clipboard-sanitized-write", "fullscreen"]);
function lockPermissions() {
  const s = session.defaultSession;
  s.setPermissionRequestHandler((_wc, perm, cb, details) => {
    const audioOnly = perm !== "media" || (details.mediaTypes || []).every((t) => t === "audio");
    cb(isJarvis(details.requestingUrl) && ALLOWED.has(perm) && audioOnly);
  });
  s.setPermissionCheckHandler((_wc, perm, origin) => isJarvis(origin) && ALLOWED.has(perm));
}

let win;
function createWindow() {
  const s = readState();
  nativeTheme.themeSource = "dark";
  win = new BrowserWindow({
    width: s.width, height: s.height, x: s.x, y: s.y,
    minWidth: 900, minHeight: 600,
    title: "Jarvis",
    backgroundColor: "#05060A",
    show: false,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, sandbox: true, nodeIntegration: false },
  });
  if (s.maximized) win.maximize();
  win.once("ready-to-show", () => win.show());
  win.on("close", () => {
    if (!win || win.isDestroyed()) return;
    fs.writeFileSync(STATE, JSON.stringify({ ...win.getNormalBounds(), maximized: win.isMaximized() }));
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isJarvis(url)) return { action: "allow" };
    if (/^https?:|^mailto:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!isJarvis(url) && !url.startsWith("file:")) { e.preventDefault(); if (/^https?:|^mailto:/.test(url)) shell.openExternal(url); }
  });
  // Serveur Jarvis éteint : une page qui l'explique et réessaie toute seule.
  win.webContents.on("did-fail-load", (_e, code, _d, _u, isMain) => {
    if (isMain && code !== -3) win.loadFile(path.join(__dirname, "offline.html"));
  });
  win.loadURL(JARVIS);
}

function buildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { role: "appMenu" },
    { role: "editMenu" },
    {
      label: "Affichage",
      submenu: [
        { label: "Recharger", accelerator: "CmdOrCtrl+R", click: () => win && win.loadURL(JARVIS) },
        { type: "separator" },
        { role: "resetZoom", label: "Taille normale" },
        { role: "zoomIn", label: "Agrandir" },
        { role: "zoomOut", label: "Réduire" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Plein écran" },
      ],
    },
    { role: "windowMenu", label: "Fenêtre" },
  ]));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(async () => {
    if (process.platform === "darwin") await systemPreferences.askForMediaAccess("microphone").catch(() => false);
    lockPermissions();
    buildMenu();
    createWindow();
    app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
}
