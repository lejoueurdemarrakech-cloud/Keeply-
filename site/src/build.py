#!/usr/bin/env python3
"""Build the Keeply v6 page from the published artifact (stripped of base64) + v6 parts."""
import json, os, re, shutil, sys

SP = os.path.dirname(os.path.abspath(__file__))
W = os.path.join(SP, "w")
OUT = sys.argv[1] if len(sys.argv) > 1 else "/home/user/Keeply-/site"

s = open(os.path.join(W, "stripped.html")).read()
store = json.load(open(os.path.join(W, "store.json")))


def sub_once(old, new, text, label):
    n = text.count(old)
    if n != 1:
        raise SystemExit(f"[{label}] expected 1 match, got {n}")
    return text.replace(old, new)


# 0. Drop the artifact host skeleton: the publish step wraps the page again.
head = '<!doctype html><html><head><meta charset=utf8>'
if s.startswith(head):
    s = s[s.index("<body>") + len("<body>"):]
    s = s[: s.rindex("</body></html>")]

# 1. Home view: replace every section between the opening of #view-home and its close.
start = s.index('<div class="view" id="view-home" lang="fr">')
start = s.index("\n", start) + 1
end = s.index("</div><!-- /#view-home -->")
s = s[:start] + open(os.path.join(SP, "v6_home.html")).read() + s[end:]

# 2. Videos page and every link to it.
vs = s.index('<div class="view" id="view-videos" lang="fr">')
ve = s.index("<!-- ==================================================================\n     ACTIVATION")
s = s[:vs] + s[ve:]
s = sub_once('      <a href="#/videos" data-r="videos">Vidéos</a>\n', "", s, "nav link")
s = sub_once('        <a href="#/videos">Vidéos</a>\n', "", s, "menu link")
s = sub_once('          <li><a href="#/videos">Vidéos</a></li>\n', "", s, "footer link")
s = sub_once('"fidelisation","videos","activation"', '"fidelisation","activation"', s, "routes")
s = sub_once('videos:"Vidéos — Keeply",', "", s, "titles")
s = sub_once('body[data-route="videos"] #view-videos,\n', "", s, "route css")

# 3. Footer wordmark.
s = sub_once('    </div>\n  </div>\n</footer>', '    </div>\n    <p class="v6-word" aria-hidden="true">Keeply</p>\n  </div>\n</footer>', s, "wordmark")

# 4. v6 styles after the main stylesheet, v6 script after the page scripts.
css = open(os.path.join(SP, "v6.css")).read() + open(os.path.join(SP, "m.css")).read()
s = sub_once("\n}\n</style>\n\n<a class=\"skip\"", "\n}\n" + css + "</style>\n\n<a class=\"skip\"", s, "css")
js = open(os.path.join(SP, "v6.js")).read()
s = s.rstrip() + '\n<script id="keeply-v6">\n' + js + "</script>\n<script id=\"keeply-mobile\">\n" + open(os.path.join(SP, "m.js")).read() + "</script>\n"

# 5. Social card / theme metas stay; restore the base64 blobs.
for k, v in store.items():
    s = s.replace(k, v)
left = re.findall(r"@@B64_\d+@@", s)
if left:
    raise SystemExit(f"unrestored placeholders: {left[:5]}")

os.makedirs(os.path.join(OUT, "media"), exist_ok=True)
open(os.path.join(OUT, "index.html"), "w").write(s)
for f in ("hero.mp4", "hero.jpg", "tap.mp4", "tap.jpg", "drift.mp4", "drift.jpg"):
    shutil.copy(os.path.join("/home/user/Keeply-/videos/keeply-loops/web", f), os.path.join(OUT, "media", f))
print("built", os.path.join(OUT, "index.html"), len(s))

# Standalone copy for the repository / local preview: same skeleton the artifact host adds.
frag = s
full = ('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>body{margin:0;padding:0;background:#FBF7F1}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
        + frag + '\n</body></html>\n')
open(os.path.join(OUT, "index.html"), "w").write(full)
open(os.path.join(SP, "publish", "index.html") if os.path.isdir(os.path.join(SP, "publish")) else os.path.join(SP, "fragment.html"), "w").write(frag)
