#!/usr/bin/env python3
"""Generate the three Keeply Hyperframes compositions (seamless web loops)."""
import os, random
OUT = "/home/user/Keeply-/videos/keeply-loops/src"
os.makedirs(OUT, exist_ok=True)

FONTS = """
@font-face{font-family:"Bricolage Grotesque";src:url("assets/bricolage-grotesque-latin-700-normal.woff2") format("woff2");font-weight:700}
@font-face{font-family:"Bricolage Grotesque";src:url("assets/bricolage-grotesque-latin-800-normal.woff2") format("woff2");font-weight:800}
@font-face{font-family:"Hanken Grotesk";src:url("assets/hanken-grotesk-latin-500-normal.woff2") format("woff2");font-weight:500}
@font-face{font-family:"Hanken Grotesk";src:url("assets/hanken-grotesk-latin-600-normal.woff2") format("woff2");font-weight:600}
"""

CARD_CSS = """
.wp{--wp-bg:#6B4AF2;width:380px;border-radius:18px;background:var(--wp-bg);color:#fff;font-family:"Hanken Grotesk",sans-serif;line-height:1.15;overflow:hidden;position:relative;flex:none;
  box-shadow:0 2px 8px rgba(10,5,30,.25),0 40px 70px -30px rgba(10,5,30,.7)}
.wp__head{display:flex;align-items:center;gap:12px;padding:16px 18px 15px}
.wp__logo{width:36px;height:36px;border-radius:9px;background:#fff;overflow:hidden;flex:none}
.wp__logo img{width:100%;height:100%;object-fit:cover;display:block}
.wp__name{font-weight:600;font-size:19px;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}
.wp__hf{text-align:right;flex:none}
.wp__hf small,.wp__f small{display:block;font-size:9.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.86)}
.wp__hf b{display:block;font-size:21px;font-weight:500;margin-top:1px}
.wp__strip{position:relative;aspect-ratio:1125/432;background-size:cover;background-position:center;display:grid;place-items:center}
.wp__strip::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.10),rgba(0,0,0,.38))}
.wp__stamps{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:9px 11px;padding:0 22px;width:100%}
.wp__st{aspect-ratio:1;border-radius:50%;border:2px solid rgba(255,255,255,.78);background:rgba(255,255,255,.1)}
.wp__st.on{background:#fff;border-color:#fff}
.wp__pts{position:absolute;top:9%;left:4.5%;right:4.5%}
.wp__pts b{display:block;font-size:44px;font-weight:500;letter-spacing:-.02em;line-height:1}
.wp__pts small{display:block;margin-top:4px;font-size:11px;font-weight:600}
.wp__bar{position:absolute;left:4.3%;right:4.3%;bottom:9.7%;height:5px;border-radius:9px;background:rgba(255,255,255,.3);overflow:hidden}
.wp__bar i{display:block;height:100%;width:100%;background:#fff;border-radius:9px;transform-origin:left center}
.wp__fields{display:grid;grid-template-columns:1fr 1fr auto;gap:12px;padding:14px 18px 18px}
.wp__f b{display:block;font-size:15px;font-weight:500;margin-top:3px;white-space:nowrap}
.wp__f:last-child{text-align:right}
"""

SHOPS = [
    ("fourchette", "Fourchette Dorée", "#7A2E1F"), ("kitchen", "Kitchen Chef", "#1E1A26"), ("tajine", "Magic Tajine", "#5C3A21"),
    ("smash", "Smash Burger", "#14111F"), ("sushi", "Sushi Party", "#B3261E"), ("tacos", "Tacos Fresh", "#2F6B3A"),
    ("tapas", "Tapas World", "#8A2C2C"), ("crazy", "Crazy Pizza", "#C2412F"), ("thai", "Thaï Food", "#C46A1B"),
    ("bigburgers", "Big Burgers", "#3A1C14"), ("karine", "Chez Karine", "#3E5A3A"), ("corner", "Corner Café", "#3F5B45"),
    ("linguini", "Pizzeria Linguini", "#A8341F"), ("luxury", "Luxury Restaurant", "#2A2340"),
]
NAMES = ["SALMA", "HUGO", "INÈS", "YANIS", "LÉA", "KARIM", "NORA", "THÉO", "AMINE", "CHLOÉ", "MEHDI", "EMMA", "ADAM", "SARAH"]
TIERS = ["MEMBRE", "BRONZE", "ARGENT", "OR"]


def card(i, uid):
    key, name, bg = SHOPS[i % len(SHOPS)]
    if i % 2:
        n = 3 + (i * 3) % 7
        mid = '<div class="wp__stamps">' + "".join(f'<span class="wp__st{" on" if k < n else ""}"></span>' for k in range(10)) + "</div>"
    else:
        pts = 150 * (i % 5) + [34, 58, 91, 76, 112, 47, 123][i % 7]
        left = 150 - pts % 150
        frac = (pts % 150) / 150
        mid = (f'<div class="wp__pts"><b>{pts}</b><small>points · encore {left} pour une surprise</small></div>'
               f'<span class="wp__bar"><i style="transform:scaleX({frac:.3f})"></i></span>')
    return (f'<div class="wp" id="{uid}" style="--wp-bg:{bg}">'
            f'<div class="wp__head"><span class="wp__logo"><img src="assets/{key}_logo.jpg" alt="" /></span>'
            f'<span class="wp__name">{name}</span><span class="wp__hf"><small>Récompenses</small><b>{1 + i % 3}</b></span></div>'
            f'<div class="wp__strip" style="background-image:url(assets/{key}_strip.jpg)">{mid}</div>'
            f'<div class="wp__fields"><div class="wp__f"><small>Membre</small><b>{NAMES[i % 14]}</b></div>'
            f'<div class="wp__f"><small>Statut</small><b>{TIERS[i % 4]}</b></div>'
            f'<div class="wp__f"><small>Depuis</small><b>{2023 + i % 3}</b></div></div></div>')


def page(cid, w, h, dur, css, body, js):
    return f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={w}, height={h}" />
    <script src="assets/gsap.min.js"></script>
    <style>
{FONTS}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{margin:0;width:{w}px;height:{h}px;overflow:hidden;background:#14111F}}
#root{{position:relative;width:100%;height:100%;overflow:hidden}}
{css}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="{cid}" data-start="0" data-duration="{dur}" data-width="{w}" data-height="{h}">
{body}
    </div>
    <script>
{js}
    </script>
  </body>
</html>
"""


# ---------------------------------------------------------------- 1. hero ambient
def hero():
    cols, rows, gap = 16, 9, 120
    dots = []
    for r in range(rows):
        for c in range(cols):
            dots.append(f'<i class="dot" id="d{r}_{c}" style="left:{c * gap + 60}px;top:{r * gap + 60}px"></i>')
    css = """
.scene{position:absolute;inset:0;background:#14111F}
.arm{position:absolute;left:50%;top:50%;width:0;height:0}
.orb{position:absolute;border-radius:50%;filter:blur(120px)}
#o1{width:900px;height:900px;left:-200px;top:-450px;background:#6B4AF2;opacity:.75}
#o2{width:760px;height:760px;left:-760px;top:-80px;background:#C6512E;opacity:.55}
#o3{width:620px;height:620px;left:120px;top:60px;background:#E8A33D;opacity:.38}
#o4{width:700px;height:700px;left:-560px;top:-640px;background:#3F27B8;opacity:.8}
.grid{position:absolute;inset:0}
.dot{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;border:1.5px solid rgba(245,238,232,.13)}
.dot b{display:block;width:100%;height:100%;border-radius:50%;background:#F5EEE8;opacity:0;transform:scale(.4)}
.vig{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 45%,transparent 40%,rgba(20,17,31,.85) 100%)}
.grain{position:absolute;inset:0;opacity:.09;mix-blend-mode:overlay}
"""
    dots = [d.replace("></i>", "><b></b></i>") for d in dots]
    body = f"""
      <div class="scene clip" id="scene" data-start="0" data-duration="10" data-track-index="0">
        <div class="arm" id="a1"><div class="orb" id="o1" data-layout-allow-overflow></div></div>
        <div class="arm" id="a2"><div class="orb" id="o2" data-layout-allow-overflow></div></div>
        <div class="arm" id="a3"><div class="orb" id="o3" data-layout-allow-overflow></div></div>
        <div class="arm" id="a4"><div class="orb" id="o4" data-layout-allow-overflow></div></div>
        <div class="grid" id="grid">{''.join(dots)}</div>
        <div class="vig"></div>
        <svg class="grain" width="1920" height="1080"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>
      </div>"""
    js = f"""
      const tl = gsap.timeline({{ paused: true }});
      // Orbs ride full circles: 360° over the whole loop, so frame 0 == frame 300.
      tl.fromTo("#a1", {{ rotation: 0 }}, {{ rotation: 360, duration: 10, ease: "none" }}, 0);
      tl.fromTo("#a2", {{ rotation: 0 }}, {{ rotation: -360, duration: 10, ease: "none" }}, 0);
      tl.fromTo("#a3", {{ rotation: 40 }}, {{ rotation: 400, duration: 10, ease: "none" }}, 0);
      tl.fromTo("#a4", {{ rotation: 0 }}, {{ rotation: -360, duration: 10, ease: "none" }}, 0);
      // A diagonal wave of stamps lights up and empties again inside the 10 s window.
      for (let r = 0; r < {rows}; r++) {{
        for (let c = 0; c < {cols}; c++) {{
          const p = 0.6 + (c + r) * 0.26;
          const el = "#d" + r + "_" + c + " b";
          tl.fromTo(el, {{ opacity: 0, scale: 0.4 }}, {{ opacity: 0.85, scale: 1, duration: 0.45, ease: "back.out(2.2)" }}, p);
          tl.to(el, {{ opacity: 0, scale: 0.4, duration: 1.1, ease: "power2.in" }}, p + 1.1);
        }}
      }}
      window.__timelines["hero"] = tl;
      tl.seek(0);"""
    return page("hero", 1920, 1080, 10, css, body, js)


# ---------------------------------------------------------------- 2. card tap (square)
def tap():
    css = CARD_CSS + """
.bg{position:absolute;inset:0;background:radial-gradient(70% 60% at 30% 20%,#8C6BFF 0%,transparent 60%),radial-gradient(60% 60% at 85% 90%,#C6512E 0%,transparent 55%),linear-gradient(150deg,#5A3BE0,#3F27B8 60%,#2A1A80)}
.lines{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:60px 60px;-webkit-mask-image:radial-gradient(closest-side,#000,transparent);mask-image:radial-gradient(closest-side,#000,transparent)}
.stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.float{width:560px}
.float .wp{width:560px;border-radius:26px}
.float .wp__head{padding:24px 26px 22px;gap:16px}
.float .wp__logo{width:52px;height:52px;border-radius:13px}
.float .wp__name{font-size:28px}
.float .wp__hf small,.float .wp__f small{font-size:13px}
.float .wp__hf b{font-size:30px}
.float .wp__pts b{font-size:72px;font-variant-numeric:tabular-nums}
.float .wp__pts small{font-size:16px;margin-top:8px}
.float .wp__bar{height:8px}
.float .wp__fields{padding:22px 26px 28px}
.float .wp__f b{font-size:22px}
.chip{position:absolute;right:28px;top:22px;padding:10px 18px;border-radius:999px;background:#fff;color:#14111F;font:700 22px "Hanken Grotesk",sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.3);opacity:0}
.ring{position:absolute;left:50%;top:50%;width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:50%;border:3px solid rgba(255,255,255,.9);opacity:0}
.notif{position:absolute;left:150px;right:150px;top:70px;display:flex;gap:18px;align-items:flex-start;padding:22px 24px;border-radius:30px;background:rgba(250,248,252,.94);color:#17121e;box-shadow:0 30px 60px -20px rgba(10,0,40,.6);opacity:0}
.notif img{width:56px;height:56px;border-radius:14px;flex:none}
.notif .t{display:flex;flex-direction:column;gap:4px;font:500 22px/1.3 "Hanken Grotesk",sans-serif;min-width:0}
.notif .hd{display:flex;justify-content:space-between;gap:10px}
.notif .hd b{font-weight:600;font-size:23px}
.notif .hd small{font-size:18px;opacity:.5}
.shine{position:absolute;inset:0;border-radius:26px;overflow:hidden;pointer-events:none}
.shine i{position:absolute;top:-20%;bottom:-20%;width:140px;left:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-18deg);opacity:0}
.cap{position:absolute;left:0;right:0;bottom:70px;text-align:center;font:700 34px "Bricolage Grotesque",sans-serif;letter-spacing:-.02em;color:#fff}
.cap span{display:inline-block;opacity:0}
"""
    body = """
      <div class="clip" id="scene" data-start="0" data-duration="8" data-track-index="0" style="position:absolute;inset:0">
        <div class="bg"></div><div class="lines"></div>
        <div class="stage">
          <div class="float" id="float">
            <div class="wp" style="--wp-bg:#3E5A3A;position:relative">
              <div class="wp__head"><span class="wp__logo"><img src="assets/karine_logo.jpg" alt="" /></span><span class="wp__name">Chez Karine</span><span class="wp__hf"><small>Récompenses</small><b id="rw">2</b></span></div>
              <div class="wp__strip" style="background-image:url(assets/karine_strip.jpg)">
                <div class="wp__pts"><b id="pts">106</b><small id="lbl">points · encore 44 pour le dessert offert</small></div>
                <span class="wp__bar"><i id="bar"></i></span>
                <span class="chip" id="chip">+24 pts</span>
              </div>
              <div class="wp__fields"><div class="wp__f"><small>Membre</small><b>CAMILLE</b></div><div class="wp__f"><small>Statut</small><b>ARGENT</b></div><div class="wp__f"><small>Depuis</small><b>2025</b></div></div>
              <div class="shine"><i id="sh"></i></div>
            </div>
          </div>
          <span class="ring" id="ring1"></span><span class="ring" id="ring2"></span>
        </div>
        <div class="notif" id="notif"><img src="assets/karine_logo.jpg" alt="" /><span class="t"><span class="hd"><b>Chez Karine</b><small>maintenant</small></span><span>+24 points, Camille ! Plus que 20 avant le dessert offert.</span></span></div>
        <p class="cap"><span id="c1">Scannée.</span> <span id="c2">Créditée.</span> <span id="c3">Notifiée.</span></p>
      </div>"""
    js = """
      const tl = gsap.timeline({ paused: true });
      const pts = document.getElementById("pts"), lbl = document.getElementById("lbl");
      const counter = { v: 106 };
      const write = () => { const v = Math.round(counter.v); pts.textContent = v; lbl.textContent = "points · encore " + (150 - v) + " pour le dessert offert"; };
      // gentle idle float, returns to rest at 8 s
      tl.fromTo("#float", { y: 0, rotation: -2 }, { y: -14, rotation: 0, duration: 4, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
      // scan pulse
      tl.fromTo("#ring1", { scale: 0.4, opacity: 0.9 }, { scale: 3.4, opacity: 0, duration: 1.1, ease: "power2.out", immediateRender: false }, 0.7);
      tl.fromTo("#ring2", { scale: 0.4, opacity: 0.7 }, { scale: 3.4, opacity: 0, duration: 1.1, ease: "power2.out", immediateRender: false }, 0.95);
      tl.fromTo("#c1", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.8);
      // credit
      tl.fromTo("#chip", { opacity: 0, y: 14, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(2)" }, 1.5);
      tl.fromTo(counter, { v: 106 }, { v: 130, duration: 0.9, ease: "power3.out", onUpdate: write }, 1.6);
      tl.fromTo("#bar", { scaleX: 0.707 }, { scaleX: 0.867, duration: 0.9, ease: "power3.out" }, 1.6);
      tl.fromTo("#c2", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 1.7);
      tl.to("#chip", { opacity: 0, y: -12, duration: 0.4, ease: "power2.in" }, 2.8);
      // notification
      tl.fromTo("#notif", { opacity: 0, y: -40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" }, 3.0);
      tl.fromTo("#c3", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 3.1);
      tl.to("#notif", { opacity: 0, y: -30, duration: 0.45, ease: "power2.in" }, 5.6);
      tl.to(["#c1", "#c2", "#c3"], { opacity: 0, y: -10, duration: 0.4, stagger: 0.06, ease: "power2.in" }, 5.8);
      // shimmer sweep hides the reset back to the opening state
      tl.fromTo("#sh", { x: -200, opacity: 0 }, { x: 760, opacity: 1, duration: 0.9, ease: "power2.inOut" }, 6.5);
      tl.to(counter, { v: 106, duration: 0.5, ease: "power2.inOut", onUpdate: write }, 6.8);
      tl.to("#bar", { scaleX: 0.707, duration: 0.5, ease: "power2.inOut" }, 6.8);
      window.__timelines["tap"] = tl;
      tl.seek(0);"""
    return page("tap", 1080, 1080, 8, css, body, js)


# ---------------------------------------------------------------- 3. CTA drift
def drift():
    pitch = 380 + 30
    n = len(SHOPS)
    set_w = n * pitch
    rows = []
    for r in range(3):
        order = [(k * 5 + r * 3) % n for k in range(n)]
        cards = "".join(card(i, f"c{r}_{j}") for j, i in enumerate(order))
        cards2 = "".join(card(i, f"c{r}_{j}b") for j, i in enumerate(order))
        rows.append(f'<div class="row" id="row{r}">{cards}{cards2}</div>')
    css = CARD_CSS + f"""
.bg{{position:absolute;inset:0;background:#1A1236}}
.plane{{position:absolute;left:50%;top:50%;width:{set_w * 2}px;margin-left:-{set_w}px;margin-top:-640px;display:flex;flex-direction:column;gap:34px;transform:perspective(1800px) rotateX(24deg) rotateZ(-9deg)}}
.row{{display:flex;gap:30px;width:{set_w * 2}px}}
.wp{{box-shadow:0 30px 60px -24px rgba(5,0,20,.8)}}
.glow{{position:absolute;inset:0;background:radial-gradient(45% 55% at 70% 60%,rgba(107,74,242,.55),transparent 70%),radial-gradient(35% 40% at 15% 20%,rgba(198,81,46,.35),transparent 70%)}}
.shade{{position:absolute;inset:0;background:linear-gradient(90deg,rgba(26,18,54,.92) 0%,rgba(26,18,54,.55) 45%,rgba(26,18,54,.25) 100%),linear-gradient(0deg,rgba(26,18,54,.7),transparent 40%)}}
"""
    body = f"""
      <div class="clip" id="scene" data-start="0" data-duration="14" data-track-index="0" style="position:absolute;inset:0">
        <div class="bg"></div>
        <div class="plane" data-layout-allow-occlusion>{''.join(rows)}</div>
        <div class="glow" data-layout-allow-occlusion></div><div class="shade" data-layout-allow-occlusion></div>
      </div>"""
    js = f"""
      const tl = gsap.timeline({{ paused: true }});
      // Each row slides exactly one set width over the loop, so the last frame meets the first.
      tl.fromTo("#row0", {{ x: 0 }}, {{ x: -{set_w}, duration: 14, ease: "none" }}, 0);
      tl.fromTo("#row1", {{ x: -{set_w} }}, {{ x: 0, duration: 14, ease: "none" }}, 0);
      tl.fromTo("#row2", {{ x: 0 }}, {{ x: -{set_w}, duration: 14, ease: "none" }}, 0);
      window.__timelines["drift"] = tl;
      tl.seek(0);"""
    return page("drift", 1920, 1080, 14, css, body, js)


for name, fn in (("hero.html", hero), ("tap.html", tap), ("drift.html", drift)):
    open(os.path.join(OUT, name), "w").write(fn())
print("ok")
