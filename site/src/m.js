/* ============================================================
   KEEPLY — expérience téléphone. Ne s'active que sous 760 px.
   Défilement lié image par image (rAF), propriétés individuelles
   scale / rotate / translate pour ne pas écraser les animations
   d'entrée existantes, qui pilotent `transform`.
   ============================================================ */
(function(){
  var d=document, body=d.body;
  var MQ=window.matchMedia("(max-width: 760px)");
  var REDUCE=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function clamp(v,a,b){ return v<a?a:v>b?b:v; }
  function ease(p){ return 1-Math.pow(1-p,3); }

  /* ---------- menu en feuille ---------- */
  var sheet, burger;
  function setMenu(open){
    if(!sheet) return;
    burger.setAttribute("aria-expanded",String(open));
    burger.setAttribute("aria-label",open?"Fermer le menu":"Ouvrir le menu");
    d.documentElement.classList.toggle("m-menu-open",open);
    if(open){ sheet.hidden=false; requestAnimationFrame(function(){ requestAnimationFrame(function(){ sheet.classList.add("is-open"); }); }); }
    else { sheet.classList.remove("is-open"); setTimeout(function(){ if(!sheet.classList.contains("is-open")) sheet.hidden=true; },REDUCE?0:450); }
  }
  function initSheet(){
    if(sheet) return;
    var navIn=d.querySelector(".nav__in"); if(!navIn) return;
    burger=d.createElement("button");
    burger.type="button"; burger.className="m-burger";
    burger.setAttribute("aria-label","Ouvrir le menu"); burger.setAttribute("aria-expanded","false"); burger.setAttribute("aria-controls","mSheet");
    burger.innerHTML="<i></i><i></i>";
    navIn.appendChild(burger);
    var links=[["#/application","L'application"],["#/carte","Créer sa carte"],["#/fidelisation","Fidélisation"],["#/activation","Activation"],["#/nouveautes","Nouveautés"],["#/tarifs","Tarifs"],["#/ameliorer","Améliorer Keeply"]];
    sheet=d.createElement("div"); sheet.id="mSheet"; sheet.className="m-sheet"; sheet.hidden=true;
    sheet.innerHTML='<nav aria-label="Menu"><ul>'+links.map(function(l,i){ return '<li style="--i:'+i+'"><a href="'+l[0]+'">'+l[1]+'</a></li>'; }).join("")+'</ul><a class="btn btn--primary m-sheet__cta" href="#/#telecharger">Essayer 14 jours gratuits</a></nav>';
    body.appendChild(sheet);
    burger.addEventListener("click",function(){ setMenu(burger.getAttribute("aria-expanded")!=="true"); });
    sheet.addEventListener("click",function(e){ if(e.target.closest("a")) setMenu(false); });
    d.addEventListener("keydown",function(e){ if(e.key==="Escape" && burger.getAttribute("aria-expanded")==="true"){ setMenu(false); burger.focus(); } });
    MQ.addEventListener("change",function(){ if(!MQ.matches) setMenu(false); });
  }

  /* ---------- barre d'action flottante ---------- */
  var cta;
  function initCta(){
    if(cta) return;
    cta=d.createElement("a"); cta.className="m-cta"; cta.href="#/#telecharger";
    cta.innerHTML='<span class="m-cta__logo" aria-hidden="true"></span><span class="m-cta__txt"><b>Keeply</b><small>14 jours gratuits, sans engagement</small></span><span class="m-cta__go">Essayer</span>';
    cta.setAttribute("aria-label","Essayer Keeply 14 jours gratuits");
    cta.tabIndex=-1;
    body.appendChild(cta);
  }

  /* ---------- galerie : carrousel à glisser ---------- */
  var gal, galTrack, galBar, galCards=[];
  function initGallery(){
    if(gal) return true;
    var host=d.getElementById("kGallery"); if(!host) return false;
    var rows=[].slice.call(host.querySelectorAll(".k-gal__track:not([aria-hidden])")).map(function(t){ return [].slice.call(t.querySelectorAll(".wp")); });
    if(!rows.length || !rows[0].length) return false;
    var cards=[], n=Math.max.apply(null,rows.map(function(r){ return r.length; }));
    for(var i=0;i<n;i++) rows.forEach(function(r){ if(r[i]) cards.push(r[i].cloneNode(true)); });
    gal=d.createElement("div"); gal.className="m-gal";
    gal.innerHTML='<div class="m-gal__track" tabindex="0" role="group" aria-label="Exemples de cartes, à faire glisser"></div><span class="m-gal__bar" aria-hidden="true"><i></i></span><p class="m-gal__hint">Faites glisser pour voir les autres cartes</p>';
    galTrack=gal.querySelector(".m-gal__track"); galBar=gal.querySelector(".m-gal__bar i");
    cards.forEach(function(c){ galTrack.appendChild(c); });
    galCards=cards;
    host.parentNode.insertBefore(gal,host.nextSibling);
    galTrack.addEventListener("scroll",request,{passive:true});
    // Démarre sur la deuxième carte : on voit tout de suite qu'il y en a de chaque côté.
    requestAnimationFrame(function(){ if(galCards[1]) galTrack.scrollLeft=galCards[1].offsetLeft-(galTrack.clientWidth-galCards[1].offsetWidth)/2; request(); });
    return true;
  }
  function paintGallery(){
    if(!galTrack || !gal.offsetParent) return;
    var mid=galTrack.scrollLeft+galTrack.clientWidth/2;
    galCards.forEach(function(c){
      var w=c.offsetWidth+14, dx=(c.offsetLeft+c.offsetWidth/2-mid)/w, a=clamp(Math.abs(dx),0,1.4);
      if(REDUCE){ c.style.opacity=String(1-.35*Math.min(a,1)); return; }
      c.style.scale=(1-.1*Math.min(a,1)).toFixed(4);
      c.style.rotate="y "+(clamp(-dx,-1.2,1.2)*14).toFixed(2)+"deg";
      c.style.opacity=(1-.4*Math.min(a,1)).toFixed(3);
    });
    var max=galTrack.scrollWidth-galTrack.clientWidth, frac=clamp(galTrack.clientWidth/galTrack.scrollWidth,.12,1);
    galBar.style.width=(frac*100)+"%";
    galBar.style.transform="translateX("+((max>0?galTrack.scrollLeft/max:0)*(1-frac)/frac*100).toFixed(2)+"%)";
  }

  /* ---------- éléments qui se redressent en entrant ---------- */
  var RISE="#view-home .k-hero__stage, #view-home .k-cell, #view-home .v6-panel, #view-home .k-plan, #view-home .k-final__panel";
  var risers=[];
  function collect(){ risers=[].slice.call(d.querySelectorAll(RISE)); }
  function clearRise(){ risers.forEach(function(el){ el.style.scale=""; el.style.rotate=""; el.style.translate=""; }); }
  function paintRise(vh){
    risers.forEach(function(el){
      var r=el.getBoundingClientRect();
      if(r.bottom<-40 || r.top>vh+40) return;
      var p=ease(clamp((vh-r.top)/(vh*.6),0,1));
      if(el.classList.contains("k-hero__stage")){
        el.style.rotate="x "+((1-p)*26).toFixed(2)+"deg";
        el.style.scale=(.84+.16*p).toFixed(4);
      } else {
        el.style.scale=(.9+.1*p).toFixed(4);
        el.style.translate="0 "+((1-p)*36).toFixed(1)+"px";
      }
    });
  }

  /* ---------- boucle d'affichage ---------- */
  var ticking=false, wasMobile=null;
  function request(){ if(!ticking){ ticking=true; requestAnimationFrame(frame); } }
  function frame(){
    ticking=false;
    var mobile=MQ.matches, vh=window.innerHeight||800, home=body.getAttribute("data-route")==="home";
    if(mobile!==wasMobile){ wasMobile=mobile; if(!mobile){ clearRise(); if(cta) cta.classList.remove("is-on"); } }
    if(!mobile) return;
    // (effets au défilement : voir keeply-motion)
    paintGallery();
    if(cta){
      var hero=d.querySelector(".v6-hero"), fin=d.getElementById("telecharger");
      var on=home && hero && hero.getBoundingClientRect().bottom<70 && (!fin || fin.getBoundingClientRect().top>vh*.8);
      if(!home && window.scrollY>500) on=true;
      // Pendant le récit épinglé, la barre laisserait la légende cachée : on la retire.
      var story=d.querySelector(".k-story__grid");
      if(on && story){ var sr=story.getBoundingClientRect(); if(sr.top<vh*.5 && sr.bottom>vh*.6) on=false; }
      cta.classList.toggle("is-on",!!on);
      cta.tabIndex=on?0:-1;
    }
  }

  function init(){
    initSheet(); initCta(); collect();
    if(!initGallery()) setTimeout(init,250);
    request();
  }
  window.addEventListener("scroll",request,{passive:true});
  window.addEventListener("resize",request);
  MQ.addEventListener("change",request);
  window.addEventListener("hashchange",function(){ setMenu(false); setTimeout(function(){ collect(); request(); },60); });
  if(d.readyState!=="loading") init(); else d.addEventListener("DOMContentLoaded",init);
})();
