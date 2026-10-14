/**
 * pixelScene.js — animated pixel-art workstation (192x128 logical pixels)
 * ---------------------------------------------------------------------
 * Framework-agnostic. Works in React, Vue or plain HTML.
 *
 *   import { createPixelScene } from './pixelScene.js';
 *   const scene = createPixelScene(canvasEl, { theme: 'peach', onHot: name => {...} });
 *   scene.setTheme('blue');   // 'peach' | 'blue'
 *   scene.destroy();          // call on unmount
 *
 * Alive things: scrolling code on the monitor, blinking cursor, flashing keys,
 * steaming coffee, swaying plant, sleeping cat (breathing + tail + zzz),
 * day/night window with sun, moon, stars and drifting clouds, ticking clock,
 * orbiting tech icons (gear, database, cloud, </>), twinkling sparkles.
 *
 * Interactions: hover monitor = code scrolls fast, click coffee = steam burst,
 * click cat = hearts, click window = switch day/night. Mouse gives parallax.
 */

export const W = 192;
export const H = 128;

export const PALETTES = {
  peach: {
    ink: '#2E2A2A', wall: '#F6B58C', wall2: '#F0A173', floor: '#A44A26', floor2: '#8A3B1D',
    desk: '#D2683A', deskLight: '#E8885A', deskDark: '#9A4424', cream: '#FDEFD6',
    a1: '#F26A38', a2: '#C94E22', hl: '#F5C842', screen: '#1B2340', code: '#7FD6E8',
    sky: '#8EC5F5', skyNight: '#232B6B', cloud: '#FFFFFF', green: '#5E9E4A', greenDark: '#3F7A38',
    pink: '#F28DA6', rug: '#FDEFD6', rug2: '#F26A38', cat: '#3A3030',
  },
  blue: {
    ink: '#16206B', wall: '#A9CFF5', wall2: '#97C2EE', floor: '#2C41B0', floor2: '#22328A',
    desk: '#4A63D6', deskLight: '#6F86EA', deskDark: '#2C41B0', cream: '#EAF3FF',
    a1: '#5C8DFF', a2: '#2C41B0', hl: '#FFD84D', screen: '#0F1A4D', code: '#8FE3FF',
    sky: '#CFE8FF', skyNight: '#16206B', cloud: '#FFFFFF', green: '#4FB88A', greenDark: '#2E8F68',
    pink: '#FF9EC0', rug: '#EAF3FF', rug2: '#5C8DFF', cat: '#1E2A5E',
  },
};

// Hot zones [x0, y0, x1, y1] in logical pixels
const HOT = {
  coffee: [132, 68, 147, 82],
  cat: [30, 104, 72, 124],
  plant: [148, 48, 168, 80],
  monitor: [66, 32, 126, 72],
  window: [10, 12, 58, 56],
};

const CODE = [
  [0, ['k', 4], ['f', 9], ['s', 3]],
  [2, ['c', 5], ['g', 2], ['s', 10]],
  [2, ['k', 3], ['c', 6], ['g', 2], ['f', 7]],
  [4, ['f', 8], ['s', 4]],
  [4, ['c', 4], ['g', 2], ['s', 12]],
  [2, ['k', 6], ['c', 5]],
  [0, ['g', 16]],
  [0, ['k', 5], ['f', 6], ['s', 8]],
  [2, ['f', 10], ['c', 3], ['s', 5]],
  [4, ['s', 14]],
  [2, ['k', 4], ['c', 8]],
  [0, ['s', 3]],
];

// ---------- tiny helpers ----------
const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
const rnd = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const box = (c, x, y, w, h, col, ink) => { R(c, x - 1, y - 1, w + 2, h + 2, ink); R(c, x, y, w, h, col); };

function spr(c, rows, x, y, map) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const col = map[row[i]];
      if (col) R(c, x + i, y + j, 1, 1, col);
    }
  });
}

function line(c, x0, y0, x1, y1, col) {
  x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    R(c, x0, y0, 1, 1, col);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

const CLOUD = ['...####.....', '..######.##.', '.###########', '############'];
const SUN = ['..yyyy..', '.yyyyyy.', 'yyyyyyyy', 'yyyyyyyy', 'yyyyyyyy', 'yyyyyyyy', '.yyyyyy.', '..yyyy..'];
const MOON = ['..mmmm..', '.mmm....', 'mmm.....', 'mmm.....', 'mmm.....', 'mmmm....', '.mmmmmm.', '..mmmm..'];
const HEART = ['.#.#.', '#####', '#####', '.###.', '..#..'];
const ZZ = ['####', '..#.', '.#..', '####'];

// ---------- scene pieces ----------
function drawWall(c, P) {
  R(c, 0, 0, W, 96, P.wall);
  for (let y = 4; y < 96; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < W; x += 8) R(c, x, y, 2, 2, P.wall2);
  R(c, 0, 96, W, 4, P.deskDark);
  R(c, 0, 100, W, 28, P.floor);
  for (let x = 0; x < W; x += 24) R(c, x, 100, 1, 28, P.floor2);
  R(c, 0, 112, W, 1, P.floor2);
  R(c, 0, 120, W, 1, P.floor2);
}

function drawSky(c, t, S, P) {
  const x = 12, y = 14, w = 44, h = 38;
  const ph = ((t + S.shift) / 26) % 1;
  const night = ph > 0.55;
  R(c, x, y, w, h, night ? P.skyNight : P.sky);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  if (night) {
    for (let i = 0; i < 12; i++) {
      const sx = x + Math.floor(rnd(i + 1) * w), sy = y + Math.floor(rnd(i + 9) * (h - 12));
      if ((Math.floor(t * 2 + i) % 3) !== 0) R(c, sx, sy, 1, 1, P.cream);
    }
    const p = (ph - 0.55) / 0.45;
    spr(c, MOON, x - 6 + p * (w + 4), y + 22 - Math.sin(p * Math.PI) * 16, { m: P.hl });
  } else {
    const p = ph / 0.55;
    spr(c, SUN, x - 6 + p * (w + 4), y + 26 - Math.sin(p * Math.PI) * 20, { y: P.hl });
  }
  c.globalAlpha = night ? 0.45 : 1;
  for (let i = 0; i < 3; i++) {
    const cx = ((t * (3 + i * 1.6) + i * 30) % (w + 24)) - 12 + x + S.mx * 1.5;
    spr(c, CLOUD, cx, y + 5 + i * 9, { '#': P.cloud });
  }
  c.globalAlpha = 1;
  R(c, x, y + h - 6, w, 6, P.greenDark);
  for (let i = 0; i < w; i += 8) R(c, x + i, y + h - 8 + (i % 16 ? 0 : 1), 8, 3, P.green);
  c.restore();
  R(c, x - 2, y - 2, w + 4, 2, P.ink); R(c, x - 2, y + h, w + 4, 2, P.ink);
  R(c, x - 2, y - 2, 2, h + 4, P.ink); R(c, x + w, y - 2, 2, h + 4, P.ink);
  R(c, x + w / 2 - 1, y, 2, h, P.cream); R(c, x, y + h / 2 - 1, w, 2, P.cream);
  R(c, x - 5, y + h + 2, w + 10, 3, P.cream); R(c, x - 5, y + h + 5, w + 10, 1, P.ink);
}

function drawClock(c, t, P) {
  const x = 150, y = 14;
  R(c, x + 2, y, 10, 14, P.ink); R(c, x, y + 2, 14, 10, P.ink); R(c, x + 1, y + 1, 12, 12, P.ink);
  R(c, x + 3, y + 2, 8, 10, P.cream); R(c, x + 2, y + 3, 10, 8, P.cream);
  [[7, 3], [7, 11], [3, 7], [11, 7]].forEach(([a, b]) => R(c, x + a, y + b, 1, 1, P.ink));
  const cx = x + 7, cy = y + 7;
  const sa = (Math.floor(t) % 60) / 60 * Math.PI * 2 - Math.PI / 2;
  const ma = (t / 60) * Math.PI * 2 - Math.PI / 2;
  line(c, cx, cy, cx + Math.cos(ma) * 3, cy + Math.sin(ma) * 3, P.ink);
  line(c, cx, cy, cx + Math.cos(sa) * 4, cy + Math.sin(sa) * 4, P.a1);
  R(c, cx, cy, 1, 1, P.ink);
}

function icon(c, kind, x, y, col, ink, t) {
  const draw = (ox, oy, k, i) => {
    if (kind === 'gear') {
      const f = Math.floor(t * 3) % 2;
      R(c, x + ox + 2, y + oy + 2, 5, 5, k); R(c, x + ox + 1, y + oy + 3, 7, 3, k); R(c, x + ox + 3, y + oy + 1, 3, 7, k);
      if (f) { R(c, x + ox, y + oy, 2, 2, k); R(c, x + ox + 7, y + oy, 2, 2, k); R(c, x + ox, y + oy + 7, 2, 2, k); R(c, x + ox + 7, y + oy + 7, 2, 2, k); }
      else { R(c, x + ox + 3, y + oy, 3, 1, k); R(c, x + ox + 3, y + oy + 8, 3, 1, k); R(c, x + ox, y + oy + 3, 1, 3, k); R(c, x + ox + 8, y + oy + 3, 1, 3, k); }
      if (i) R(c, x + ox + 4, y + oy + 4, 1, 1, ink === k ? col : '#FDEFD6');
    } else if (kind === 'db') {
      R(c, x + ox, y + oy + 1, 8, 7, k); R(c, x + ox + 1, y + oy, 6, 1, k); R(c, x + ox + 1, y + oy + 8, 6, 1, k);
      if (i) { R(c, x + ox, y + oy + 3, 8, 1, ink === k ? col : '#FDEFD6'); R(c, x + ox, y + oy + 6, 8, 1, ink === k ? col : '#FDEFD6'); }
    } else if (kind === 'cloud') {
      spr(c, ['..###...', '.#####.#', '########', '########', '.######.'], x + ox, y + oy + 1, { '#': k });
    } else {
      spr(c, ['..#.....#..', '.#.......#.', '#...#.#...#', '.#.......#.', '..#.....#..'], x + ox, y + oy + 1, { '#': k });
    }
  };
  draw(1, 1, ink, false);
  draw(0, 0, col, true);
}

function drawIcons(c, t, S, P) {
  const kinds = [['gear', P.a1], ['db', P.hl], ['cloud', P.cream], ['code', P.pink]];
  const items = kinds.map(([k, col], i) => {
    const a = t * 0.55 + i * (Math.PI / 2);
    return { k, col, a, d: Math.sin(a) };
  }).sort((p, q) => p.d - q.d);
  items.forEach(({ k, col, a }) => {
    const x = 96 + Math.cos(a) * 32 + S.mx * 3 - 5;
    const y = 18 + Math.sin(a) * 4 + Math.sin(t * 2 + a) * 1.5;
    icon(c, k, Math.round(x), Math.round(y), col, P.ink, t);
  });
}

function drawMonitor(c, t, S, P) {
  R(c, 93, 72, 6, 6, P.ink); R(c, 84, 77, 24, 3, P.ink);
  R(c, 66, 32, 60, 40, P.ink); R(c, 67, 33, 58, 38, P.a2);
  R(c, 69, 35, 54, 31, P.screen);
  R(c, 69, 35, 54, 4, P.a1);
  [71, 75, 79].forEach((x) => R(c, x, 36, 2, 2, P.cream));
  const hot = S.hot === 'monitor';
  const sp = hot ? 26 : 6;
  const off = (t * sp) % (CODE.length * 4);
  const base = Math.floor(off / 4);
  const map = { k: P.a1, f: P.hl, s: P.cream, c: P.code, g: '#5A6590' };
  c.save(); c.beginPath(); c.rect(69, 40, 54, 20); c.clip();
  for (let i = 0; i < 7; i++) {
    const [ind, ...segs] = CODE[(i + base) % CODE.length];
    const y = 41 - (off % 4) + i * 4;
    R(c, 71, y, 2, 2, '#3A4570');
    let x = 77 + ind;
    segs.forEach(([k, len]) => { R(c, x, y, len, 2, map[k]); x += len + 2; });
  }
  c.restore();
  R(c, 69, 60, 54, 6, P.screen);
  R(c, 71, 61, 3, 1, P.a1); R(c, 72, 62, 1, 1, P.a1); R(c, 71, 63, 3, 1, P.a1);
  if (Math.floor(t * 2) % 2 === 0) R(c, 77, 61, 3, 3, P.cream);
  R(c, 120, 68, 3, 2, Math.floor(t) % 2 ? P.hl : P.green);
}

function drawDesk(c, P) {
  R(c, 22, 88, 6, 28, P.deskDark); R(c, 22, 88, 1, 28, P.ink);
  R(c, 130, 88, 40, 28, P.deskDark);
  R(c, 132, 90, 36, 11, P.desk); R(c, 132, 103, 36, 11, P.desk);
  R(c, 147, 94, 6, 2, P.hl); R(c, 147, 107, 6, 2, P.hl);
  R(c, 16, 80, 160, 5, P.desk); R(c, 16, 80, 160, 1, P.deskLight);
  R(c, 16, 85, 160, 3, P.deskDark); R(c, 16, 88, 160, 1, P.ink);
}

function drawDeskItems(c, t, S, P) {
  box(c, 26, 77, 18, 3, P.a1, P.ink); box(c, 28, 74, 14, 3, P.hl, P.ink); box(c, 27, 71, 16, 3, P.cream, P.ink);
  R(c, 33, 66, 1, 4, P.greenDark); R(c, 31, 65, 3, 2, P.green); R(c, 34, 64, 3, 2, P.green);
  box(c, 72, 81, 40, 3, P.cream, P.ink);
  for (let i = 0; i < 10; i++) R(c, 73 + i * 4, 82, 2, 1, '#CDB48E');
  const k = Math.floor(rnd(Math.floor(t * 9)) * 10);
  R(c, 73 + k * 4, 82, 2, 1, P.a1);
  box(c, 118, 81, 5, 3, P.cream, P.ink);
  // coffee
  box(c, 134, 70, 9, 10, P.cream, P.ink);
  R(c, 134, 73, 9, 2, P.a1);
  R(c, 143, 72, 3, 2, P.ink); R(c, 145, 72, 1, 6, P.ink); R(c, 143, 77, 3, 1, P.ink);
  const burst = t < S.boost;
  const n = burst ? 9 : 5;
  for (let i = 0; i < n; i++) {
    const p = (t * (burst ? 1.1 : 0.55) + i / n) % 1;
    const x = 138 + Math.sin(p * 7 + i * 2) * (burst ? 5 : 2.5);
    const y = 67 - p * (burst ? 30 : 18);
    c.globalAlpha = 1 - p;
    R(c, x, y, p < 0.6 ? 2 : 1, p < 0.6 ? 2 : 1, P.cream);
  }
  c.globalAlpha = 1;
  // plant
  box(c, 152, 71, 10, 9, P.a2, P.ink); R(c, 152, 71, 10, 2, P.a1);
  R(c, 156, 56, 2, 15, P.greenDark);
  for (let i = 0; i < 3; i++) {
    const s = Math.round(Math.sin(t * 1.8 + i) * (1 + i * 0.4));
    R(c, 152 + s, 58 + i * 4, 4, 3, P.green); R(c, 158 + s, 60 + i * 4, 4, 3, P.green);
  }
  R(c, 155 + Math.round(Math.sin(t * 1.8 + 3)), 52, 4, 5, P.green);
}

function drawCat(c, t, P) {
  // rug
  R(c, 34, 112, 54, 12, P.rug); R(c, 36, 110, 50, 2, P.rug); R(c, 36, 124, 50, 2, P.rug);
  R(c, 36, 114, 50, 2, P.rug2); R(c, 36, 120, 50, 2, P.rug2);
  const x = 44, y = 106;
  const b = Math.floor(t) % 2;
  R(c, x + 5, y + 3 - b, 11, 7 + b, P.cat);
  R(c, x, y + 3, 8, 7, P.cat);
  R(c, x, y + 1, 2, 3, P.cat); R(c, x + 6, y + 1, 2, 3, P.cat);
  R(c, x + 1, y + 2, 1, 1, P.pink); R(c, x + 6, y + 2, 1, 1, P.pink);
  const open = (t % 8) > 7.4;
  if (open) { R(c, x + 2, y + 5, 1, 1, P.hl); R(c, x + 5, y + 5, 1, 1, P.hl); }
  else { R(c, x + 2, y + 6, 2, 1, P.cream); R(c, x + 5, y + 6, 2, 1, P.cream); }
  for (let k = 0; k < 6; k++) {
    const ty = y + 8 - Math.round(Math.sin(t * 3 + k * 0.6) * 1.5 + k * 0.4);
    R(c, x + 16 + k, ty, 2, 2, P.cat);
  }
  for (let i = 0; i < 2; i++) {
    const p = (t * 0.35 + i * 0.5) % 1;
    c.globalAlpha = 1 - p;
    spr(c, ZZ, x + 6 + p * 10, y - 2 - p * 14, { '#': P.ink });
  }
  c.globalAlpha = 1;
}

function drawSparkles(c, t, P) {
  [[8, 6], [70, 8], [132, 10], [176, 40], [186, 70], [118, 46], [6, 70], [140, 30]].forEach(([x, y], i) => {
    if (Math.floor(t * 3 + i * 2) % 4 < 2) { R(c, x + 1, y, 1, 3, P.cream); R(c, x, y + 1, 3, 1, P.cream); }
  });
}

function drawHearts(c, t, S, P) {
  S.hearts = S.hearts.filter((h) => t - h.born < 1.4);
  S.hearts.forEach((h) => {
    const p = (t - h.born) / 1.4;
    c.globalAlpha = 1 - p * p;
    spr(c, HEART, h.x + Math.sin(p * 8 + h.x) * 3, h.y - p * 22, { '#': P.pink });
  });
  c.globalAlpha = 1;
}

function drawHotMarker(c, S, P) {
  if (!S.hot) return;
  const [x0, y0, x1, y1] = HOT[S.hot];
  const col = P.hl;
  [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([x, y, dx, dy]) => {
    R(c, dx > 0 ? x : x - 3, y, 4, 1, col); R(c, x, dy > 0 ? y : y - 3, 1, 4, col);
  });
}

export function drawScene(c, t, S, P) {
  drawWall(c, P);
  drawCat(c, t, P);
  drawSky(c, t, S, P);
  drawClock(c, t, P);
  drawSparkles(c, t, P);
  drawIcons(c, t, S, P);
  drawMonitor(c, t, S, P);
  drawDesk(c, P);
  drawDeskItems(c, t, S, P);
  drawHearts(c, t, S, P);
  drawHotMarker(c, S, P);
}

export function createPixelScene(canvas, opts = {}) {
  const c = canvas.getContext('2d');
  canvas.width = W; canvas.height = H;
  c.imageSmoothingEnabled = false;
  canvas.style.imageRendering = 'pixelated';
  let P = PALETTES[opts.theme || 'peach'];
  const S = { hot: null, mx: 0, boost: 0, shift: 0, hearts: [] };
  const reduced = opts.reduced ?? (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const t0 = performance.now();
  let raf = 0, visible = true, last = 0;
  const now = () => (performance.now() - t0) / 1000;

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };
  const hit = (x, y) => Object.keys(HOT).find((k) => { const [a, b, d, e] = HOT[k]; return x >= a && x <= d && y >= b && y <= e; }) || null;

  const onMove = (e) => {
    const [x, y] = pos(e);
    const h = hit(x, y);
    if (h !== S.hot) { S.hot = h; canvas.style.cursor = h ? 'pointer' : 'default'; opts.onHot && opts.onHot(h); }
    S.mx = (x / W - 0.5) * 2;
  };
  const onLeave = () => { S.hot = null; S.mx = 0; canvas.style.cursor = 'default'; opts.onHot && opts.onHot(null); };
  const onClick = (e) => {
    const [x, y] = pos(e);
    const h = hit(x, y);
    const t = now();
    if (h === 'coffee') S.boost = t + 1.6;
    if (h === 'cat') for (let i = 0; i < 3; i++) S.hearts.push({ x: 48 + i * 6, y: 104, born: t + i * 0.15 });
    if (h === 'window') S.shift += 14;
    opts.onClickHot && opts.onClickHot(h);
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('click', onClick);

  const frame = (ms) => {
    raf = requestAnimationFrame(frame);
    if (!visible || ms - last < 33) return; // ~30fps feels more "pixel"
    last = ms;
    drawScene(c, now(), S, P);
  };
  if (reduced) drawScene(c, 3, S, P);
  else raf = requestAnimationFrame(frame);

  let io;
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(canvas);
  }

  return {
    setTheme(name) { P = PALETTES[name] || P; if (reduced) drawScene(c, 3, S, P); },
    destroy() {
      cancelAnimationFrame(raf); io && io.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onClick);
    },
  };
}
