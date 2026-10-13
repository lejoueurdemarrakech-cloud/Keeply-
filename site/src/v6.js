/* ============================================================
   KEEPLY v6 — vidéos d'ambiance, aimantation, inclinaisons.
   Tout reste décoratif : rien ne dépend de ces effets pour fonctionner.
   ============================================================ */
(function(){
  var d=document;
  var REDUCE=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE=window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Vidéos en boucle : lues seulement quand elles sont à l'écran, jamais en mouvement réduit. */
  var vio=null;
  function initLoops(){
    var vids=[].slice.call(d.querySelectorAll("video[data-loop]:not([data-ready])"));
    vids.forEach(function(v){
      v.setAttribute("data-ready","1"); v.muted=true; v.defaultMuted=true;
      if(REDUCE){ v.removeAttribute("autoplay"); v.pause(); }
    });
    if(REDUCE) return;
    if(!("IntersectionObserver" in window)){ vids.forEach(function(v){ var p=v.play(); if(p&&p.catch) p.catch(function(){}); }); return; }
    vio=vio||new IntersectionObserver(function(es){
      es.forEach(function(e){
        var v=e.target;
        if(e.isIntersecting){ if(v.preload==="none") v.preload="auto"; var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
        else v.pause();
      });
    },{threshold:.12});
    vids.forEach(function(v){ vio.observe(v); });
  }

  /* Boutons aimantés : suivent légèrement le pointeur, reviennent avec un ressort. */
  function initMagnets(){
    if(!FINE || REDUCE) return;
    d.querySelectorAll(".v6-mag:not([data-mag])").forEach(function(b){
      b.setAttribute("data-mag","1");
      b.addEventListener("pointermove",function(e){
        var r=b.getBoundingClientRect(), x=(e.clientX-r.left-r.width/2)*.18, y=(e.clientY-r.top-r.height/2)*.28;
        b.style.transition="transform .15s ease-out"; b.style.transform="translate("+x.toFixed(1)+"px,"+y.toFixed(1)+"px)";
      });
      b.addEventListener("pointerleave",function(){ b.style.transition="transform .6s cubic-bezier(.34,1.56,.64,1)"; b.style.transform=""; });
    });
  }

  /* Héros : halo qui suit le pointeur. */
  function initHeroSpot(){
    var h=d.querySelector(".v6-hero"); if(!h || h.dataset.spot || !FINE || REDUCE) return; h.dataset.spot="1";
    var raf=null, x=70, y=40;
    h.addEventListener("pointermove",function(e){
      var r=h.getBoundingClientRect(); x=(e.clientX-r.left)/r.width*100; y=(e.clientY-r.top)/r.height*100;
      if(!raf) raf=requestAnimationFrame(function(){ raf=null; h.style.setProperty("--hx",x.toFixed(1)+"%"); h.style.setProperty("--hy",y.toFixed(1)+"%"); });
    });
  }

  /* Atelier : la carte s'incline sous la souris, comme tenue en main. */
  function initTilt(){
    var t=d.getElementById("kStudioTilt"); if(!t || t.dataset.tilt || !FINE || REDUCE) return; t.dataset.tilt="1";
    var card=d.getElementById("kStudioPass"), zone=t.parentNode;
    zone.addEventListener("pointermove",function(e){
      var r=zone.getBoundingClientRect(), rx=((e.clientY-r.top)/r.height-.5)*-10, ry=((e.clientX-r.left)/r.width-.5)*14;
      card.style.transform="rotateX("+rx.toFixed(2)+"deg) rotateY("+ry.toFixed(2)+"deg)";
    });
    zone.addEventListener("pointerleave",function(){ card.style.transform=""; });
  }

  /* Cellules : position du pointeur pour la bordure lumineuse (toutes les cellules, y compris la nouvelle). */
  function initSpots(){
    if(!FINE || REDUCE) return;
    d.querySelectorAll("#view-home .k-cell:not([data-spot6])").forEach(function(c){
      c.setAttribute("data-spot6","1");
      c.addEventListener("pointermove",function(e){
        var r=c.getBoundingClientRect();
        c.style.setProperty("--mx",(e.clientX-r.left)+"px"); c.style.setProperty("--my",(e.clientY-r.top)+"px");
      });
    });
  }

  function init(){ initLoops(); initMagnets(); initHeroSpot(); initTilt(); initSpots(); }
  if(d.readyState!=="loading") init(); else d.addEventListener("DOMContentLoaded",init);
  window.addEventListener("hashchange",function(){ setTimeout(init,40); });
})();
