/* ============================================================
   KEEPLY v7 — mouvement sur téléphone (GSAP + ScrollTrigger) et
   atelier en mode application. Tout passe par gsap.matchMedia :
   rien ne s'applique au-dessus de 760 px, et le mouvement réduit
   n'obtient que des fondus.
   ============================================================ */
(function(){
  var d=document, body=d.body;
  var MQ="(max-width: 760px)";
  var isMobile=function(){ return window.matchMedia(MQ).matches; };
  var REDUCE=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- titres découpés en mots ---------- */
  function splitWords(el){
    if(el.dataset.split) return [].slice.call(el.querySelectorAll(".m-w>span"));
    el.dataset.split="1";
    var walk=function(node){
      [].slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var frag=d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(part){
            if(!part) return;
            if(/^\s+$/.test(part)){ frag.appendChild(d.createTextNode(part)); return; }
            var w=d.createElement("span"); w.className="m-w"; var i=d.createElement("span"); i.textContent=part; w.appendChild(i); frag.appendChild(w);
          });
          node.replaceChild(frag,n);
        } else if(n.nodeType===1 && !n.classList.contains("m-w")) walk(n);
      });
    };
    walk(el);
    return [].slice.call(el.querySelectorAll(".m-w>span"));
  }

  /* ---------- récit : légende synchronisée avec l'écran du téléphone ---------- */
  var cap=null;
  function initStoryCaption(){
    if(!isMobile()) return;
    var stage=d.querySelector(".k-story__phone"); if(!stage || stage.querySelector(".m-cap")) return;
    var steps=[].slice.call(d.querySelectorAll(".k-steps .k-step"));
    cap=d.createElement("div"); cap.className="m-cap"; cap.setAttribute("aria-live","polite");
    cap.innerHTML='<p class="m-cap__n"></p><h3></h3><p class="m-cap__p"></p>';
    stage.appendChild(cap);
    var n=cap.querySelector(".m-cap__n"), h=cap.querySelector("h3"), p=cap.querySelector(".m-cap__p"), cur=-1;
    function write(i){
      var s=steps[i]; if(!s) return;
      n.textContent=String(i+1).padStart(2,"0")+" / "+String(steps.length).padStart(2,"0");
      h.textContent=s.querySelector("h3").textContent; p.textContent=s.querySelector("p").textContent;
    }
    function show(i){
      if(i===cur) return; var first=cur<0; cur=i;
      if(first || REDUCE || !window.gsap){ write(i); return; }
      var dir=1;
      gsap.timeline({overwrite:true})
        .to([n,h,p],{y:-10*dir,opacity:0,filter:"blur(4px)",duration:.18,ease:"power2.in",stagger:.03})
        .add(function(){ write(i); })
        .fromTo([n,h,p],{y:14*dir,opacity:0,filter:"blur(6px)"},{y:0,opacity:1,filter:"blur(0px)",duration:.55,ease:"expo.out",stagger:.05});
    }
    // La hauteur de légende = la plus longue, pour que rien ne saute.
    var mh=0; steps.forEach(function(s,i){ write(i); mh=Math.max(mh,cap.offsetHeight); }); cap.style.setProperty("--caph",mh+"px");
    write(0); cur=0;
    var ticks=d.getElementById("kTicks");
    if(ticks && "MutationObserver" in window){
      new MutationObserver(function(){ var on=[].indexOf.call(ticks.children,ticks.querySelector(".is-on")); if(on>=0) show(on); }).observe(ticks,{subtree:true,attributes:true,attributeFilter:["class"]});
    }
  }
  function fitPhone(){
    var stage=d.querySelector(".k-story__phone"); if(!stage || !cap) return;
    var H=window.innerHeight-66, free=H-(cap.offsetHeight||130)-24-16-40;
    stage.style.setProperty("--pz",Math.max(.5,Math.min(.82,free/649)).toFixed(3));
  }

  /* ---------- atelier en application ---------- */
  var app=null;
  function initAtelier(){
    if(!isMobile()) return;
    var panel=d.querySelector("#view-carte .ka__panel"); if(!panel || app) return;
    var steps=panel.querySelector(".ka__steps"), groups=[].slice.call(panel.querySelectorAll(".ka__group")), cta=panel.querySelector(".ka__cta");
    if(!steps || !groups.length) return;
    app={panel:panel};
    // Une poignée pour tirer la feuille, et un conteneur qui défile seul.
    var grab=d.createElement("div"); grab.className="m-grab"; grab.setAttribute("aria-hidden","true");
    panel.insertBefore(grab,steps);
    var scroll=d.createElement("div"); scroll.className="m-scroll";
    groups.forEach(function(g){ scroll.appendChild(g); }); if(cta) scroll.appendChild(cta);
    panel.appendChild(scroll);
    var pill=d.createElement("span"); pill.className="m-pill"; pill.setAttribute("aria-hidden","true"); steps.insertBefore(pill,steps.firstChild);
    var tabs=[].slice.call(steps.querySelectorAll("a")), idx=0;
    tabs.forEach(function(a){ a.setAttribute("role","tab"); });
    function place(){ var a=tabs[idx]; pill.style.width=a.offsetWidth+"px"; pill.style.transform="translateX("+a.offsetLeft+"px)"; }
    function go(i,dir){
      if(i<0||i>=tabs.length) return;
      var prev=idx; idx=i;
      tabs.forEach(function(a,k){ a.classList.toggle("is-on",k===i); a.setAttribute("aria-selected",String(k===i)); });
      groups.forEach(function(g,k){ g.classList.toggle("m-on",k===i); });
      place(); tabs[i].scrollIntoView({block:"nearest",inline:"center",behavior:REDUCE?"auto":"smooth"});
      scroll.scrollTop=0;
      if(window.gsap && !REDUCE && prev!==i){
        var s=dir||(i>prev?1:-1);
        gsap.fromTo(groups[i],{x:40*s,opacity:0},{x:0,opacity:1,duration:.5,ease:"expo.out",clearProps:"transform,opacity"});
      }
    }
    // Les onglets changent de groupe sur téléphone au lieu de faire défiler la page.
    steps.addEventListener("click",function(e){
      if(!isMobile()) return;
      var a=e.target.closest("a"); if(!a) return;
      e.preventDefault(); e.stopImmediatePropagation(); go(tabs.indexOf(a));
    },true);
    // Glisser horizontalement sur les réglages : onglet suivant ou précédent.
    var sx=0, sy=0, tracking=false;
    scroll.addEventListener("touchstart",function(e){ var t=e.touches[0]; sx=t.clientX; sy=t.clientY; tracking=!e.target.closest('input[type="range"],.ka__photos,.ka__emojis,.ka__swatches'); },{passive:true});
    scroll.addEventListener("touchend",function(e){
      if(!tracking || !isMobile()) return; var t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
      if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.6) go(idx+(dx<0?1:-1));
    },{passive:true});
    // La feuille se tire vers le haut ou le bas ; elle se pose sur l'un de trois crans.
    var SNAP=[.42,.6,.82], cur=.6, startY=0, startH=0, lastY=0, lastT=0, v=0;
    function setSheet(f,animate){
      cur=f;
      if(window.gsap && animate && !REDUCE){ gsap.to(panel,{"--sheet":(f*100)+"%",duration:.5,ease:"expo.out",onUpdate:fit,onComplete:fit}); }
      else { panel.style.setProperty("--sheet",(f*100)+"%"); fit(); }
    }
    grab.addEventListener("pointerdown",function(e){
      grab.setPointerCapture(e.pointerId); startY=e.clientY; lastY=e.clientY; lastT=performance.now(); v=0;
      startH=panel.getBoundingClientRect().height/panel.parentNode.getBoundingClientRect().height;
      if(window.gsap) gsap.killTweensOf(panel);
    });
    grab.addEventListener("pointermove",function(e){
      if(!grab.hasPointerCapture(e.pointerId)) return;
      var now=performance.now(); v=(e.clientY-lastY)/Math.max(1,now-lastT)*1000; lastY=e.clientY; lastT=now;
      var total=panel.parentNode.getBoundingClientRect().height, f=startH-(e.clientY-startY)/total;
      // Au-delà des bornes, la feuille résiste au lieu de s'arrêter net.
      if(f>SNAP[2]) f=SNAP[2]+(f-SNAP[2])*.3; if(f<SNAP[0]) f=SNAP[0]-(SNAP[0]-f)*.3;
      panel.style.setProperty("--sheet",(f*100)+"%"); fit();
    });
    grab.addEventListener("pointerup",function(e){
      var total=panel.parentNode.getBoundingClientRect().height, now=panel.getBoundingClientRect().height/total;
      // Projection de l'élan, puis cran le plus proche (comme le défilement d'iOS).
      var projected=now-((v/1000)*.998/(1-.998))/total;
      var best=SNAP.reduce(function(a,b){ return Math.abs(b-projected)<Math.abs(a-projected)?b:a; });
      setSheet(best,true);
    });
    grab.addEventListener("dblclick",function(){ setSheet(cur>=.8?.6:.82,true); });
    // L'aperçu se met à l'échelle de la place qui reste.
    var card=d.getElementById("kaCard");
    function fit(){
      if(!isMobile() || !card) return;
      var stage=d.querySelector("#view-carte .ka__stagein"); if(!stage) return;
      var avail=stage.clientHeight-130, w=stage.clientWidth-32;
      card.style.zoom=1; var nat=card.firstElementChild ? card.firstElementChild.getBoundingClientRect() : {height:470,width:340};
      var natH=Math.max(nat.height,300), natW=Math.max(nat.width,300);
      var z=Math.max(.32,Math.min(1,avail/natH,w/natW));
      card.style.zoom=""; card.style.setProperty("--fit",z.toFixed(3));
    }
    app.fit=fit; app.place=place; app.go=go;
    go(0); setSheet(.6,false);
    window.addEventListener("resize",function(){ fit(); place(); });
    // Le rendu de la carte change de hauteur quand on règle : on recadre.
    if("ResizeObserver" in window && card){ var ro=new ResizeObserver(function(){ if(isMobile()) requestAnimationFrame(fit); }); ro.observe(card.firstElementChild||card); }
  }

  /* ---------- mouvement au défilement ---------- */
  var mm=null;
  function initMotion(){
    if(!window.gsap || !window.ScrollTrigger || mm) return;
    gsap.registerPlugin(ScrollTrigger);
    mm=gsap.matchMedia();
    mm.add({mobile:MQ, reduce:"(prefers-reduced-motion: reduce)"},function(ctx){
      if(!ctx.conditions.mobile) return;
      var reduce=ctx.conditions.reduce;

      // Titres : chaque mot monte de derrière sa ligne.
      gsap.utils.toArray("#view-home .k-h2, .pagehead h1, .view:not(#view-home) .sec-head h2, .kf-mech__txt h2, .kf-head h2, .kf-sim__txt h2, .kf-end__panel h2, .dl__card h2").forEach(function(h){
        var w=splitWords(h);
        if(reduce){ gsap.from(h,{opacity:0,duration:.6,scrollTrigger:{trigger:h,start:"top 88%",once:true}}); return; }
        gsap.fromTo(w,{yPercent:115,rotate:4},{yPercent:0,rotate:0,duration:1.05,ease:"expo.out",stagger:.055,scrollTrigger:{trigger:h,start:"top 88%",once:true}});
      });
      // Paragraphes et surtitres : fondu montant, par petits groupes.
      ScrollTrigger.batch("#view-home .eyebrow, #view-home .v6-split__sub, #view-home .k-gal__sub, #view-home .k-studio__sub, #view-home .k-price__sub, .pagehead .lead, .pagehead .eyebrow",{
        start:"top 90%", once:true,
        onEnter:function(els){ gsap.fromTo(els,{y:reduce?0:22,opacity:0},{y:0,opacity:1,duration:.9,ease:"expo.out",stagger:.08}); }
      });

      if(reduce) return;

      // Héros : les cartes se redressent face à vous au chargement, puis tout
      // le héros recule doucement quand on fait défiler, comme une page produit.
      var hero=d.querySelector(".v6-hero");
      if(hero){
        gsap.fromTo(".v6-hero .k-hero__stage",{"--hr":"34deg","--hs":.78,"--ho":0},{"--hr":"0deg","--hs":1,"--ho":1,duration:1.6,ease:"expo.out",delay:.35});
        gsap.to(".v6-hero .k-hero__grid",{scale:.9,opacity:.25,y:40,ease:"none",transformOrigin:"50% 30%",scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:true}});
        gsap.to(".v6-hero__vid",{scale:1.18,ease:"none",scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:true}});
      }

      // Galerie : les cartes arrivent de la droite, en cascade.
      var gal=d.querySelector(".m-gal");
      if(gal) gsap.from(gal.querySelectorAll(".m-gal__track .wp"),{x:140,opacity:0,rotate:3,duration:1.1,ease:"expo.out",stagger:.07,scrollTrigger:{trigger:gal,start:"top 85%",once:true}});

      // Fonctionnalités : chaque carte se pose sur la précédente, qui recule.
      var cells=gsap.utils.toArray("#view-home .k-bento .k-cell");
      cells.forEach(function(c,i){
        c.style.setProperty("--si",i);
        var next=cells[i+1]; if(!next) return;
        gsap.fromTo(c,{"--sk":1,"--sb":1},{"--sk":.9,"--sb":.78,ease:"none",scrollTrigger:{trigger:next,start:"top bottom",end:"top "+(84+(i+1)*10)+"px",scrub:true}});
      });

      // Atelier de l'accueil : la carte pivote face à vous en entrant.
      if(d.getElementById("kStudioTilt")) gsap.fromTo("#kStudioPass",{rotateY:-32,rotateX:14,scale:.86,y:30},{rotateY:0,rotateX:0,scale:1,y:0,ease:"none",scrollTrigger:{trigger:"#kStudioTilt",start:"top bottom",end:"center 60%",scrub:.6}});

      // Tarif : la carte monte, le prix compte jusqu'à sa valeur.
      var plan=d.querySelector("#view-home .k-plan");
      if(plan){
        gsap.fromTo(plan,{"--ps":.9},{"--ps":1,ease:"none",scrollTrigger:{trigger:plan,start:"top bottom",end:"top 45%",scrub:true}});
        ScrollTrigger.create({trigger:plan,start:"top 70%",once:true,onEnter:function(){
          var b=plan.querySelector("[data-plan-num]"); if(!b) return;
          var txt=b.textContent.trim(), dec=(txt.split(",")[1]||"").length, val=parseFloat(txt.replace(/\s/g,"").replace(",","."));
          if(!isFinite(val)) return;
          var o={v:0}; gsap.to(o,{v:val,duration:1.4,ease:"expo.out",onUpdate:function(){ b.textContent=o.v.toLocaleString("fr-FR",{minimumFractionDigits:dec,maximumFractionDigits:dec}); },onComplete:function(){ b.textContent=txt; }});
        }});
      }

      // Appel final : le panneau s'ouvre en grand.
      var fin=d.querySelector(".k-final__panel");
      if(fin) gsap.fromTo(fin,{"--fs":.86},{"--fs":1,ease:"none",scrollTrigger:{trigger:fin,start:"top bottom",end:"top 30%",scrub:true}});

      // Pages intérieures : chaque carte arrive avec un léger ressort, l'une après l'autre.
      ScrollTrigger.batch(".appstep, .kf-mech, .kf-sim__txt, .kf-sim__box, .kf-step, .kf-offers li, .kf-end__panel, .roaditem, .dl__card, .pricecard, .whatfor > div, .hb__list li, .pxctrl--row, .kform, .sec-head, .kf-head",{
        start:"top 92%", once:true,
        onEnter:function(els){ gsap.fromTo(els,{y:46,opacity:0,scale:.96},{y:0,opacity:1,scale:1,duration:1,ease:"expo.out",stagger:.08,clearProps:"transform"}); }
      });
      // Images et vidéos : elles s'ouvrent depuis le centre, l'image dedans se pose.
      gsap.utils.toArray(".appstep .vframe, .pxstage, .scene, .kf-mech__card").forEach(function(el){
        gsap.fromTo(el,{clipPath:"inset(9% 7% 9% 7% round 30px)"},{clipPath:"inset(0% 0% 0% 0% round 22px)",ease:"none",scrollTrigger:{trigger:el,start:"top 95%",end:"top 40%",scrub:.4}});
        var inner=el.querySelector("video, .scene__ph, .poster, .wp");
        if(inner) gsap.fromTo(inner,{scale:1.12},{scale:1,ease:"none",scrollTrigger:{trigger:el,start:"top 95%",end:"top 40%",scrub:.4}});
      });
      // Paliers Bronze, Argent, Or : ils montent comme des marches.
      gsap.utils.toArray(".kf-ladder").forEach(function(l){ gsap.from(l.children,{y:60,opacity:0,rotate:-2,duration:1.1,ease:"expo.out",stagger:.12,scrollTrigger:{trigger:l,start:"top 85%",once:true}}); });

      return function(){ d.querySelectorAll(".k-cell").forEach(function(c){ c.style.removeProperty("--sk"); c.style.removeProperty("--sb"); }); };
    });
  }

  /* ---------- carrousels de l'activation : points de position ---------- */
  function initDots(){
    if(!isMobile()) return;
    d.querySelectorAll(".pxstudio2, .pxscenes").forEach(function(c){
      if(c.dataset.dots) return; c.dataset.dots="1";
      var items=[].slice.call(c.children); if(items.length<2) return;
      var dots=d.createElement("div"); dots.className="m-dots"; dots.setAttribute("aria-hidden","true");
      dots.innerHTML=items.map(function(_,i){ return "<i"+(i?"":' class="on"')+"></i>"; }).join("");
      c.parentNode.insertBefore(dots,c.nextSibling);
      var raf=null;
      c.addEventListener("scroll",function(){ if(raf) return; raf=requestAnimationFrame(function(){ raf=null;
        var mid=c.scrollLeft+c.clientWidth/2, best=0, bd=1e9;
        items.forEach(function(it,i){ var dd=Math.abs(it.offsetLeft+it.offsetWidth/2-mid); if(dd<bd){bd=dd;best=i;} });
        [].forEach.call(dots.children,function(dt,i){ dt.classList.toggle("on",i===best); });
      }); },{passive:true});
    });
  }

  function onRoute(){
    initStoryCaption(); fitPhone(); initAtelier(); initDots();
    if(app && body.getAttribute("data-route")==="carte"){ setTimeout(function(){ app.fit(); app.place(); },60); }
    if(window.ScrollTrigger) setTimeout(function(){ ScrollTrigger.refresh(); },120);
  }
  function init(){ initMotion(); onRoute(); }
  window.addEventListener("resize",fitPhone);
  window.addEventListener("hashchange",function(){ setTimeout(onRoute,80); });
  if(d.readyState==="complete") init(); else window.addEventListener("load",init);
})();
