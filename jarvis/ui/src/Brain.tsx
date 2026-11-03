import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

/* ============================================================
   Le cerveau d'étoiles : ~5 000 étoiles disposées en cerveau
   (deux hémisphères plissés, cervelet, tronc), reliées comme des
   neurones, avec des influx lumineux qui courent le long des
   liaisons. Il respire au repos, s'allume quand on parle,
   bouillonne quand Jarvis réfléchit.
   focus() : la caméra plonge vers une étoile (avant d'afficher
   une info) et renvoie sa position à l'écran pour l'ouverture.
   ============================================================ */

export type Mode = "idle" | "listen" | "think" | "speak";
export interface BrainHandle {
  focus: (seed: string) => { x: number; y: number };
  unfocus: () => void;
}
interface Props {
  mode: Mode;
  level: () => number; // niveau sonore 0..1 (voix ou micro)
  accent: string; // "r g b"
}

const N = 7200;
const rand = (() => {
  let s = 1234567;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
})();

function brainPoint(): [number, number, number, number] {
  const r = rand();
  if (r < 0.06) {
    // cervelet : petite boule plissée à l'arrière, en bas
    const u = rand() * Math.PI * 2, v = Math.acos(2 * rand() - 1), k = 0.85 + rand() * 0.15;
    return [Math.sin(v) * Math.cos(u) * 0.55 * k, -0.62 + Math.cos(v) * 0.28 * k, -0.78 + Math.sin(v) * Math.sin(u) * 0.38 * k, 0.6];
  }
  if (r < 0.085) {
    // tronc cérébral
    const t = rand();
    return [(rand() - 0.5) * 0.16, -0.5 - t * 0.55, -0.35 + t * 0.1 + (rand() - 0.5) * 0.12, 0.5];
  }
  // hémisphères : demi-ellipsoïdes séparés par la scissure, surface plissée
  const side = rand() < 0.5 ? -1 : 1;
  const u = rand() * Math.PI * 2, v = Math.acos(2 * rand() - 1);
  let x = Math.sin(v) * Math.cos(u), y = Math.cos(v), z = Math.sin(v) * Math.sin(u);
  x = Math.abs(x);
  const shell = rand() < 0.78 ? 0.93 + rand() * 0.07 : 0.35 + rand() * 0.55;
  const fold = 1 + 0.055 * Math.sin(9 * v + 3 * side) * Math.cos(7 * u) + 0.035 * Math.sin(17 * u + 5 * v);
  const k = shell * fold;
  const px = side * (0.06 + x * 0.78 * k);
  let py = y * 0.72 * k + 0.08;
  const pz = z * 1.05 * k;
  if (py < -0.42) py = -0.42 + (py + 0.42) * 0.35; // base aplatie
  return [px, py, pz, shell > 0.9 ? 1 : 0.55];
}

const VERT = /* glsl */ `
  attribute float aSize; attribute float aPhase; attribute vec3 aColor;
  uniform float uTime; uniform float uLevel; uniform float uAct; uniform float uFocus; uniform vec3 uFocusPos;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 0.6 + 0.4 * sin(uTime * (1.3 + aPhase * 2.0) + aPhase * 40.0);
    float wave = 0.5 + 0.5 * sin(uTime * 2.2 - length(position) * 6.0);
    float glow = tw * (1.05 + uLevel * 1.1 + uAct * 0.6 * wave);
    float near = 1.0 - smoothstep(0.0, 0.5, distance(position, uFocusPos));
    vColor = aColor * glow + vec3(near * uFocus * 1.2);
    vAlpha = mix(1.0, 0.25 + near, uFocus * 0.85);
    gl_PointSize = min(aSize * (1.0 + uLevel * 0.6 + near * uFocus * 3.0) * (520.0 / -mv.z), 28.0);
    gl_Position = projectionMatrix * mv;
  }`;
const FRAG = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5; float d = length(c);
    if (d > 0.5) discard; float core = 1.0 - smoothstep(0.0, 0.22, d); float halo = (1.0 - smoothstep(0.1, 0.5, d)) * 0.45;
    gl_FragColor = vec4(vColor, (core * core + halo) * vAlpha);
  }`;

export const Brain = forwardRef<BrainHandle, Props>(function Brain({ mode, level, accent }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<BrainHandle | null>(null);
  const modeRef = useRef(mode);
  const levelRef = useRef(level);
  const accentRef = useRef(accent);
  modeRef.current = mode;
  levelRef.current = level;
  accentRef.current = accent;
  useImperativeHandle(ref, () => ({ focus: (s) => api.current!.focus(s), unfocus: () => api.current?.unfocus() }), []);

  useEffect(() => {
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, 0.01, 200);
    const HOME = new THREE.Vector3(0, -0.06, 3.7);
    camera.position.copy(HOME);

    /* --- texture ronde et douce pour les points simples --- */
    const dotTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.25, "rgba(255,255,255,0.85)");
      grd.addColorStop(0.6, "rgba(255,255,255,0.18)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();

    /* --- ciel lointain --- */
    const far = new THREE.BufferGeometry();
    const fp = new Float32Array(3600 * 3);
    for (let i = 0; i < 3600; i++) {
      const u = rand() * Math.PI * 2, v = Math.acos(2 * rand() - 1), r = 25 + rand() * 40;
      fp.set([Math.sin(v) * Math.cos(u) * r, Math.cos(v) * r, Math.sin(v) * Math.sin(u) * r], i * 3);
    }
    far.setAttribute("position", new THREE.BufferAttribute(fp, 3));
    const farMat = new THREE.PointsMaterial({ map: dotTex, size: 0.16, color: 0xbfd6ff, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
    const sky = new THREE.Points(far, farMat);
    scene.add(sky);

    /* --- le cerveau --- */
    const brain = new THREE.Group();
    scene.add(brain);
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N), phase = new Float32Array(N);
    const pts: THREE.Vector3[] = [];
    const cA = new THREE.Color(), cB = new THREE.Color(), cW = new THREE.Color(1, 1, 1);
    const setPalette = () => {
      const [r, g, b] = accentRef.current.split(" ").map((x) => Number(x) / 255);
      cA.setRGB(r, g, b);
      cB.setRGB(0.62, 0.48, 1);
    };
    setPalette();
    for (let i = 0; i < N; i++) {
      const [x, y, z, w] = brainPoint();
      pts.push(new THREE.Vector3(x, y, z));
      pos.set([x, y, z], i * 3);
      const mix = THREE.MathUtils.clamp(0.5 + z * 0.4 + y * 0.25, 0, 1);
      const c = cA.clone().lerp(cB, mix);
      if (rand() < 0.05) c.lerp(cW, 0.7);
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = (0.018 + rand() * 0.03) * (w > 0.9 ? 1 : 0.8) * (rand() < 0.03 ? 2.4 : 1);
      phase[i] = rand();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    const uniforms = { uTime: { value: 0 }, uLevel: { value: 0 }, uAct: { value: 0 }, uFocus: { value: 0 }, uFocusPos: { value: new THREE.Vector3(9, 9, 9) } };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    brain.add(new THREE.Points(geo, mat));

    /* --- liaisons neuronales (voisins proches, grille spatiale) --- */
    const cell = 0.16;
    const grid = new Map<string, number[]>();
    const key = (v: THREE.Vector3) => `${Math.floor(v.x / cell)},${Math.floor(v.y / cell)},${Math.floor(v.z / cell)}`;
    pts.forEach((p, i) => (grid.get(key(p)) ?? grid.set(key(p), []).get(key(p))!).push(i));
    const edges: [number, number][] = [];
    for (let i = 0; i < N; i += 2) {
      const p = pts[i];
      const [gx, gy, gz] = [Math.floor(p.x / cell), Math.floor(p.y / cell), Math.floor(p.z / cell)];
      let added = 0;
      for (let dx = -1; dx <= 1 && added < 2; dx++)
        for (let dy = -1; dy <= 1 && added < 2; dy++)
          for (let dz = -1; dz <= 1 && added < 2; dz++)
            for (const j of grid.get(`${gx + dx},${gy + dy},${gz + dz}`) || []) {
              if (j <= i || added >= 2) continue;
              const d = p.distanceTo(pts[j]);
              if (d > 0.05 && d < 0.17 && rand() < 0.5) (edges.push([i, j]), added++);
            }
    }
    const lp = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], k) => lp.set([pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z], k * 6));
    const lgeo = new THREE.BufferGeometry();
    lgeo.setAttribute("position", new THREE.BufferAttribute(lp, 3));
    const lmat = new THREE.LineBasicMaterial({ color: cA.clone().lerp(cB, 0.5), transparent: true, opacity: 0.11, depthWrite: false, blending: THREE.AdditiveBlending });
    brain.add(new THREE.LineSegments(lgeo, lmat));

    /* --- influx : des points lumineux qui parcourent les liaisons --- */
    const P = 260;
    const sp = new Float32Array(P * 3);
    const sparks = Array.from({ length: P }, () => ({ e: Math.floor(rand() * edges.length), t: rand(), v: 0.6 + rand() * 1.6 }));
    const sgeo = new THREE.BufferGeometry();
    sgeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    const smat = new THREE.PointsMaterial({ map: dotTex, size: 0.07, color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
    brain.add(new THREE.Points(sgeo, smat));

    /* --- halo central --- */
    const halo = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      grd.addColorStop(0, "rgba(255,255,255,0.55)");
      grd.addColorStop(0.35, "rgba(255,255,255,0.12)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 256, 256);
      const m = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), color: cA, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 });
      const s = new THREE.Sprite(m);
      s.scale.set(4.2, 4.2, 1);
      return s;
    })();
    scene.add(halo);

    /* --- caméra : zoom vers une étoile --- */
    let target: THREE.Vector3 | null = null;
    let focusK = 0;
    const lookAt = new THREE.Vector3();
    const camGoal = HOME.clone();
    api.current = {
      focus(seed) {
        let h = 0;
        for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
        // une étoile de surface, du côté visible
        let idx = h % N;
        for (let k = 0; k < 400; k++) {
          const p = pts[(idx + k * 97) % N];
          const w = p.clone().applyMatrix4(brain.matrixWorld);
          if (w.z > 0.35 && p.length() > 0.6) {
            idx = (idx + k * 97) % N;
            break;
          }
        }
        target = pts[idx].clone();
        uniforms.uFocusPos.value.copy(target);
        const world = target.clone().applyMatrix4(brain.matrixWorld);
        const dir = world.clone().sub(camera.position).normalize();
        camGoal.copy(world).sub(dir.multiplyScalar(1.25));
        const sc = world.clone().project(camera);
        return { x: ((sc.x + 1) / 2) * el.clientWidth, y: ((1 - sc.y) / 2) * el.clientHeight };
      },
      unfocus() {
        target = null;
        camGoal.copy(HOME);
      },
    };

    /* --- souris : léger parallaxe --- */
    const mouse = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove);
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let last = performance.now();
    let act = 0, lev = 0, rot = 0, lastAccent = accentRef.current;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const m = modeRef.current;
      const want = m === "think" ? 1 : m === "speak" ? 0.55 : m === "listen" ? 0.35 : 0.08;
      act += (want - act) * Math.min(1, dt * 3);
      lev += ((levelRef.current?.() ?? 0) - lev) * Math.min(1, dt * 12);
      if (accentRef.current !== lastAccent) {
        lastAccent = accentRef.current;
        setPalette();
        lmat.color.copy(cA.clone().lerp(cB, 0.5));
        (halo.material as THREE.SpriteMaterial).color.copy(cA);
      }
      uniforms.uTime.value = now / 1000;
      uniforms.uLevel.value = lev;
      uniforms.uAct.value = act;
      focusK += ((target ? 1 : 0) - focusK) * Math.min(1, dt * 3.2);
      uniforms.uFocus.value = focusK;
      // rotation lente (plus vive quand il réfléchit), figée pendant un zoom
      rot += dt * (0.12 + act * 0.35) * (1 - focusK);
      // de profil, il oscille lentement vers les trois quarts (un cerveau se reconnaît de côté)
      brain.rotation.y = -1.25 + Math.sin(rot) * 0.55 + mouse.x * 0.25 * (1 - focusK);
      brain.rotation.x = 0.12 + mouse.y * 0.12 * (1 - focusK);
      const breathe = 1 + Math.sin(now / 1600) * 0.012 + lev * 0.05;
      brain.scale.setScalar(breathe);
      sky.rotation.y += dt * 0.004;
      // influx
      const speed = 0.4 + act * 2.4 + lev * 1.5;
      for (let i = 0; i < P; i++) {
        const s = sparks[i];
        s.t += dt * s.v * speed;
        if (s.t > 1) {
          s.t = 0;
          s.e = Math.floor(rand() * edges.length);
        }
        const [a, b] = edges[s.e];
        const pa = pts[a], pb = pts[b];
        sp.set([pa.x + (pb.x - pa.x) * s.t, pa.y + (pb.y - pa.y) * s.t, pa.z + (pb.z - pa.z) * s.t], i * 3);
      }
      sgeo.attributes.position.needsUpdate = true;
      smat.opacity = 0.35 + act * 0.6;
      lmat.opacity = 0.08 + act * 0.1 + lev * 0.08;
      (halo.material as THREE.SpriteMaterial).opacity = 0.18 + act * 0.25 + lev * 0.35;
      // caméra
      camera.position.lerp(camGoal, Math.min(1, dt * 3.4));
      lookAt.lerp(target ? target.clone().applyMatrix4(brain.matrixWorld) : new THREE.Vector3(0, 0, 0), Math.min(1, dt * 3.4));
      camera.lookAt(lookAt);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={host} className="brain" aria-hidden />;
});
