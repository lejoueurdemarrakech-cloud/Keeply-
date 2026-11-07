"""Logos des restaurants fictifs du Studio cartes.

Usage : npm i --no-save lucide-static && python3 scripts/make-studio-logos.py public/studio/logos

Formes et typographie dessinées ici ; pictogrammes Lucide (licence ISC, usage commercial libre).
Sortie : hq/public/studio/logos/<slug>.svg (200 x 200).
"""
import os, re, sys

ICONS = os.path.join(os.path.dirname(__file__), "..", "node_modules/lucide-static/icons")
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

SANS = "'Avenir Next', 'Helvetica Neue', Helvetica, Arial, sans-serif"
SERIF = "Didot, 'Bodoni 72', Georgia, 'Times New Roman', serif"
ROUND = "'Arial Rounded MT Bold', 'Avenir Next', Helvetica, sans-serif"


def icon(name, cx, cy, size, color, width=2):
    raw = open(os.path.join(ICONS, f"{name}.svg")).read()
    body = raw[raw.index(">", raw.index("<svg")) + 1 : raw.rindex("</svg>")]
    k = size / 24
    return (
        f'<g transform="translate({cx - size / 2:.1f} {cy - size / 2:.1f}) scale({k:.4f})" fill="none" stroke="{color}" '
        f'stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round">{body}</g>'
    )


def ring_text(text, r, color, size, font=SANS, weight=700, bottom=None, spacing=3):
    # Texte sur le haut du cercle (et éventuellement sur le bas, à l'endroit).
    s = (
        f'<path id="t" d="M {100 - r} 100 A {r} {r} 0 0 1 {100 + r} 100" fill="none"/>'
        f'<text font-family="{font}" font-weight="{weight}" font-size="{size}" letter-spacing="{spacing}" fill="{color}" text-anchor="middle">'
        f'<textPath href="#t" startOffset="50%">{text}</textPath></text>'
    )
    if bottom:
        rb = r + size * 0.72
        s += (
            f'<path id="b" d="M {100 - rb} 100 A {rb} {rb} 0 0 0 {100 + rb} 100" fill="none"/>'
            f'<text font-family="{font}" font-weight="{weight}" font-size="{size}" letter-spacing="{spacing}" fill="{color}" text-anchor="middle">'
            f'<textPath href="#b" startOffset="50%">{bottom}</textPath></text>'
        )
    return s


def svg(inner):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">{inner}</svg>'


def badge(L):
    # Écusson rond : anneau de texte + pictogramme.
    bg, ink = L["bg"], L["ink"]
    s = f'<circle cx="100" cy="100" r="98" fill="{bg}"/>'
    s += f'<circle cx="100" cy="100" r="88" fill="none" stroke="{ink}" stroke-width="2.5"/>'
    s += f'<circle cx="100" cy="100" r="56" fill="none" stroke="{ink}" stroke-width="1.5"/>'
    s += ring_text(L["text"], 66, ink, 15, bottom=L.get("bottom"))
    s += f'<circle cx="44" cy="104" r="3" fill="{ink}"/><circle cx="156" cy="104" r="3" fill="{ink}"/>'
    s += icon(L["icon"], 100, 100, 54, ink, 1.8)
    return svg(s)


def tile(L):
    # Carré arrondi façon icône d'app, pictogramme plein cadre et petit mot dessous.
    bg, ink = L["bg"], L["ink"]
    s = f'<rect x="2" y="2" width="196" height="196" rx="46" fill="{bg}"/>'
    word = L.get("word")
    s += icon(L["icon"], 100, 88 if word else 100, 104 if word else 120, ink, 2.2)
    if word:
        s += f'<text x="100" y="172" font-family="{L.get("font", SANS)}" font-weight="800" font-size="27" letter-spacing="2" fill="{ink}" text-anchor="middle">{word}</text>'
    return svg(s)


def stamp(L):
    # Tampon : bord crénelé, double cercle pointillé, pictogramme et étoiles.
    bg, ink = L["bg"], L["ink"]
    import math

    pts = []
    for i in range(48):
        a = math.pi * 2 * i / 48
        r = 98 if i % 2 == 0 else 91
        pts.append(f"{100 + r * math.cos(a):.1f},{100 + r * math.sin(a):.1f}")
    s = f'<polygon points="{" ".join(pts)}" fill="{bg}"/>'
    s += f'<circle cx="100" cy="100" r="78" fill="none" stroke="{ink}" stroke-width="2" stroke-dasharray="4 5"/>'
    s += icon(L["icon"], 100, 92, 70, ink, 2)
    if L.get("word"):
        s += f'<text x="100" y="152" font-family="{ROUND}" font-weight="800" font-size="22" letter-spacing="1.5" fill="{ink}" text-anchor="middle">{L["word"]}</text>'
    return svg(s)


def monogram(L):
    # Monogramme raffiné : initiales à empattements dans un double filet.
    bg, ink = L["bg"], L["ink"]
    s = f'<circle cx="100" cy="100" r="98" fill="{bg}"/>'
    s += f'<circle cx="100" cy="100" r="86" fill="none" stroke="{ink}" stroke-width="1.2"/>'
    s += f'<circle cx="100" cy="100" r="81" fill="none" stroke="{ink}" stroke-width="0.6"/>'
    s += f'<text x="100" y="{L.get("ty", 122)}" font-family="{SERIF}" font-size="{L.get("fs", 64)}" font-style="{"italic" if L.get("italic") else "normal"}" fill="{ink}" text-anchor="middle" letter-spacing="2">{L["letters"]}</text>'
    if L.get("icon"):
        s += icon(L["icon"], 100, 50, 24, ink, 1.5)
    if L.get("sub"):
        s += f'<text x="100" y="152" font-family="{SANS}" font-weight="600" font-size="11" letter-spacing="4" fill="{ink}" text-anchor="middle">{L["sub"]}</text>'
    return svg(s)


def hexa(L):
    bg, ink = L["bg"], L["ink"]
    s = f'<polygon points="100,3 184,51.5 184,148.5 100,197 16,148.5 16,51.5" fill="{bg}"/>'
    s += f'<polygon points="100,18 171,59 171,141 100,182 29,141 29,59" fill="none" stroke="{ink}" stroke-width="2"/>'
    s += icon(L["icon"], 100, 86 if L.get("word") else 100, 66 if L.get("word") else 78, ink, 2)
    if L.get("word"):
        s += f'<text x="100" y="150" font-family="{SANS}" font-weight="800" font-size="19" letter-spacing="2.5" fill="{ink}" text-anchor="middle">{L["word"]}</text>'
    return svg(s)


def shield(L):
    bg, ink = L["bg"], L["ink"]
    s = f'<path d="M100 4 L182 30 V96 C182 146 146 180 100 196 C54 180 18 146 18 96 V30 Z" fill="{bg}"/>'
    s += f'<path d="M100 18 L168 40 V96 C168 138 138 166 100 180 C62 166 32 138 32 96 V40 Z" fill="none" stroke="{ink}" stroke-width="2"/>'
    s += icon(L["icon"], 100, 86, 66, ink, 2)
    if L.get("word"):
        s += f'<text x="100" y="146" font-family="{SANS}" font-weight="800" font-size="19" letter-spacing="3" fill="{ink}" text-anchor="middle">{L["word"]}</text>'
    return svg(s)


def sun(L):
    # Disque plein avec pictogramme blanc et rayons (style street-food).
    import math

    bg, ink, acc = L["bg"], L["ink"], L.get("accent", L["ink"])
    s = ""
    for i in range(16):
        a = math.pi * 2 * i / 16
        x1, y1 = 100 + 84 * math.cos(a), 100 + 84 * math.sin(a)
        x2, y2 = 100 + 98 * math.cos(a), 100 + 98 * math.sin(a)
        s += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{acc}" stroke-width="7" stroke-linecap="round"/>'
    s += f'<circle cx="100" cy="100" r="76" fill="{bg}"/>'
    s += icon(L["icon"], 100, 92 if L.get("word") else 100, 70, ink, 2.2)
    if L.get("word"):
        s += f'<text x="100" y="148" font-family="{ROUND}" font-weight="800" font-size="20" letter-spacing="1" fill="{ink}" text-anchor="middle">{L["word"]}</text>'
    return svg(s)


STYLES = {"badge": badge, "tile": tile, "stamp": stamp, "monogram": monogram, "hex": hexa, "shield": shield, "sun": sun}

LOGOS = [
    # Cartes existantes
    dict(slug="smash-club", style="tile", bg="#F2A81C", ink="#111111", icon="hamburger", word="SMASH"),
    dict(slug="pizzeria-nonna", style="badge", bg="#FFF4E2", ink="#A63A22", icon="pizza", text="PIZZERIA", bottom="NONNA"),
    dict(slug="cafe-lumiere", style="badge", bg="#EAD3B2", ink="#4A3226", icon="coffee", text="CAFÉ LUMIÈRE", bottom="TORRÉFACTION"),
    dict(slug="maison-brioche", style="monogram", bg="#F7F1E5", ink="#8A5A2B", letters="MB", icon="croissant", sub="BOULANGERIE"),
    dict(slug="sakura-bento", style="hex", bg="#F4A6B8", ink="#141A2E", icon="fish", word="SAKURA"),
    dict(slug="taco-loco", style="sun", bg="#FFD23F", ink="#B4231B", accent="#FFD23F", icon="flame", word="LOCO"),
    dict(slug="crunchy-corner", style="stamp", bg="#7A1F3D", ink="#FFD166", icon="drumstick", word="CRUNCHY"),
    dict(slug="gelato-bella", style="badge", bg="#FFE4EC", ink="#BE3A62", icon="ice-cream-cone", text="GELATO", bottom="BELLA"),
    dict(slug="comptoir-anna", style="monogram", bg="#2B2F3A", ink="#D9B95B", letters="CA", sub="BISTROT", icon="utensils-crossed"),
    dict(slug="atelier-braise", style="shield", bg="#1B1B1B", ink="#D9B95B", icon="flame", word="BRAISE"),
    dict(slug="green-bowl", style="tile", bg="#DDF5E9", ink="#047857", icon="salad", word="GREEN"),
    dict(slug="dar-atay", style="badge", bg="#E8D9A8", ink="#3E4A21", icon="leaf", text="DAR ATAY", bottom="SALON DE THÉ"),
    dict(slug="sweet-ring", style="sun", bg="#FFFFFF", ink="#C2185B", accent="#FFB3CF", icon="donut", word="SWEET"),
    dict(slug="casa-mojito", style="hex", bg="#9FE6C8", ink="#0B4F5C", icon="martini", word="MOJITO"),
    dict(slug="pasta-fresca", style="badge", bg="#B4462A", ink="#FFF4E2", icon="chef-hat", text="PASTA FRESCA", bottom="FATTA A MANO"),
    dict(slug="table-saphir", style="monogram", bg="#0F1F4D", ink="#C9B8F5", letters="TS", fs=60, sub="GASTRONOMIE", icon="gem"),
    # Nouvelles cartes
    dict(slug="mangal-grill", style="shield", bg="#B4231B", ink="#FFE7C2", icon="beef", word="MANGAL"),
    dict(slug="dar-tajine", style="badge", bg="#F3E3C9", ink="#9A3B1C", icon="cooking-pot", text="DAR TAJINE", bottom="CUISINE MAISON"),
    dict(slug="couscous-zahra", style="stamp", bg="#E8D9A8", ink="#0B6B4F", icon="wheat", word="ZAHRA"),
    dict(slug="ty-billig", style="badge", bg="#1E3A8A", ink="#FFFFFF", icon="wheat", text="TY BILLIG", bottom="CRÊPERIE"),
    dict(slug="ramen-kaze", style="hex", bg="#111111", ink="#F04438", icon="soup", word="KAZE"),
    dict(slug="bagel-street", style="tile", bg="#2B2F3A", ink="#F2C14E", icon="torus", word="BAGEL"),
    dict(slug="fresh-press", style="sun", bg="#FFFFFF", ink="#E8590C", accent="#FFA94D", icon="citrus", word="FRESH"),
    dict(slug="cacao-co", style="monogram", bg="#3A251B", ink="#E6C9A8", letters="C&amp;C", fs=46, ty=116, sub="CHOCOLATIER", icon="candy"),
    dict(slug="cave-saint-clair", style="monogram", bg="#5C1530", ink="#F0D9A8", letters="SC", sub="BAR À VIN", icon="wine"),
    dict(slug="smoky-ribs", style="stamp", bg="#111111", ink="#F2A81C", icon="flame", word="SMOKY"),
    dict(slug="masala-house", style="badge", bg="#F2A81C", ink="#5A1A00", icon="soup", text="MASALA HOUSE", bottom="CURRY &amp; TANDOOR"),
    dict(slug="sesame-falafel", style="hex", bg="#4D5B2A", ink="#F3E9C6", icon="sprout", word="SÉSAME"),
    dict(slug="fish-co", style="badge", bg="#E0F2F7", ink="#0E5A70", icon="fish-symbol", text="FISH &amp; CO", bottom="DEPUIS LA MER"),
    dict(slug="dog-avenue", style="tile", bg="#D62828", ink="#FFE066", icon="sandwich", word="DOGS"),
    dict(slug="waffle-lab", style="stamp", bg="#F5E3C3", ink="#8A4B14", icon="grid-3x3", word="WAFFLE"),
    dict(slug="rose-macaron", style="monogram", bg="#F8D7E3", ink="#9C2F5A", letters="R", fs=88, ty=128, italic=True, sub="PÂTISSERIE", icon="sparkles"),
]

for L in LOGOS:
    out = STYLES[L["style"]](L)
    open(os.path.join(OUT, f'{L["slug"]}.svg'), "w").write(out)
print(len(LOGOS))
