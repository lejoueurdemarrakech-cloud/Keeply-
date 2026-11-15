// Indique au HQ qu'il tourne dans l'app desktop (pour d'éventuels réglages de mise en page).
const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("keeplyDesktop", { platform: process.platform, version: "1.0.0" });
window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("is-desktop", `is-${process.platform}`);
  // Mode verre : fenêtre floutée par le système (macOS, Windows 11).
  if (process.platform === "darwin" || process.platform === "win32") document.documentElement.classList.add("is-glass");
});
