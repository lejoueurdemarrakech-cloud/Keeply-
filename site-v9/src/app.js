/* Keeply, site vitrine v9. Aucune dépendance sauf le générateur de QR (qrcode-generator, MIT). */
(function () {
  "use strict";
  var d = document, w = window;
  var REDUCE = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var fmt = function (n) { return Math.round(n).toLocaleString("fr-FR"); };
  var CARDS = w.KCARDS || [];
  var byK = {}; CARDS.forEach(function (c) { byK[c.k] = c; });

  /* ---------------------------------------------------------------- pays */
  // Mêmes seuils que l'app (Country.swift) : coûts des paliers et statuts en points.
  var LOCALES = {
    FR: { label: "France et Europe", cur: "€", curLine: "en euros en Europe", unit: "euro", who: "Camille",
      price: { m: "39,99", y: "359,99", ym: "30,00" }, costs: [70, 150, 250], tiers: [100, 300, 600],
      demo: { start: 38, gain: 24, bill: "24,50" }, ticket: [5, 80, 15] },
    MA: { label: "Maroc", cur: "DH", curLine: "en dirhams au Maroc", unit: "dirham", who: "Salma",
      price: { m: "399", y: "3 590", ym: "299" }, costs: [350, 750, 1250], tiers: [500, 1500, 3000],
      demo: { start: 180, gain: 120, bill: "120,00" }, ticket: [30, 500, 90] },
    CA: { label: "Canada", cur: "$ CA", curLine: "en dollars au Canada", unit: "dollar", who: "Léa",
      price: { m: "59,99", y: "539,99", ym: "45,00" }, costs: [100, 220, 360], tiers: [150, 450, 900],
      demo: { start: 52, gain: 32, bill: "32,00" }, ticket: [5, 100, 22] }
  };
  var CA_TZ = /^America\/(Toronto|Montreal|Vancouver|Edmonton|Winnipeg|Halifax|Regina|St_Johns|Moncton|Whitehorse|Yellowknife|Iqaluit)/;
  function detectCountry() {
    try { var s = localStorage.getItem("keeply-pays"); if (s && LOCALES[s]) return s; } catch (e) {}
    var tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    if (tz === "Africa/Casablanca" || tz === "Africa/El_Aaiun") return "MA";
    if (CA_TZ.test(tz)) return "CA";
    var langs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) { if (/-MA$/i.test(langs[i])) return "MA"; if (/-CA$/i.test(langs[i])) return "CA"; }
    return "FR";
  }
  var COUNTRY = detectCountry(), L = LOCALES[COUNTRY];
  L.priceSentence = L.price.m + " " + L.cur + " par mois, ou " + L.price.y + " " + L.cur + " par an";
  L.currencyShort = L.cur; L.currencyLine = L.curLine; L.zeroHw = "0 " + L.cur;
  function applyLocale() {
    $$("[data-loc]").forEach(function (el) { var v = L[el.getAttribute("data-loc")]; if (v != null) el.textContent = v; });
    var sel = $("#pays"); if (!sel) return;
    sel.innerHTML = Object.keys(LOCALES).map(function (k) { return '<option value="' + k + '"' + (k === COUNTRY ? " selected" : "") + ">" + LOCALES[k].label + "</option>"; }).join("");
    sel.addEventListener("change", function () { try { localStorage.setItem("keeply-pays", sel.value); } catch (e) {} location.reload(); });
  }

  /* ---------------------------------------------------------------- QR */
  var qrCache = {};
  function qrSVG(text) {
    if (qrCache[text]) return qrCache[text];
    var svg = "";
    try {
      var q = w.qrcode(0, "M"); q.addData(text); q.make();
      var n = q.getModuleCount(), p = "";
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) p += "M" + c + " " + r + "h1v1h-1z";
      svg = '<svg viewBox="0 0 ' + n + " " + n + '" shape-rendering="crispEdges" aria-hidden="true"><path fill="#111" d="' + p + '"/></svg>';
    } catch (e) { svg = '<svg viewBox="0 0 1 1"></svg>'; }
    return (qrCache[text] = svg);
  }

  /* ---------------------------------------------------------------- couleurs */
  function rgb(h) { h = h.replace("#", ""); if (h.length === 3) h = h.replace(/./g, "$&$&"); var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function lum(h) { return rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [0.2126, 0.7152, 0.0722][i]; }, 0); }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return "#" + x.map(function (v, i) { return ("0" + Math.round(v + (y[i] - v) * t).toString(16)).slice(-2); }).join(""); }
  function autoInk(bg) { var fg = lum(bg) > 0.45 ? "#1A1A1A" : "#FFFFFF"; return { fg: fg, lb: mix(fg, bg, 0.3) }; }

  /* ---------------------------------------------------------------- carte Wallet */
  // Même géométrie que WalletPassPreview.swift (base 320, bandeau 375×144).
  function stampsHTML(o) {
    var slots = Math.max(1, Math.min(o.total || 10, 10)), rows = slots > 5 ? 2 : 1, per = Math.ceil(slots / rows);
    var H = 122.88, dd = Math.min(H * (rows === 1 ? 0.46 : 0.34), (320 * 0.86) / (per * 1.28));
    var filled = Math.min(o.stamps || 0, slots), out = "";
    for (var r = 0; r < rows; r++) {
      out += '<div class="kc__row">';
      for (var c = 0; c < per; c++) { var i = r * per + c; if (i >= slots) break; var on = i < filled; out += '<span class="kc__st' + (on ? " on" : "") + '">' + (on ? esc(o.stamp || o.icon || "") : "") + "</span>"; }
      out += "</div>";
    }
    return '<div class="kc__stamps" style="--d:' + dd.toFixed(2) + '">' + out + "</div>";
  }
  function ptsLabel(o) {
    var left = (o.goal || 0) - (o.points || 0);
    return "points" + (o.bar !== false && left > 0 ? " · encore " + fmt(left) + " pour " + (o.reward || "−10 %") : "");
  }
  function cardHTML(o) {
    var ink = o.fg ? { fg: o.fg, lb: o.lb || mix(o.fg, o.bg, 0.3) } : autoInk(o.bg);
    var strip = o.strip || (o.k ? "cartes/" + o.k + ".jpg" : null);
    var logo = o.logo || (o.k ? "cartes/" + o.k + ".svg" : null);
    var logoHTML = logo ? '<img src="' + esc(logo) + '" alt="">' : esc(o.icon || "★");
    var pts = o.model === "points", mid;
    if (pts) {
      var frac = Math.max(0, Math.min(1, (o.points || 0) / Math.max(o.goal || 1, 1)));
      mid = '<div class="kc__pts"><b>' + fmt(o.points || 0) + "</b><span>" + esc(ptsLabel(o)) + "</span></div>" +
        (o.bar === false ? "" : (strip ? '<i class="kc__shade"></i>' : "") + '<span class="kc__bar"><i style="--p:' + (frac * 100).toFixed(1) + '"></i></span>');
    } else mid = stampsHTML(o);
    var dim = strip ? '<i class="kc__dim" style="opacity:' + (o.dim == null ? 0.3 : o.dim) + '"></i>' : "";
    var stripStyle = strip ? ' style="background-image:url(' + esc(strip) + ");background-position:center " + (o.posY == null ? 50 : o.posY) + '%"' : "";
    var serial = "KPL-" + (o.k || o.name || "x").replace(/[^a-z]/gi, "").slice(0, 4).toUpperCase() + "-" + (o.member || "").slice(0, 3);
    return '<div class="kc' + (o.noqr ? " kc--noqr" : "") + '" style="--bg:' + o.bg + ";--fg:" + ink.fg + ";--lb:" + ink.lb + '">' +
      '<div class="kc__in">' +
      '<div class="kc__head"><span class="kc__logo">' + logoHTML + '</span><span class="kc__name">' + esc(o.name) + '</span><span class="kc__hf"><small>RÉCOMPENSES</small><b class="num">' + (o.rewards || 0) + "</b></span></div>" +
      '<div class="kc__strip' + (strip ? "" : " kc__strip--grad") + '"' + stripStyle + ">" + dim + mid + "</div>" +
      '<div class="kc__fields"><div><small>MEMBRE</small><b>' + esc(o.member || "") + "</b></div><div><small>STATUT</small><b>" + esc(o.status || "MEMBRE") + "</b></div><div><small>DEPUIS</small><b>" + esc(o.since || "2026") + "</b></div></div>" +
      '<div class="kc__qr"><span>' + qrSVG("keeply://c/" + serial) + "</span></div>" +
      "</div></div>";
  }
  function kc(k, extra) { var o = {}, x, s = byK[k] || CARDS[0]; for (x in s) o[x] = s[x]; for (x in extra || {}) o[x] = extra[x]; return o; }

  /* ---------------------------------------------------------------- héros */
  function initHero() {
    var st = $("#heroStack"); if (!st || st.dataset.ready) return; st.dataset.ready = "1";
    var D = L.demo;
    var shops = [
      kc("comptoir-anna", { model: "points", points: D.start, goal: L.costs[0], reward: "−10 %", gain: D.gain, rewards: 2, member: L.who.toUpperCase(), status: "ARGENT", since: "2025" }),
      kc("smash-club", { stamps: 5, total: 8, rewards: 1, status: "BRONZE" }),
      kc("cafe-lumiere", { stamps: 6, rewards: 3, status: "OR" })
    ];
    st.innerHTML = shops.map(cardHTML).join("");
    var cards = [].slice.call(st.children), order = [0, 1, 2];
    function layout() { order.forEach(function (ci, pos) { cards[ci].setAttribute("data-pos", String(pos)); }); }
    layout();
    if (REDUCE) return;
    var timer = null;
    function cycle() {
      var ci = order[0], el = cards[ci], o = shops[ci];
      if (o.model === "points") {
        var from = o.points; o.points += o.gain;
        if (o.points >= o.goal) { o.points -= o.goal; o.rewards++; }
        var b = el.querySelector(".kc__pts b"), sp = el.querySelector(".kc__pts span"), bar = el.querySelector(".kc__bar i"), hf = el.querySelector(".kc__hf b");
        var chip = d.createElement("span"); chip.className = "kc__gain"; chip.textContent = "+" + o.gain + " pts"; el.querySelector(".kc__strip").appendChild(chip);
        setTimeout(function () { chip.remove(); }, 1700);
        b.textContent = fmt(o.points); sp.textContent = ptsLabel(o); bar.style.setProperty("--p", (o.points / o.goal * 100).toFixed(1)); hf.textContent = o.rewards;
        void from;
      } else {
        var empty = el.querySelector(".kc__st:not(.on)");
        if (!empty) { $$(".kc__st", el).forEach(function (s) { s.classList.remove("on"); s.textContent = ""; }); empty = el.querySelector(".kc__st"); }
        empty.classList.add("on", "pop"); empty.textContent = o.stamp;
        setTimeout(function () { empty.classList.remove("pop"); }, 600);
      }
      setTimeout(function () {
        el.setAttribute("data-pos", "out");
        setTimeout(function () { order.push(order.shift()); layout(); }, 420);
      }, 1500);
    }
    function start() { if (!timer) timer = setInterval(cycle, 4200); }
    function stop() { clearInterval(timer); timer = null; }
    if ("IntersectionObserver" in w) new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? start() : stop(); }); }).observe(st);
    else start();
    d.addEventListener("visibilitychange", function () { d.hidden ? stop() : start(); });
  }

  /* ---------------------------------------------------------------- galerie */
  var FAMILY = { fast: ["Burger", "Pizzeria", "Tacos", "Poulet frit", "Hot-dogs", "Bagels", "Falafels", "Brochettes", "Poisson"],
    cafe: ["Café", "Salon de thé", "Boulangerie", "Donuts", "Glacier", "Pâtisserie", "Gaufres", "Crêperie", "Chocolatier", "Bar à jus"],
    resto: ["Bistrot", "Steakhouse", "Gastronomique", "Italien", "Japonais", "Ramen", "Marocain", "Indien", "Salades", "Barbecue"],
    bar: ["Bar", "Bar à vin"] };
  function galleryCard(c) {
    var o = kc(c.k);
    if (o.model === "points") { o.goal = L.costs[0]; o.points = Math.round(L.costs[0] * (0.25 + ((c.name.length * 7) % 60) / 100)); }
    return cardHTML(o);
  }
  function initGallery() {
    var g = $("#gallery"); if (!g || g.dataset.ready) return; g.dataset.ready = "1";
    function render(f) {
      var list = f === "all" ? CARDS : CARDS.filter(function (c) { return FAMILY[f].indexOf(c.type) >= 0; });
      g.innerHTML = list.map(galleryCard).join(""); g.scrollLeft = 0; arrows();
    }
    $$(".chip").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".chip").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        render(b.getAttribute("data-f"));
      });
    });
    var nav = $$(".rail__nav button");
    function arrows() {
      if (!nav.length) return;
      nav[0].disabled = g.scrollLeft < 8;
      nav[1].disabled = g.scrollLeft + g.clientWidth > g.scrollWidth - 8;
    }
    nav.forEach(function (b) { b.addEventListener("click", function () { g.scrollBy({ left: +b.getAttribute("data-dir") * (g.clientWidth * 0.8), behavior: REDUCE ? "auto" : "smooth" }); }); });
    g.addEventListener("scroll", function () { w.requestAnimationFrame(arrows); }, { passive: true });
    render("all");
  }

  /* ---------------------------------------------------------------- comment ça marche */
  function posterHTML(o, size) {
    var c = o.bg, on = autoInk(c).fg;
    var mech = o.model === "points" ? "Cumulez des points à chaque passage et gagnez des réductions." : "1 visite = 1 tampon. Votre première remise dès " + (o.step || 10) + " tampons.";
    return '<div class="poster' + (size === "a5" ? " poster--a5" : "") + '" style="--c:' + c + ";--on:" + on + '"><div class="poster__in">' +
      '<span class="poster__logo"><img src="cartes/' + o.k + '.svg" alt=""></span>' +
      '<span class="poster__name">' + esc(o.name.toUpperCase()) + "</span>" +
      '<span class="poster__head">−10 % dès votre première visite</span>' +
      '<span class="poster__detail">🎁 Puis des récompenses à chaque passage.</span>' +
      '<span class="poster__qr"><span>' + qrSVG("https://keeplyfidelity.app/j/" + o.k) + "</span></span>" +
      '<span class="poster__scan">SCANNEZ-MOI</span>' +
      '<span class="poster__steps"><div><i><svg viewBox="0 0 24 24"><use href="#i-scan"/></svg><em>1</em></i>Scannez</div><div><i><svg viewBox="0 0 24 24"><use href="#i-wallet"/></svg><em>2</em></i>Ajoutez au Wallet</div><div><i><svg viewBox="0 0 24 24"><use href="#i-gift"/></svg><em>3</em></i>Cumulez</div></span>' +
      '<span class="poster__mech">' + mech + "</span>" +
      '<span class="poster__badges"><span><svg viewBox="0 0 24 24" width="10" height="10" fill="#fff"><use href="#i-apple"/></svg><span><small>Ajouter à</small>Apple Wallet</span></span><span><svg viewBox="0 0 24 24" width="10" height="10" fill="#fff"><use href="#i-gplay"/></svg><span><small>Ajouter à</small>Google Wallet</span></span></span>' +
      '<span class="poster__foot">Carte propulsée par Keeply</span>' +
      "</div></div>";
  }
  function howScreens() {
    var D = L.demo, anna = byK["comptoir-anna"];
    var cardBefore = kc("comptoir-anna", { model: "points", points: D.start, goal: L.costs[0], reward: "−10 %", rewards: 2, member: L.who.toUpperCase(), status: "ARGENT", since: "2025" });
    var after = D.start + D.gain, cardAfter = kc("comptoir-anna", { model: "points", points: after, goal: L.costs[0], reward: "−10 %", rewards: 2, member: L.who.toUpperCase(), status: "ARGENT", since: "2025", noqr: true });
    var left = L.costs[0] - after;
    return [
      '<div class="scr scr--cam" style="background-image:url(img/table.jpg)"><div class="cam__banner"><span class="wicon"></span><span><b>Wallet</b>Ajouter la carte ' + esc(anna.name) + '</span></div><div class="cam__frame"><span class="cam__corners"></span>' + posterHTML(kc("comptoir-anna"), "a5") + '</div><span class="cam__shutter"></span></div>',
      '<div class="scr scr--add"><div class="add__bar"><span>Annuler</span><b>Wallet</b><span>Ajouter</span></div><div class="add__card">' + cardHTML(cardBefore) + '</div><p class="add__hint">La carte apparaît dans le Wallet, à côté de la carte bancaire.</p></div>',
      '<div class="scr scr--till"><div class="till__who"><i>' + L.who[0] + '</i><div><b>' + esc(L.who) + ' · Argent</b><span>' + fmt(D.start) + ' points · 2 récompenses</span></div></div><div class="till__amt"><small>Montant de l\'addition</small><b>' + D.bill + " " + L.cur + '</b></div><div class="till__gain"><span>Points gagnés</span><b>+' + fmt(D.gain) + '</b></div><div class="till__gain"><span>Statut Argent</span><b>−5 %</b></div><span class="till__btn">Valider le passage</span></div>',
      '<div class="scr scr--lock" style="background-image:linear-gradient(rgba(20,16,12,.35),rgba(20,16,12,.55)),url(cartes/comptoir-anna.jpg)"><div class="lock__time"><small>mardi 12 novembre</small><b>20:41</b></div><div class="lock__notif"><img src="cartes/comptoir-anna.svg" alt=""><div><b>' + esc(anna.name) + "<span>maintenant</span></b>+" + fmt(D.gain) + " points. Plus que " + fmt(left) + ' pour −10 %.</div></div><div class="lock__card">' + cardHTML(cardAfter) + "</div></div>"
    ];
  }
  function initHow() {
    var phone = $("#howPhone"); if (!phone || phone.dataset.ready) return; phone.dataset.ready = "1";
    var screens = howScreens();
    phone.insertAdjacentHTML("beforeend", screens.join(""));
    var scr = $$(".scr", phone); scr[0].classList.add("is-on");
    $$(".step__screen").forEach(function (box) { box.innerHTML = screens[+box.getAttribute("data-screen")]; });
    var steps = $$(".step");
    function set(i) { steps.forEach(function (s, j) { s.classList.toggle("is-on", j === i); }); scr.forEach(function (s, j) { s.classList.toggle("is-on", j === i); }); }
    var cur = -1, ticking = false;
    function pick() {
      ticking = false;
      if (w.innerWidth <= 860) return;
      var mid = w.innerHeight / 2, best = 0, dist = 1e9;
      steps.forEach(function (s, i) { var r = s.getBoundingClientRect(), dd = Math.abs(r.top + r.height / 2 - mid); if (dd < dist) { dist = dd; best = i; } });
      if (best !== cur) { cur = best; set(best); }
    }
    w.addEventListener("scroll", function () { if (!ticking) { ticking = true; w.requestAnimationFrame(pick); } }, { passive: true });
    pick();
  }

  /* ---------------------------------------------------------------- fidélité */
  function ladderData(model) {
    if (model === "tampons") return [
      { at: 10, unit: "tampons", gain: "−10 %", title: "Remise fidélité", note: "Sur l'addition, une fois par passage" },
      { at: 20, unit: "tampons", gain: "−15 %", title: "Remise habitué", note: "Sur l'addition, une fois par passage" },
      { at: 30, unit: "tampons", gain: "−25 %", title: "Carte complète", note: "Une fois utilisée, la carte repart à zéro" }];
    return [
      { at: L.costs[0], unit: "points", gain: "−10 %", title: "Remise fidélité", note: "Sur l'addition, une fois par passage" },
      { at: L.costs[1], unit: "points", gain: "−15 %", title: "Remise habitué", note: "Sur l'addition, une fois par passage" },
      { at: L.costs[2], unit: "points", gain: "−25 %", title: "Grande remise", note: "Ensuite le client repart au premier palier, avec ses points et ses récompenses" }];
  }
  function ladderHTML(model, reached) {
    return ladderData(model).map(function (r, i) {
      return '<li class="' + (i < reached ? "on" : "") + '"><span class="dot"></span><div><b>' + r.title + "</b><span>" + r.note + "</span></div><em>" + fmt(r.at) + " " + (r.unit === "tampons" ? "tampons" : "pts") + " · " + r.gain + "</em></li>";
    }).join("");
  }
  function radio(group, cb) {
    var bs = $$("[role=radio]", group);
    bs.forEach(function (b) { b.addEventListener("click", function () { bs.forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); }); cb(b); }); });
  }
  var TIER = [
    { n: "Bronze", c: "#B4773F", gain: "−10 %", rule: "Une fois, le jour où il l'atteint", st: 10, i: 0 },
    { n: "Argent", c: "#9AA0A8", gain: "−5 %", rule: "Sur chaque addition, pendant un an", st: 30, i: 1 },
    { n: "Or", c: "#C9A227", gain: "−10 %", rule: "Sur chaque addition, pendant un an", st: 60, i: 2 }];
  function tiersHTML(model) {
    return TIER.map(function (t) {
      var at = model === "tampons" ? "Dès " + t.st + " passages dans l'année" : "Dès " + fmt(L.tiers[t.i]) + " points dans l'année";
      return '<div class="tier rv"><div class="tier__top"><span class="tier__badge"><i style="background:' + t.c + '"></i>' + t.n + '</span><span class="tier__gain num">' + t.gain + '</span></div><span class="tier__rule">' + t.rule + '</span><span class="tier__at">' + at + "</span></div>";
    }).join("");
  }
  function initFid() {
    var box = $("#fidCard"); if (!box || box.dataset.ready) return; box.dataset.ready = "1";
    var model = "tampons", st;
    function fresh() {
      st = model === "tampons"
        ? kc("pizzeria-nonna", { model: "tampons", stamps: 7, total: 10, rewards: 0, member: L.who.toUpperCase(), status: "MEMBRE", round: 0 })
        : kc("sakura-bento", { model: "points", points: Math.round(L.costs[0] * 0.55), goal: L.costs[0], reward: "−10 %", rewards: 0, member: L.who.toUpperCase(), status: "MEMBRE", rung: 0 });
    }
    function draw(msg) {
      box.innerHTML = cardHTML(st);
      var reached = model === "tampons" ? st.round : st.rung;
      $("#fidLadder").innerHTML = ladderHTML(model, reached);
      $("#fidIntro").textContent = model === "tampons"
        ? "Un passage égale un tampon. Tous les 10 tampons, une remise sur l'addition. Le chiffre se règle jusqu'à 50."
        : "Un point par " + L.unit + " dépensé, ou le taux que vous choisissez. Trois paliers de remise, adaptés à la monnaie de votre pays.";
      $("#fidFoot").textContent = model === "tampons" ? "Seuils proposés par défaut dans l'application." : "Seuils proposés par défaut pour " + (COUNTRY === "FR" ? "la France et la Belgique" : COUNTRY === "MA" ? "le Maroc" : "le Canada") + ".";
      $("#tiers").innerHTML = tiersHTML(model); reveal();
      $("#fidNote").textContent = msg || "";
    }
    function pass() {
      var msg;
      if (model === "tampons") {
        st.stamps++;
        if (st.stamps >= 10) {
          var r = ladderData("tampons")[st.round];
          msg = r.title + " débloquée : " + r.gain + " sur l'addition."; st.rewards++; st.round++;
          if (st.round >= 3) { msg = "Carte complète : −25 %. La carte repart à zéro."; st.round = 0; }
          st.stamps = 0;
        } else msg = "Encore " + (10 - st.stamps) + " tampon" + (10 - st.stamps > 1 ? "s" : "") + " avant la prochaine remise.";
      } else {
        var gain = L.demo.gain; st.points += gain;
        var lad = ladderData("points");
        if (st.points >= st.goal) {
          msg = lad[st.rung].title + " débloquée : " + lad[st.rung].gain + "."; st.rewards++; st.rung++;
          if (st.rung >= 3) { st.rung = 0; st.points = st.points - lad[2].at; msg += " Le client repart au premier palier."; }
          st.goal = lad[st.rung].at; st.reward = lad[st.rung].gain;
        } else msg = "+" + gain + " points pour une addition de " + L.demo.bill + " " + L.cur + ".";
      }
      draw(msg);
      if (model === "tampons" && st.stamps > 0 && !REDUCE) { var on = $$(".kc__st.on", box); var last = on[on.length - 1]; if (last) last.classList.add("pop"); }
    }
    radio($("#fidModel"), function (b) { model = b.getAttribute("data-m"); fresh(); draw(); });
    $("#fidAdd").addEventListener("click", pass);
    $("#fidReset").addEventListener("click", function () { fresh(); draw(); });
    fresh(); draw();
  }

  /* ---------------------------------------------------------------- offres automatiques */
  var OFFERS = [
    { id: "welcome", n: "Bienvenue", s: "À l'inscription", on: true, msg: function (sh) { return "Bienvenue chez " + sh + ", " + L.who + ". Votre carte est prête : −10 % sur votre prochaine addition."; } },
    { id: "birthday", n: "Anniversaire", s: "Le jour de son anniversaire", on: true, msg: function () { return "Joyeux anniversaire " + L.who + ". Un coupon dessert vous attend cette semaine."; } },
    { id: "winback", n: "Client dormant", s: "Après la durée sans visite que vous choisissez", on: false, msg: function () { return "Ça fait un moment, " + L.who + ". −15 % sur votre addition jusqu'à dimanche."; } },
    { id: "tier", n: "Statut atteint", s: "Quand il passe Bronze, Argent ou Or", on: true, msg: function () { return "Vous passez Argent, " + L.who + ". −5 % sur chaque addition pendant un an."; } },
    { id: "nth", n: "Toutes les N visites", s: "La 5e, la 10e, comme vous voulez", on: false, msg: function () { return "C'est votre 5e visite. Un coupon café vous attend au comptoir."; } },
    { id: "review", n: "Avis Google", s: "Une seule fois, jamais contre une récompense", on: false, msg: function () { return "Merci pour votre visite, " + L.who + ". Un avis Google nous aiderait beaucoup."; } }];
  function initAuto(listSel, count, notifSel) {
    var list = $(listSel); if (!list || list.dataset.ready) return; list.dataset.ready = "1";
    var shop = byK["comptoir-anna"], items = OFFERS.slice(0, count).map(function (o) { return { o: o, on: o.on }; }), last = items[0];
    var notif = notifSel && $(notifSel);
    function show() {
      if (!notif) return;
      var it = last && last.on ? last : items.filter(function (x) { return x.on; })[0];
      notif.classList.toggle("is-off", !it);
      notif.innerHTML = '<img src="cartes/' + shop.k + '.svg" alt=""><div><b>' + (it ? esc(shop.name) : "Aucun envoi automatique") + "<span>" + (it ? "maintenant" : "") + "</span></b>" + (it ? esc(it.o.msg(shop.name)) : "Tout est éteint. Vous écrivez quand vous voulez.") + "</div>";
    }
    list.innerHTML = items.map(function (it, i) { return '<li><div><b>' + it.o.n + "</b><span>" + it.o.s + '</span></div><button class="sw" type="button" role="switch" aria-checked="' + it.on + '" aria-label="' + it.o.n + '" data-i="' + i + '"></button></li>'; }).join("");
    $$(".sw", list).forEach(function (b) {
      b.addEventListener("click", function () { var it = items[+b.getAttribute("data-i")]; it.on = !it.on; b.setAttribute("aria-checked", String(it.on)); last = it; show(); });
    });
    show();
  }

  /* ---------------------------------------------------------------- activation */
  var ACT_SHOPS = ["cafe-lumiere", "smash-club", "pizzeria-nonna", "comptoir-anna", "sakura-bento", "dar-atay"];
  var FORMATS = [
    { id: "store", n: "Vitrine", f: "A4", size: "a4", tip: "En vitrine, à hauteur des yeux. Côté rue, elle travaille aussi quand vous êtes fermé.", file: "PDF A4 (21 × 29,7 cm), à imprimer à 100 %" },
    { id: "counter", n: "Caisse", f: "A5", size: "a5", tip: "Dans un présentoir près du terminal de paiement. Le client la voit pendant qu'il attend.", file: "PDF A5 (14,8 × 21 cm), à imprimer à 100 %" },
    { id: "table", n: "Table", f: "A5", size: "a5", tip: "Sur un petit chevalet. Le client assis a le temps de scanner.", file: "PDF A5 (14,8 × 21 cm), à imprimer à 100 %" }];
  function storyHTML(o) {
    var on = autoInk(o.bg).fg;
    var mech = o.model === "points" ? "Cumulez des points à chaque passage et gagnez des réductions." : "1 visite = 1 tampon. Votre première remise dès 10 tampons.";
    var mini = kc(o.k, { noqr: true, stamps: o.model === "points" ? 0 : 3, rewards: 0, member: L.who.toUpperCase(), points: Math.round(L.costs[0] * 0.3), goal: L.costs[0] });
    return '<div class="story" style="--c:' + o.bg + ";--on:" + on + '"><div class="story__in">' +
      '<div class="story__top"><img src="cartes/' + o.k + '.svg" alt=""><b>' + esc(o.name) + "</b><span>NOUVEAU</span></div>" +
      '<div class="story__head">−10 % dès votre première visite</div><div class="story__detail">Puis des récompenses à chaque passage.</div>' +
      '<div class="story__card">' + cardHTML(mini) + "</div>" +
      '<div class="story__add"><b>Ajoutez votre carte en un geste 👇</b><small>' + mech + "</small></div>" +
      '<span class="story__link"><svg viewBox="0 0 24 24"><use href="#i-link"/></svg>Votre lien ici</span>' +
      "</div></div>";
  }
  function chatHTML(o) {
    return '<div class="chat"><div class="chat__head"><img src="cartes/' + o.k + '.svg" alt=""><div><b>' + esc(o.name) + "</b><span>Message à vos habitués</span></div></div>" +
      '<div class="chat__msg">Bonjour ! ' + esc(o.name) + ' a maintenant sa carte de fidélité. Ajoutez-la dans votre téléphone en un geste avec ce lien. En cadeau : −10 % dès votre première visite.<br><a href="#/activation">keeplyfidelity.app/j/' + o.k + "</a><small>18:02</small></div></div>";
  }
  function initActivation(host) {
    if (host.dataset.ready) return; host.dataset.ready = "1";
    var uid = host.getAttribute("data-activation"), state = { ch: "posters", shop: "cafe-lumiere", fmt: 0 };
    host.innerHTML =
      '<div class="act">' +
      '<div class="act__ctrl">' +
      '<div><span class="act__lbl" id="' + uid + 'ChL">Canal</span><div class="tabs" role="tablist" aria-labelledby="' + uid + 'ChL">' +
      '<button type="button" role="tab" aria-selected="false" data-ch="instagram"><svg class="ic"><use href="#i-insta"/></svg>Instagram</button>' +
      '<button type="button" role="tab" aria-selected="true" data-ch="posters"><svg class="ic"><use href="#i-print"/></svg>Affiches</button>' +
      '<button type="button" role="tab" aria-selected="false" data-ch="messages"><svg class="ic"><use href="#i-chat"/></svg>Messages</button></div></div>' +
      '<div><span class="act__lbl" id="' + uid + 'ShL">Commerce d\'exemple</span><div class="shops" role="radiogroup" aria-labelledby="' + uid + 'ShL">' +
      ACT_SHOPS.map(function (k) { var c = byK[k]; return '<button type="button" role="radio" aria-checked="' + (k === state.shop) + '" aria-label="' + esc(c.name) + '" data-k="' + k + '" style="--c:' + c.bg + '"><img src="cartes/' + k + '.svg" alt=""></button>'; }).join("") +
      "</div></div>" +
      '<div class="act__fmt"><span class="act__lbl" id="' + uid + 'FmL">Format</span><div class="formats" role="radiogroup" aria-labelledby="' + uid + 'FmL">' +
      FORMATS.map(function (f, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" data-f="' + i + '"><b>' + f.n + "</b><span>" + f.f + "</span></button>"; }).join("") +
      "</div></div>" +
      "</div>" +
      '<div><div class="act__stage" aria-live="polite"></div><div class="act__cap"><span class="act__tip"></span><span class="act__file"></span></div></div>' +
      "</div>";
    var stage = $(".act__stage", host), tip = $(".act__tip", host), file = $(".act__file", host), fmtBox = $(".act__fmt", host);
    function render() {
      var o = byK[state.shop];
      fmtBox.hidden = state.ch !== "posters";
      if (state.ch === "posters") { var f = FORMATS[state.fmt]; stage.innerHTML = posterHTML(o, f.size); tip.textContent = f.tip; file.textContent = f.file; }
      else if (state.ch === "instagram") { stage.innerHTML = storyHTML(o); tip.textContent = "Publiez-la en story avec le sticker lien. Pas de QR code : sur un téléphone, on ne scanne pas son propre écran."; file.textContent = "Image 1080 × 1920"; }
      else { stage.innerHTML = chatHTML(o); tip.textContent = "Un texte prêt avec votre lien, à envoyer à vos habitués sur WhatsApp."; file.textContent = "Copier, coller, envoyer"; }
      if (uid === "page") renderScenes(o);
    }
    $$("[role=tab]", host).forEach(function (b) { b.addEventListener("click", function () { $$("[role=tab]", host).forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); }); state.ch = b.getAttribute("data-ch"); render(); }); });
    radio($(".shops", host), function (b) { state.shop = b.getAttribute("data-k"); render(); });
    radio($(".formats", host), function (b) { state.fmt = +b.getAttribute("data-f"); render(); });
    render();
  }
  // Coins mesurés de la carte vierge dans la photo de caisse, en % de l'image.
  var CAISSE = [[56.6, 32.3], [88.6, 33.1], [81.0, 74.6], [49.4, 71.6]];
  function homography(w0, h0, q) {
    function adj(m) { return [m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4], m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5], m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]]; }
    function mm(a, b) { var c = []; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) { var s = 0; for (var k = 0; k < 3; k++) s += a[3*i+k] * b[3*k+j]; c[3*i+j] = s; } return c; }
    function mv(m, v) { return [m[0]*v[0]+m[1]*v[1]+m[2]*v[2], m[3]*v[0]+m[4]*v[1]+m[5]*v[2], m[6]*v[0]+m[7]*v[1]+m[8]*v[2]]; }
    function b2p(x1, y1, x2, y2, x3, y3, x4, y4) { var m = [x1, x2, x3, y1, y2, y3, 1, 1, 1], v = mv(adj(m), [x4, y4, 1]); return mm(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]); }
    var s = b2p(0, 0, w0, 0, w0, h0, 0, h0), t = b2p(q[0][0], q[0][1], q[1][0], q[1][1], q[2][0], q[2][1], q[3][0], q[3][1]);
    var m = mm(t, adj(s)); for (var i = 0; i < 9; i++) m[i] /= m[8];
    return "matrix3d(" + [m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, m[8]].join(",") + ")";
  }
  function renderScenes(o) {
    var store = $("#sceneStore [data-pin]"), table = $("#sceneTable [data-pin]"), caisse = $("#sceneCaisse [data-pin]");
    if (store) store.innerHTML = posterHTML(o, "a4");
    if (table) table.innerHTML = posterHTML(o, "a5");
    if (caisse) { caisse.innerHTML = posterHTML(o, "a5"); warpCaisse(); }
  }
  function warpCaisse() {
    var sc = $("#sceneCaisse"); if (!sc) return; var p = $(".poster", sc); if (!p) return;
    var W = sc.clientWidth, H = sc.clientHeight; if (!W || !H) return;
    var pw = 340, ph = 340 * 1.414; p.style.width = pw + "px";
    p.style.transform = homography(pw, ph, CAISSE.map(function (c) { return [c[0] / 100 * W, c[1] / 100 * H]; }));
  }

  /* ---------------------------------------------------------------- atelier de l'accueil */
  var COLORS = ["#4A3226", "#111111", "#B4462A", "#1E3A8A", "#0B6B4F", "#C2185B", "#F2A81C", "#F7F1E5"];
  function initHomeStudio() {
    var box = $("#hsCard"); if (!box || box.dataset.ready) return; box.dataset.ready = "1";
    var st = kc("cafe-lumiere", { stamps: 6, rewards: 2, member: L.who.toUpperCase(), status: "ARGENT", fg: null, lb: null, goal: L.costs[0], points: Math.round(L.costs[0] * 0.6), reward: "−10 %" });
    var sw = $("#hsColors");
    sw.innerHTML = COLORS.map(function (c, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" aria-label="Couleur ' + c + '" data-c="' + c + '" style="--c:' + c + '"></button>'; }).join("");
    function draw() { box.innerHTML = cardHTML(st); }
    radio(sw, function (b) { st.bg = b.getAttribute("data-c"); draw(); });
    radio($("#hsModel"), function (b) { st.model = b.getAttribute("data-m"); draw(); });
    $("#hsName").addEventListener("input", function (e) { st.name = e.target.value.trim() || "Votre commerce"; draw(); });
    draw();
  }

  /* ---------------------------------------------------------------- atelier complet */
  var AT_COLORS = ["#111111", "#2B2F3A", "#1E3A8A", "#0E7490", "#047857", "#4D5B2A", "#4A3226", "#7A1F3D", "#B4462A", "#C2410C", "#F2A81C", "#F7F1E5"];
  var AT_PHOTOS = ["burger", "latte", "pizza-four", "croissants", "makis", "tacos", "table-dressee", "the", "salade-bowl", "pasta", "donut-rose"];
  var AT_LOGOS = ["smash-club", "cafe-lumiere", "pizzeria-nonna", "maison-brioche", "sakura-bento", "taco-loco", "crunchy-corner", "gelato-bella", "comptoir-anna", "atelier-braise", "green-bowl", "dar-atay", "sweet-ring", "casa-mojito", "pasta-fresca", "table-saphir"];
  function initAtelier() {
    var box = $("#atCard"); if (!box || box.dataset.ready) return; box.dataset.ready = "1";
    var st = { name: "Smash Club", bg: "#111111", logo: "cartes/smash-club.svg", strip: "img/photos/burger.jpg", posY: 50, dim: 0.3, model: "tampons", total: 8, stamps: 5, stamp: "🍔", points: Math.round(L.costs[0] * 0.6), goal: L.costs[0], reward: "−10 %", rewards: 1, member: L.who.toUpperCase(), status: "BRONZE", since: "2026" };
    function draw() { box.innerHTML = cardHTML(st); }
    var lg = $("#atLogos");
    lg.innerHTML = AT_LOGOS.map(function (k, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" aria-label="Logo ' + esc(byK[k].name) + '" data-l="cartes/' + k + '.svg"><img src="cartes/' + k + '.svg" alt=""></button>'; }).join("");
    radio(lg, function (b) { st.logo = b.getAttribute("data-l"); draw(); });
    var cs = $("#atColors");
    cs.innerHTML = AT_COLORS.map(function (c, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" aria-label="Couleur ' + c + '" data-c="' + c + '" style="--c:' + c + '"></button>'; }).join("");
    radio(cs, function (b) { st.bg = b.getAttribute("data-c"); draw(); });
    var ph = $("#atPhotos");
    ph.innerHTML = AT_PHOTOS.map(function (p, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" aria-label="Photo ' + p.replace(/-/g, " ") + '" data-p="img/photos/' + p + '.jpg" style="background-image:url(img/photos/' + p + '.jpg)"></button>'; }).join("") +
      '<button type="button" role="radio" aria-checked="false" data-p="">Aucune</button>';
    radio(ph, function (b) { st.strip = b.getAttribute("data-p") || null; draw(); });
    function file(input, cb) { input.addEventListener("change", function () { var f = input.files && input.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { cb(r.result); draw(); }; r.readAsDataURL(f); }); }
    file($("#atLogoFile"), function (u) { st.logo = u; $$("[role=radio]", lg).forEach(function (x) { x.setAttribute("aria-checked", "false"); }); });
    file($("#atPhotoFile"), function (u) { st.strip = u; $$("[role=radio]", ph).forEach(function (x) { x.setAttribute("aria-checked", "false"); }); });
    $("#atName").addEventListener("input", function (e) { st.name = e.target.value.trim() || "Votre commerce"; draw(); });
    $("#atPosY").addEventListener("input", function (e) { st.posY = +e.target.value; draw(); });
    $("#atDim").addEventListener("input", function (e) { st.dim = +e.target.value / 100; draw(); });
    $("#atStep").addEventListener("input", function (e) { st.total = +e.target.value; st.stamps = Math.min(st.stamps, st.total - 1); $("#atStepV").textContent = st.total; draw(); });
    $("#atEmoji").addEventListener("input", function (e) { st.stamp = e.target.value || "★"; draw(); });
    $("#atGoal").value = L.costs[0];
    $("#atGoal").addEventListener("input", function (e) { var v = parseInt(e.target.value.replace(/\D/g, ""), 10); if (v > 0) { st.goal = v; st.points = Math.round(v * 0.6); draw(); } });
    $("#atReward").addEventListener("input", function (e) { st.reward = e.target.value || "−10 %"; draw(); });
    radio($("#atModel"), function (b) { st.model = b.getAttribute("data-m"); $("#atStampsRow").hidden = st.model !== "tampons"; $("#atPointsRow").hidden = st.model === "tampons"; draw(); });
    draw();
  }

  /* ---------------------------------------------------------------- page Fidélisation */
  function initFidPage() {
    var lad = $("#fid2Ladder"); if (!lad || lad.dataset.ready) return; lad.dataset.ready = "1";
    var model = "tampons";
    var t = L.ticket, tk = $("#simTicket"); tk.min = t[0]; tk.max = t[1]; tk.value = t[2];
    function sim() {
      var v = +$("#simVisits").value, tv = +tk.value;
      $("#simVisitsV").textContent = v + " visite" + (v > 1 ? "s" : "") + " par mois";
      $("#simTicketV").textContent = tv + " " + L.cur;
      $("#simTicketF").hidden = model === "tampons";
      var visits = model === "tampons" ? 10 : Math.ceil(L.costs[0] / tv), months = visits / v;
      $("#simOut").innerHTML = "Première remise de −10 % après <b>" + visits + " passage" + (visits > 1 ? "s" : "") + "</b>, soit environ <b>" + (months < 1 ? "moins d'un mois" : months < 1.5 ? "un mois" : Math.round(months) + " mois") + "</b>.";
    }
    function draw() { lad.innerHTML = ladderHTML(model, 0); $("#tiers2").innerHTML = tiersHTML(model); reveal(); sim(); }
    radio($("#fid2Model"), function (b) { model = b.getAttribute("data-m"); draw(); });
    $("#simVisits").addEventListener("input", sim); tk.addEventListener("input", sim);
    $("#fpPoints").textContent = "Un point par " + L.unit + " dépensé, ou le taux que vous choisissez, plus un bonus par visite si vous voulez. Trois paliers de remise. Arrivé au dernier, le client repart au premier et garde ses récompenses.";
    draw();
    initAuto("#autoList2", 6, null);
  }

  /* ---------------------------------------------------------------- tarif */
  function initPlans() {
    $$("[data-plan]").forEach(function (box) {
      if (box.dataset.ready) return; box.dataset.ready = "1";
      box.innerHTML = '<div class="plan"><div class="seg" role="radiogroup" aria-label="Formule"><button type="button" role="radio" aria-checked="true" data-y="0">Mensuel</button><button type="button" role="radio" aria-checked="false" data-y="1">Annuel<span class="save">−25 %</span></button></div>' +
        '<div class="plan__amt"><b class="num"></b><span></span></div><p class="plan__eq"></p>' +
        "<ul><li>Carte Apple Wallet et Google Wallet</li><li>Tampons ou points, paliers et statuts</li><li>Offres automatiques et coupons</li><li>Jusqu'à 3 appareils et un mode caissier</li><li>Affiches, story et message d'activation</li></ul>" +
        '<a class="btn btn--main" href="#telecharger">Commencer l\'essai gratuit</a><p class="plan__fine">14 jours gratuits, puis résiliable à tout moment</p></div>';
      var amt = $(".plan__amt b", box), per = $(".plan__amt span", box), eq = $(".plan__eq", box);
      function set(y) { amt.textContent = y ? L.price.y : L.price.m; per.textContent = L.cur + (y ? " par an" : " par mois"); eq.textContent = y ? "Soit " + L.price.ym + " " + L.cur + " par mois, trois mois offerts" : "Sans engagement"; }
      radio($(".seg", box), function (b) { set(+b.getAttribute("data-y")); });
      set(0);
    });
  }

  /* ---------------------------------------------------------------- final */
  function initFinal() {
    var f = $("#finalCards"); if (!f || f.dataset.ready) return; f.dataset.ready = "1";
    f.innerHTML = [kc("taco-loco", { noqr: true }), kc("maison-brioche", { noqr: true }), kc("ramen-kaze", { noqr: true, goal: L.costs[0], points: Math.round(L.costs[0] * 0.7) })].map(cardHTML).join("");
  }

  /* ---------------------------------------------------------------- vidéos de la page L'application */
  function initVideos() {
    $$(".vframe").forEach(function (fig) {
      if (fig.dataset.ready) return; fig.dataset.ready = "1";
      var v = $("video", fig), b = $(".vplay", fig); if (!v) return;
      if ("IntersectionObserver" in w) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !REDUCE) v.play().catch(function () {}); else if (!e.isIntersecting) v.pause(); }); }, { threshold: 0.4 }).observe(fig);
      if (b) b.addEventListener("click", function () { v.muted = false; v.controls = true; v.play().catch(function () {}); b.hidden = true; });
    });
  }

  /* ---------------------------------------------------------------- apparitions */
  var rio = "IntersectionObserver" in w && !REDUCE ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); rio.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" }) : null;
  function reveal() { $$(".rv:not(.is-in)").forEach(function (el) { if (rio) rio.observe(el); else el.classList.add("is-in"); }); }

  /* ---------------------------------------------------------------- navigation */
  var ROUTES = ["application", "carte", "fidelisation", "activation", "tarifs", "nouveautes", "ameliorer", "conditions", "confidentialite"];
  var nav = $("#nav"), menuBtn = $(".nav__menu");
  function closeMenu() { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", function () { var o = !nav.classList.contains("is-open"); nav.classList.toggle("is-open", o); menuBtn.setAttribute("aria-expanded", String(o)); });
  $$(".sheet a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  function route() {
    var h = location.hash || "#/", m = /^#\/([a-z]+)/.exec(h), r = m && ROUTES.indexOf(m[1]) >= 0 ? m[1] : "home";
    var anchor = !m && h.length > 1 ? h.slice(1) : null;
    $$(".view").forEach(function (v) { v.classList.toggle("is-on", v.id === "view-" + r); });
    $$(".nav__links a").forEach(function (a) { if (a.getAttribute("data-r") === r) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    var view = $("#view-" + r); d.title = view.getAttribute("data-title") || "Keeply";
    closeMenu();
    if (r === "home") { initHero(); initGallery(); initHow(); initFid(); initAuto("#autoList", 4, "#autoNotif"); initHomeStudio(); initPlans(); initFinal(); }
    $$("[data-activation]", view).forEach(initActivation);
    if (r === "carte") initAtelier();
    if (r === "fidelisation") initFidPage();
    if (r === "activation") setTimeout(warpCaisse, 60);
    if (r === "tarifs") initPlans();
    if (r === "application") initVideos();
    reveal();
    if (anchor) { var t = d.getElementById(anchor); if (t) { setTimeout(function () { t.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth" }); }, 30); return; } }
    w.scrollTo(0, 0);
  }
  w.addEventListener("hashchange", route);
  w.addEventListener("resize", function () { clearTimeout(w.__kr); w.__kr = setTimeout(warpCaisse, 120); });

  var mbar = $("#mbar");
  function onScroll() {
    var y = w.scrollY; nav.classList.toggle("is-scrolled", y > 8);
    var onHome = $("#view-home").classList.contains("is-on"), dl = $("#telecharger");
    var nearEnd = dl && dl.getBoundingClientRect().top < w.innerHeight;
    mbar.classList.toggle("is-on", onHome && y > 560 && !nearEnd);
  }
  w.addEventListener("scroll", onScroll, { passive: true });

  applyLocale();
  route();
  onScroll();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(warpCaisse);
})();
