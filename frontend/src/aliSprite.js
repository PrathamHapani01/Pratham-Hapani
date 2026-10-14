/**
 * aliSprite.js — Ali, the golden orb robot with floating crystal ears (32x40 logical px)
 * ------------------------------------------------------------------------------------
 * Drawn 100% in code (no image needed), matching the reference: golden metal sphere,
 * black visor with glowing cyan eyes + smile, side ear-cup, two floating gold crystals.
 *
 *   import { createAli, drawAli } from './aliSprite.js';
 *   const ali = createAli(canvasEl);      // self-animating (launcher icon, bubble avatar, roaming mascot)
 *   ali.setState('talk');                 // idle|walk|talk|think|surprised|happy|sleep|dance
 *   ali.setDir(1);                        // -1 = faces left (default), 1 = faces right
 *   ali.destroy();
 *
 * Or draw it yourself every frame:  drawAli(ctx, x, y, { state, dir, t })
 * Display the canvas at an integer scale (3x or 4x) with image-rendering: pixelated.
 */

export const ALI_W = 32;
export const ALI_H = 40;

const C = {
  o: '#5B1A0C', hi: '#FFE8A3', a: '#FFD35A', b: '#F5A81F', m: '#E08A1A', s: '#C4601A', d: '#9A3F14',
  k: '#08080C', cy: '#19D5FF', cyd: '#0E8FB5', w: '#FFFFFF',
};

const GEM_L = [
  '...oooo...',
  '..ohhaao..',
  '.ohaabbbo.',
  'ohaabdbbco',
  'oaabdbbcco',
  'obbbdbccdo',
  '.obbdccdo.',
  '..obdddo..',
  '...oooo...',
];
const GEM_R = GEM_L.map((r) => r.split('').reverse().join(''));
const GEM_MAP = { o: C.o, a: C.a, b: C.b, c: C.m, d: C.s, h: C.hi };

const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };

function sprite(c, rows, x, y) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const col = GEM_MAP[row[i]];
      if (col) R(c, x + i, y + j, 1, 1, col);
    }
  });
}

function drawBody(c, oy) {
  const cx = 16, cy = 22 + oy, r = 11;
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = 5; x <= 27; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > r) continue;
      if (d > r - 1.05) { R(c, x, y, 1, 1, C.o); continue; }
      let l = (-dx * 0.55 - dy * 0.8) / r + (((x + y) & 1) ? 0.05 : -0.05);
      let col = l > 0.55 ? C.hi : l > 0.2 ? C.a : l > -0.25 ? C.b : l > -0.6 ? C.m : C.s;
      if (d > r - 2.1 && l < -0.4) col = C.d;
      R(c, x, y, 1, 1, col);
    }
  }
  // cracks + rivets (like the reference)
  [[19, 12], [20, 13], [21, 14], [21, 15], [22, 16]].forEach(([x, y]) => R(c, x, y + oy, 1, 1, C.m));
  [[8, 13], [9, 12]].forEach(([x, y]) => R(c, x, y + oy, 1, 1, C.s));
  R(c, 10, 30 + oy, 1, 1, C.d); R(c, 22, 29 + oy, 1, 1, C.d);
  R(c, 20, 11 + oy, 1, 1, C.hi); R(c, 12, 12 + oy, 1, 1, C.hi);
}

function drawVisor(c, oy, o) {
  // outer dark ring (rounded rect), black screen, bevel
  const ring = (x, y, w, h, col) => {
    R(c, x + 1, y, w - 2, h, col); R(c, x, y + 1, w, h - 2, col);
  };
  ring(7, 17 + oy, 15, 10, C.o);
  ring(8, 18 + oy, 13, 8, C.k);
  R(c, 9, 27 + oy, 12, 1, C.s); // bevel under visor
  // ear-cup on the opposite side
  R(c, 24, 17 + oy, 3, 6, C.o); R(c, 25, 18 + oy, 2, 5, C.k);
  const e = o.eyes;
  const glow = (x, y, w, h) => { c.globalAlpha = 0.28; R(c, x - 1, y - 1, w + 2, h + 2, C.cy); c.globalAlpha = 1; };
  const eye = (x, y, w, h, col = C.cy) => { glow(x, y, w, h); R(c, x, y, w, h, col); };
  const t = o.t;
  if (e === 'happy') {
    [[10, 22], [11, 21], [12, 22], [15, 22], [16, 21], [17, 22]].forEach(([x, y]) => R(c, x, y + oy, 1, 1, C.cy));
    R(c, 12, 24 + oy, 5, 1, C.cy); R(c, 13, 25 + oy, 3, 1, C.cy);
  } else if (e === 'sleep') {
    R(c, 10, 22 + oy, 3, 1, C.cyd); R(c, 15, 22 + oy, 3, 1, C.cyd);
  } else {
    let ex = 0, ey = 0, h = 4, y0 = 20;
    if (e === 'think') { ex = 1; ey = -1; h = 3; }
    if (e === 'surprised') { h = 5; y0 = 19; }
    if (e === 'idle' || e === 'talk') { if ((t % 4.2) < 0.12) { h = 1; y0 = 21.5; } }
    eye(10 + ex, y0 + ey + oy, 3, h); eye(15 + ex, y0 + ey + oy, 3, h);
    // mouth
    if (e === 'talk') {
      if (Math.floor(t * 8) % 2) { R(c, 13, 24 + oy, 3, 2, C.cy); } else { R(c, 12, 24 + oy, 5, 1, C.cy); }
    } else if (e === 'surprised') {
      R(c, 14, 24 + oy, 2, 2, C.cy);
    } else if (e === 'think') {
      R(c, 13, 25 + oy, 3, 1, C.cyd);
    } else {
      R(c, 12, 24 + oy, 1, 1, C.cy); R(c, 16, 24 + oy, 1, 1, C.cy); R(c, 13, 25 + oy, 3, 1, C.cy);
    }
  }
}

export function drawAli(c, x = 0, y = 0, o = {}) {
  const state = o.state || 'idle';
  const t = o.t ?? 0;
  const dir = o.dir ?? -1;
  c.save();
  c.translate(x, y + 4); // top margin so crystals can bounce
  if (dir > 0) { c.translate(ALI_W, 0); c.scale(-1, 1); }

  // vertical motion per state
  let hop = 0;
  if (state === 'walk') hop = -Math.round(Math.abs(Math.sin(t * 9)) * 3);
  if (state === 'dance') hop = -Math.round(Math.abs(Math.sin(t * 7)) * 4);
  if (state === 'surprised') hop = -2;
  const oy = hop;

  // shadow
  const sw = 16 - Math.abs(hop) * 2;
  c.globalAlpha = 0.2; R(c, 16 - sw / 2, 34, sw, 1, '#000'); R(c, 16 - sw / 2 + 2, 35, Math.max(2, sw - 4), 1, '#000'); c.globalAlpha = 1;

  // body + visor
  drawBody(c, oy);
  const eyes = state === 'walk' ? 'idle' : state === 'dance' ? (Math.floor(t * 4) % 2 ? 'happy' : 'idle') : state;
  drawVisor(c, oy, { eyes, t });

  // floating crystal ears (independent motion = lots of personality)
  let lx = 1, ly = 1, rx = 21, ry = 0;
  const bobL = Math.sin(t * 2.1) * 1.5, bobR = Math.sin(t * 2.1 + 2) * 1.5;
  ly += bobL; ry += bobR;
  if (state === 'talk') { lx += Math.floor(t * 8) % 2 ? 1 : -1; rx -= Math.floor(t * 8) % 2 ? 1 : -1; }
  if (state === 'surprised') { ly -= 3; ry -= 3; lx -= 1; rx += 1; }
  if (state === 'think') { ly -= 2; }
  if (state === 'happy' || state === 'dance') { ly += Math.sin(t * 12) * 1.5; ry += Math.sin(t * 12 + 1) * 1.5; }
  if (state === 'sleep') { ly += 3; ry += 3; c.globalAlpha = 0.7; }
  sprite(c, GEM_L, Math.round(lx), Math.round(ly + oy));
  sprite(c, GEM_R, Math.round(rx), Math.round(ry + oy));
  c.globalAlpha = 1;

  // sparkles around the crystals (always a little magic)
  const sp = Math.floor(t * 3) % 4;
  if (sp < 2) { R(c, 12, 2 + oy, 1, 3, C.hi); R(c, 11, 3 + oy, 3, 1, C.hi); }
  if (sp > 0 && sp < 3) { R(c, 30, 8 + oy, 1, 1, C.w); }

  // zzz when sleeping
  if (state === 'sleep') {
    for (let i = 0; i < 2; i++) {
      const p = (t * 0.4 + i * 0.5) % 1;
      c.globalAlpha = 1 - p;
      const zx = 23 + p * 6, zy = 8 - p * 8;
      R(c, zx, zy, 3, 1, C.o); R(c, zx + 2, zy + 1, 1, 1, C.o); R(c, zx + 1, zy + 2, 1, 1, C.o); R(c, zx, zy + 3, 3, 1, C.o);
    }
    c.globalAlpha = 1;
  }
  c.restore();
}

export function createAli(canvas, opts = {}) {
  const c = canvas.getContext('2d');
  canvas.width = ALI_W; canvas.height = ALI_H;
  canvas.style.imageRendering = 'pixelated';
  c.imageSmoothingEnabled = false;
  let state = opts.state || 'idle', dir = opts.dir ?? -1, raf = 0, last = 0;
  const reduced = opts.reduced ?? (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const t0 = performance.now();
  const render = (t) => { c.clearRect(0, 0, ALI_W, ALI_H); drawAli(c, 0, 0, { state, dir, t }); };
  const frame = (ms) => {
    raf = requestAnimationFrame(frame);
    if (ms - last < 42) return; // ~24 fps
    last = ms; render((ms - t0) / 1000);
  };
  render(reduced ? 1 : 0);
  if (!reduced) raf = requestAnimationFrame(frame);
  return {
    setState(s) { state = s; if (reduced) render(1); },
    setDir(d) { dir = d; if (reduced) render(1); },
    destroy() { cancelAnimationFrame(raf); },
  };
}
