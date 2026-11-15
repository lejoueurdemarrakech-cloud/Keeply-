// Keeply HQ en app desktop : une fenêtre dédiée qui ouvre le HQ en ligne.
// Le HQ vit sur Vercel (serveur, connexion, IA, mails) : toute retouche faite
// là-bas apparaît ici sans réinstaller l'app.
const { app, BrowserWindow, shell, Menu, nativeTheme, session } = require("electron");
const path = require("path");
const fs = require("fs");

const HQ = "https://keeply-hq.vercel.app";
const HQ_HOST = new URL(HQ).host;
const STATE = path.join(app.getPath("userData"), "window.json");

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE, "utf8")); } catch { return { width: 1440, height: 920 }; }
}

// Droits du navigateur : seulement pour le HQ, et seulement ceux qu'il utilise
// (micro pour Jarvis, notifications, presse-papiers). Tout le reste est refusé.
const ALLOWED_PERMS = new Set(["media", "notifications", "clipboard-read", "clipboard-sanitized-write", "fullscreen"]);
function isHQUrl(url) { try { return new URL(url).host === HQ_HOST; } catch { return false; } }
function lockPermissions() {
  const s = session.defaultSession;
  s.setPermissionRequestHandler((_wc, perm, cb, details) => {
    const okMedia = perm !== "media" || (details.mediaTypes || []).every((t) => t === "audio");
    cb(isHQUrl(details.requestingUrl) && ALLOWED_PERMS.has(perm) && okMedia);
  });
  s.setPermissionCheckHandler((_wc, perm, origin) => isHQUrl(origin) && ALLOWED_PERMS.has(perm));
}

let win;
function createWindow() {
  const s = readState();
  nativeTheme.themeSource = "dark";
  win = new BrowserWindow({
    width: s.width, height: s.height, x: s.x, y: s.y,
    minWidth: 980, minHeight: 640,
    title: "Keeply HQ",
    // Mode verre : on voit (flouté) ce qu'il y a derrière la fenêtre.
    backgroundColor: "#00000000",
    ...(process.platform === "darwin" ? { vibrancy: "under-window", visualEffectState: "active" } : {}),
    ...(process.platform === "win32" ? { backgroundMaterial: "acrylic" } : {}),
    autoHideMenuBar: process.platform !== "darwin",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: true,
    },
  });
  if (s.maximized) win.maximize();
  win.once("ready-to-show", () => win.show());

  const save = () => {
    if (!win || win.isDestroyed()) return;
    const b = win.getNormalBounds();
    fs.writeFileSync(STATE, JSON.stringify({ ...b, maximized: win.isMaximized() }));
  };
  win.on("close", save);

  // Les liens qui sortent du HQ s'ouvrent dans le navigateur habituel.
  const isHQ = (url) => { try { return new URL(url).host === HQ_HOST; } catch { return false; } };
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isHQ(url)) return { action: "allow" };
    if (/^https?:|^mailto:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!isHQ(url)) { e.preventDefault(); if (/^https?:|^mailto:/.test(url)) shell.openExternal(url); }
  });

  // Pas de réseau : une page claire plutôt qu'une fenêtre blanche.
  win.webContents.on("did-fail-load", (_e, code, _desc, url, isMain) => {
    if (isMain && code !== -3) win.loadFile(path.join(__dirname, "offline.html"), { query: { retry: url || HQ } });
  });

  win.loadURL(HQ);
}

function buildMenu() {
  const mac = process.platform === "darwin";
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(mac ? [{ role: "appMenu" }] : []),
    { role: "editMenu" },
    {
      label: "Affichage",
      submenu: [
        { label: "Recharger", accelerator: "CmdOrCtrl+R", click: () => win && win.reload() },
        { label: "Accueil du HQ", accelerator: "CmdOrCtrl+Shift+H", click: () => win && win.loadURL(HQ) },
        { type: "separator" },
        { role: "resetZoom", label: "Taille normale" },
        { role: "zoomIn", label: "Agrandir" },
        { role: "zoomOut", label: "Réduire" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Plein écran" },
      ],
    },
    {
      label: "Navigation",
      submenu: [
        { label: "Précédent", accelerator: "CmdOrCtrl+[", click: () => win && win.webContents.navigationHistory.goBack() },
        { label: "Suivant", accelerator: "CmdOrCtrl+]", click: () => win && win.webContents.navigationHistory.goForward() },
      ],
    },
    { role: "windowMenu", label: "Fenêtre" },
  ]));
}

// Une seule fenêtre HQ à la fois : relancer l'app ramène la fenêtre existante.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    lockPermissions();
    buildMenu();
    createWindow();
    app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
}
