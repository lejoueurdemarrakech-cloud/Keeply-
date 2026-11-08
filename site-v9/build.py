#!/usr/bin/env python3
"""Assemble le site v9 dans dist/ : index.html + styles.css + app.js + images.

  python3 build.py            # construit dist/
Les vidéos de la page L'application et les textes légaux sont repris tels quels
depuis parts/ (extraits de l'ancien site)."""
import json, os, re, shutil, time

ROOT = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(ROOT, *a)
DIST = P("dist")

src = open(P("src", "index.src.html")).read()
app = open(P("parts", "application.html")).read()
vids = re.findall(r'<figure class="vframe".*?</figure>(?:\s*<p class="vcap">.*?</p>)?', app, re.S)
if len(vids) != 6:
    raise SystemExit("attendu 6 vidéos, trouvé %d" % len(vids))


def legal(name):
    s = open(P("parts", name + ".html")).read()
    a = s.index('<article class="legal">') + len('<article class="legal">')
    b = s.index("</article>", a)
    body = re.sub(r'<a class="back"[^>]*>.*?</a>', "", s[a:b], count=1, flags=re.S)
    return '<a class="back" href="#/"><svg class="ic"><use href="#i-left"/></svg>Accueil</a>' + body.replace("—", ",")


v = time.strftime("%Y%m%d%H%M")
out = (src.replace("{{V}}", v)
       .replace("{{CARDS}}", open(P("parts", "cards.json")).read())
       .replace("{{CONDITIONS}}", legal("conditions"))
       .replace("{{CONFIDENTIALITE}}", legal("confidentialite")))
for i, f in enumerate(vids, 1):
    out = out.replace("{{VID%d}}" % i, f)
left = re.findall(r"\{\{[A-Z0-9]+\}\}", out)
if left:
    raise SystemExit("restent : %s" % left)

if os.path.isdir(DIST):
    shutil.rmtree(DIST)
os.makedirs(DIST)
open(os.path.join(DIST, "index.html"), "w").write(out)
shutil.copy(P("src", "styles.css"), DIST)
shutil.copy(P("src", "app.js"), DIST)
for d in ("cartes", "img", "media", "vendor"):
    shutil.copytree(P(d), os.path.join(DIST, d))
print("dist/ prêt,", len(out) // 1024, "Ko de HTML")
