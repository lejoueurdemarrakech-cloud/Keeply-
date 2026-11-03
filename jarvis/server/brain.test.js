import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

process.env.JARVIS_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "jarvis-test-"));
const { parseReply, sayStreamer, instant, isAgentTask } = await import("./brain.js");
const { applyUi, getLayout } = await import("./layout.js");

test("parseReply lit les balises et répare un JSON entouré de texte", () => {
  const r = parseReply('<say>Voici les matchs.</say>\n<view>```json\n{"title":"LDC","blocks":[{"type":"matches","items":[]}]}\n```</view><ui>{"theme":"mark"}</ui>');
  assert.equal(r.say, "Voici les matchs.");
  assert.equal(r.view.title, "LDC");
  assert.deepEqual(r.ui, { theme: "mark" });
  assert.deepEqual(r.actions, []);
});

test("parseReply sans balise garde le texte", () => {
  assert.equal(parseReply("Bonjour.").say, "Bonjour.");
});

test("sayStreamer émet les phrases dès qu'elles sont complètes", () => {
  const out = [];
  const s = sayStreamer((x) => out.push(x));
  for (const c of ["<sa", "y>Première phrase. Deu", "xième phrase ! Troi", "sième</say><view>{}"]) s.push(c);
  assert.deepEqual(out, ["Première phrase.", "Deuxième phrase !", "Troisième"]);
});

test("commandes d'interface instantanées", async () => {
  assert.deepEqual((await instant("mets le thème rouge")).ui, { theme: "mark" });
  assert.deepEqual((await instant("passe en mode perso")).ui, { preset: "perso" });
  assert.equal((await instant("enlève les actus")).ui.remove, "news");
  assert.ok(isAgentTask("en mode terminal liste mes fichiers"));
  assert.ok(!isAgentTask("les matchs de ce soir"));
  assert.equal(await instant("pourquoi mes ventes baissent"), null);
  assert.ok((await instant("stop")).stop);
});

test("applyUi ajoute un widget de contenu et change le thème", () => {
  const l = applyUi({ theme: "nebula", add: { title: "Ligue des champions", prompt: "matchs du jour", side: "left", view: { title: "x", blocks: [] } } });
  assert.equal(l.theme, "nebula");
  assert.ok(l.widgets.some((w) => w.kind === "custom" && w.title === "Ligue des champions"));
  assert.equal(applyUi({ theme: "inconnu" }), null);
  assert.equal(getLayout().theme, "nebula");
});
