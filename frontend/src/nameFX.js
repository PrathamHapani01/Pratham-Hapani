/**
 * nameFX.js — crazy moving pixel elements around the hero name
 * -------------------------------------------------------------
 *   import { createNameFX } from './nameFX.js';
 *   const fx = createNameFX(hostEl, { theme: 'peach', onGlitch: () => {...} });
 *   fx.setTheme('blue');  fx.destroy();
 *
 * `hostEl` = a position:relative wrapper around the <h1> with ~32px padding, so the
 * effects have room to live around the letters. The canvas is pointer-events:none.
 *
 * What moves:
 *  - 3 golden crystals (Ali's ears!) orbiting the name, passing in front and behind
 *  - 14+ floating code glyphs  { } < > / ; = 0 1 # * + ?  drifting up, REPELLED by the cursor
 *  - twinkling sparkles, spinning coins, lightning bolts that glitch the name
 *  - a rocket with a pixel trail that crosses every ~9s
 *  - click the name area = confetti + coin burst
 */

export const FX_PX = 4; // CSS pixels per logical pixel

export const FX_PALETTES = {
  peach: { ink: '#2E2A2A', a1: '#F26A38', a2: '#C94E22', hl: '#F5C842', cream: '#FDEFD6', cy: '#19D5FF' },
  blue: { ink: '#16206B', a1: '#5C8DFF', a2: '#2C41B0', hl: '#FFD84D', cream: '#EAF3FF', cy: '#8FE3FF' },
};
const GOLD = { o: '#5B1A0C', a: '#FFD35A', b: '#F5A81F', c: '#E08A1A', d: '#C4601A', h: '#FFE8A3' };

const FONT = {
  '{': ['.##', '.#.', '##.', '.#.', '.##'], '}': ['##.', '.#.', '.##', '.#.', '##.'],
  '<': ['..#', '.#.', '#..', '.#.', '..#'], '>': ['#..', '.#.', '..#', '.#.', '#..'],
  '/': ['..#', '..#', '.#.', '#..', '#..'], ';': ['...', '.#.', '...', '.#.', '#..'],
  '=': ['...', '###', '...', '###', '...'], '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'], '#': ['#.#', '###', '#.#', '###', '#.#'],
  '*': ['...', '#.#', '.#.', '#.#', '...'], '+': ['...', '.#.', '###', '.#.', '...'],
  '?': ['##.', '..#', '.#.', '...', '.#.'],
};
const GLYPHS = Object.keys(FONT);
const GEM = ['..ooo..', '.ohaao.', 'oabdbco', 'obbdcco', '.obdco.', '..ooo..'];

const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
const rnd = (n) => { const s = Math.sin(n * 91.7 + 13.1) * 43758.5453; return s - Math.floor(s); };

function glyph(c, ch, x, y, col, s = 1) {
  FONT[ch].forEach((row, j) => { for (let i = 0; i < 3; i++) if (row[i] === '#') R(c, x + i * s, y + j * s, s, s, col); });
}
function gem(c, x, y, alpha = 1) {
  c.globalAlpha = alpha;
  GEM.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const col = GOLD[row[i]]; if (col) R(c, x + i, y + j, 1, 1, col); } });
  c.globalAlpha = 1;
}
function coin(c, x, y, k, P) {
  const w = [6, 4, 2, 4][k % 4];
  const ox = (6 - w) / 2;
  R(c, x + ox - 1, y - 1, w + 2, 8, P.ink); R(c, x + ox, y, w, 6, P.hl);
  if (w > 2) R(c, x + ox + 1, y + 1, 1, 4, P.cream);
}

function init(S, W, H) {
  S.W = W; S.H = H;
  const n = Math.max(10, Math.min(26, Math.floor((W * H) / 420)));
  S.parts = Array.from({ length: n }, (_, i) => ({
    ch: GLYPHS[i % GLYPHS.length], x: rnd(i + 1) * W, y: rnd(i + 50) * H,
    vx: (rnd(i + 90) - 0.5) * 2, vy: -(3 + rnd(i + 130) * 6), col: ['a1', 'hl', 'ink', 'cy', 'a2'][i % 5], s: i % 4 === 0 ? 2 : 1, ph: rnd(i + 7) * 6,
  }));
  S.nextBolt = 3; S.nextRocket = 4; S.bolt = null; S.rocket = null; S.bursts = []; S.last = 0;
}

export function drawFX(c, t, S, P, W, H) {
  if (S.W !== W || S.H !== H || !S.parts) init(S, W, H);
  const dt = Math.min(0.1, t - (S.last || t)); S.last = t;
  c.clearRect(0, 0, W, H);

  // sparkles
  for (let i = 0; i < 12; i++) {
    const x = Math.floor(rnd(i + 300) * (W - 3)), y = Math.floor(rnd(i + 400) * (H - 3));
    if (Math.floor(t * 3 + i * 1.7) % 4 < 2) { R(c, x + 1, y, 1, 3, P.cream); R(c, x, y + 1, 3, 1, P.cream); R(c, x + 1, y + 1, 1, 1, P.hl); }
  }

  // floating glyphs (with cursor repulsion)
  S.parts.forEach((p) => {
    p.x += (p.vx + Math.sin(t * 1.3 + p.ph) * 1.2) * dt;
    p.y += p.vy * dt;
    if (S.inside) {
      const dx = p.x - S.mx, dy = p.y - S.my, d = Math.hypot(dx, dy);
      if (d < 18 && d > 0.01) { p.x += (dx / d) * (18 - d) * 6 * dt; p.y += (dy / d) * (18 - d) * 6 * dt; }
    }
    if (p.y < -6) { p.y = H + 4; p.x = rnd(p.ph * 100 + t) * W; }
    if (p.x < -6) p.x = W + 2; if (p.x > W + 6) p.x = -2;
    c.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(t * 1.5 + p.ph));
    glyph(c, p.ch, p.x, p.y, P[p.col], p.s);
  });
  c.globalAlpha = 1;

  // orbiting gold crystals: behind (dim) then front (full)
  const cx = W / 2, cy = H / 2, rx = W / 2 - 8, ry = H / 2 - 6;
  const gems = [0, 1, 2].map((k) => { const a = t * 0.55 + k * 2.094; return { a, x: cx + Math.cos(a) * rx - 3, y: cy + Math.sin(a) * ry - 3 + Math.sin(t * 3 + k) * 1.5 }; });
  gems.filter((g) => Math.sin(g.a) < 0).forEach((g) => gem(c, Math.round(g.x), Math.round(g.y), 0.5));
  gems.filter((g) => Math.sin(g.a) >= 0).forEach((g) => gem(c, Math.round(g.x), Math.round(g.y), 1));

  // spinning coins on the right edge
  for (let k = 0; k < 3; k++) coin(c, W - 8 - (k % 2) * 6, 4 + k * 12 + Math.round(Math.sin(t * 2 + k) * 2), Math.floor(t * 6 + k), P);

  // lightning
  if (t > S.nextBolt && !S.bolt) {
    const pts = []; let x = 6 + Math.floor(rnd(Math.floor(t * 10)) * (W - 12));
    for (let y = 0; y < H; y += 3) { pts.push([x, y]); x += Math.floor(rnd(y + t) * 5) - 2; }
    S.bolt = { until: t + 0.3, pts }; S.nextBolt = t + 5 + rnd(t) * 5;
    S.onGlitch && S.onGlitch();
  }
  if (S.bolt) {
    if (t > S.bolt.until) S.bolt = null;
    else {
      const pts = S.bolt.pts;
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
        R(c, x0 - 1, y0, 3, 3, P.hl); R(c, x1, y1, 1, 3, P.cream); R(c, x0, y0, 1, 3, P.cream);
      }
    }
  }

  // rocket
  if (t > S.nextRocket && !S.rocket) { S.rocket = { t0: t, y0: 6 + rnd(t) * (H - 22), dur: 2.4 }; S.nextRocket = t + 9 + rnd(t * 3) * 4; }
  if (S.rocket) {
    const p = (t - S.rocket.t0) / S.rocket.dur;
    if (p > 1) S.rocket = null;
    else {
      const pos = (q) => [-14 + q * (W + 28), S.rocket.y0 + Math.sin(q * 7) * 3];
      for (let i = 6; i >= 1; i--) { const [tx, ty] = pos(Math.max(0, p - i * 0.012)); c.globalAlpha = 1 - i / 7; R(c, tx - 4, ty + 2, 2, 2, i % 2 ? P.hl : P.a1); }
      c.globalAlpha = 1;
      const [x, y] = pos(p);
      R(c, x - 1, y - 1, 10, 7, P.ink); R(c, x, y, 6, 5, P.cream); R(c, x + 6, y + 1, 2, 3, P.a1); R(c, x + 8, y + 2, 1, 1, P.a1);
      R(c, x, y - 1, 2, 1, P.a2); R(c, x, y + 5, 2, 1, P.a2); R(c, x + 3, y + 2, 1, 1, P.cy);
      R(c, x - 3, y + 2, 3 - (Math.floor(t * 12) % 2), 1, P.hl);
    }
  }

  // click bursts (confetti + coins)
  S.bursts = S.bursts.filter((b) => t - b.born < 1.3);
  S.bursts.forEach((b) => {
    const a = t - b.born;
    c.globalAlpha = 1 - a / 1.3;
    if (b.coin) coin(c, b.x + b.vx * a, b.y + b.vy * a + 14 * a * a, Math.floor(t * 8), P);
    else R(c, b.x + b.vx * a, b.y + b.vy * a + 22 * a * a, 2, 2, P[b.col]);
  });
  c.globalAlpha = 1;
}

export function createNameFX(host, opts = {}) {
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', imageRendering: 'pixelated', zIndex: 2 });
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const c = canvas.getContext('2d');
  let P = FX_PALETTES[opts.theme || 'peach'];
  const S = { mx: 0, my: 0, inside: false, onGlitch: opts.onGlitch };
  const reduced = opts.reduced ?? (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let W = 0, H = 0, raf = 0, last = 0, visible = true;
  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;

  const size = () => {
    W = Math.max(40, Math.floor(host.clientWidth / FX_PX)); H = Math.max(24, Math.floor(host.clientHeight / FX_PX));
    canvas.width = W; canvas.height = H; c.imageSmoothingEnabled = false;
    if (reduced) drawFX(c, 5, S, P, W, H);
  };
  const ro = new ResizeObserver(size); ro.observe(host); size();

  const pos = (e) => { const r = host.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; };
  const move = (e) => { const [x, y] = pos(e); S.mx = x; S.my = y; S.inside = true; };
  const leave = () => { S.inside = false; };
  const click = (e) => {
    const [x, y] = pos(e), t = now();
    for (let i = 0; i < 26; i++) S.bursts.push({ x, y, vx: (rnd(i + t) - 0.5) * 60, vy: -rnd(i * 3 + t) * 40, col: ['a1', 'hl', 'cy', 'cream', 'a2'][i % 5], born: t });
    for (let i = 0; i < 3; i++) S.bursts.push({ x, y, vx: (i - 1) * 18, vy: -26, coin: true, born: t });
  };
  host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave); host.addEventListener('click', click);

  const frame = (ms) => {
    raf = requestAnimationFrame(frame);
    if (!visible || ms - last < 33) return;
    last = ms; drawFX(c, now(), S, P, W, H);
  };
  if (!reduced) raf = requestAnimationFrame(frame);
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }); io.observe(host);

  return {
    setTheme(n) { P = FX_PALETTES[n] || P; },
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); host.removeEventListener('click', click);
      canvas.remove();
    },
  };
}
