function blank() {
  return Array.from({ length: 16 }, () => Array(16).fill("."));
}

function plot(grid, x, y, ch) {
  if (y < 0 || x < 0 || y > 15 || x > 15 || ch == null || ch === "") return;
  grid[y][x] = ch;
}

function rect(grid, x, y, w, h, ch) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) plot(grid, xx, yy, ch);
  }
}

function strings(grid) {
  return grid.map((row) => row.join(""));
}

function clone(rows) {
  const grid = blank();
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => plot(grid, x, y, ch));
  });
  return grid;
}

function shift(rows, dy) {
  const grid = blank();
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => plot(grid, x, y + dy, ch));
  });
  return strings(grid);
}

export function mirrorGrid(rows) {
  return rows.map((row) => [...row].reverse().join(""));
}

function baseRobot() {
  const g = blank();
  plot(g, 7, 0, "a");
  plot(g, 8, 0, "a");
  plot(g, 7, 1, "o");
  plot(g, 8, 1, "o");
  rect(g, 4, 2, 8, 1, "o");
  rect(g, 3, 3, 10, 8, "o");
  rect(g, 4, 3, 8, 1, "b");
  rect(g, 4, 4, 8, 6, "b");
  plot(g, 4, 4, "h");
  plot(g, 5, 4, "h");
  rect(g, 5, 5, 6, 4, "s");
  plot(g, 6, 6, "e");
  plot(g, 7, 6, "p");
  plot(g, 9, 6, "e");
  plot(g, 10, 6, "p");
  plot(g, 7, 8, "m");
  plot(g, 8, 8, "m");
  rect(g, 5, 11, 2, 2, "o");
  rect(g, 9, 11, 2, 2, "o");
  return g;
}

function withFeet(grid, style) {
  rect(grid, 4, 11, 4, 3, ".");
  rect(grid, 8, 11, 4, 3, ".");
  if (style === "apart") {
    rect(grid, 3, 12, 2, 2, "o");
    rect(grid, 11, 12, 2, 2, "o");
  } else if (style === "left") {
    rect(grid, 4, 12, 2, 2, "o");
    rect(grid, 10, 11, 2, 2, "o");
  } else if (style === "right") {
    rect(grid, 4, 11, 2, 2, "o");
    rect(grid, 10, 12, 2, 2, "o");
  } else {
    rect(grid, 5, 11, 2, 2, "o");
    rect(grid, 9, 11, 2, 2, "o");
  }
}

function idleFrames() {
  const open = baseRobot();
  const shut = clone(strings(open));
  rect(shut, 5, 6, 6, 1, "s");
  plot(shut, 6, 6, "o");
  plot(shut, 10, 6, "o");
  return [strings(open), strings(shut)];
}

function walkFrames() {
  const a = baseRobot();
  const b = baseRobot();
  const c = baseRobot();
  withFeet(a, "left");
  withFeet(b, "apart");
  withFeet(c, "right");
  return [shift(strings(a), 0), shift(strings(b), -1), shift(strings(c), 0), shift(strings(b), 1)];
}

function waveFrames() {
  const up = baseRobot();
  rect(up, 12, 1, 2, 1, "o");
  rect(up, 13, 2, 2, 3, "b");
  plot(up, 14, 2, "o");
  plot(up, 14, 3, "o");
  plot(up, 14, 4, "o");
  const mid = baseRobot();
  rect(mid, 13, 4, 2, 3, "b");
  plot(mid, 15, 4, "o");
  plot(mid, 15, 5, "o");
  plot(mid, 15, 6, "o");
  return [strings(up), strings(mid)];
}

function talkFrames() {
  const a = baseRobot();
  const b = baseRobot();
  rect(a, 6, 8, 4, 1, "m");
  rect(b, 6, 7, 4, 2, "m");
  plot(b, 7, 8, "h");
  plot(b, 8, 8, "h");
  return [strings(a), strings(b), strings(a), strings(baseRobot())];
}

function thinkFrames() {
  const a = baseRobot();
  rect(a, 5, 6, 6, 1, "s");
  plot(a, 6, 5, "e");
  plot(a, 7, 5, "p");
  plot(a, 9, 5, "e");
  plot(a, 10, 5, "p");
  plot(a, 12, 3, "h");
  plot(a, 13, 2, "h");
  const b = clone(strings(a));
  plot(b, 14, 1, "h");
  return [strings(a), strings(b)];
}

function surprisedFrames() {
  const a = baseRobot();
  rect(a, 5, 6, 6, 2, "e");
  plot(a, 6, 6, "p");
  plot(a, 10, 6, "p");
  plot(a, 7, 8, "o");
  plot(a, 8, 8, "o");
  const b = clone(strings(a));
  plot(b, 6, 0, "a");
  plot(b, 9, 0, "a");
  return [strings(a), strings(b)];
}

function sleepFrames() {
  const a = baseRobot();
  rect(a, 5, 6, 6, 1, "s");
  plot(a, 6, 6, "o");
  plot(a, 10, 6, "o");
  plot(a, 13, 2, "z");
  plot(a, 14, 1, "z");
  const b = clone(strings(a));
  plot(b, 14, 2, ".");
  plot(b, 15, 0, "z");
  return [strings(a), strings(b), strings(a)];
}

function sadFrames() {
  const a = baseRobot();
  plot(a, 7, 0, ".");
  plot(a, 8, 0, ".");
  plot(a, 6, 1, "o");
  rect(a, 5, 6, 6, 1, "s");
  plot(a, 6, 7, "e");
  plot(a, 7, 7, "p");
  plot(a, 9, 7, "e");
  plot(a, 10, 7, "p");
  return [strings(a), strings(a)];
}

function danceFrames() {
  const a = baseRobot();
  rect(a, 0, 4, 2, 3, "b");
  plot(a, 0, 4, "o");
  plot(a, 0, 6, "o");
  rect(a, 14, 3, 2, 3, "b");
  plot(a, 15, 3, "o");
  const b = baseRobot();
  rect(b, 1, 2, 2, 3, "b");
  rect(b, 13, 2, 2, 3, "b");
  const up = shift(strings(a), -1);
  const down = shift(strings(b), 1);
  return [strings(a), up, strings(b), down];
}

export const SPRITES = {
  idle: idleFrames(),
  walkL: walkFrames(),
  walkR: walkFrames(),
  sleep: sleepFrames(),
  wave: waveFrames(),
  talk: talkFrames(),
  think: thinkFrames(),
  surprised: surprisedFrames(),
  dance: danceFrames(),
  sad: sadFrames(),
};

export function paletteFor(theme) {
  const blue = theme === "blue";
  return {
    o: blue ? "#1e2f8f" : "#2e2a2a",
    b: blue ? "#2c41b0" : "#f26a38",
    h: "#ffffff",
    s: "#142033",
    e: "#f7fbff",
    p: blue ? "#1e2f8f" : "#2e2a2a",
    a: "#ffe14a",
    m: "#0c121c",
    z: blue ? "#1e2f8f" : "#2e2a2a",
  };
}

export function paintSprite(canvas, grid, palette, scale = 4) {
  const ctx = canvas.getContext("2d");
  const rows = grid.length;
  const cols = grid[0].length;
  if (canvas.width !== cols * scale) canvas.width = cols * scale;
  if (canvas.height !== rows * scale) canvas.height = rows * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const color = palette[grid[y][x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

for (const [name, frames] of Object.entries(SPRITES)) {
  frames.forEach((frame, index) => {
    if (frame.length !== 16) throw new Error(`${name} frame ${index} height`);
    frame.forEach((row, rowIndex) => {
      if (row.length !== 16) throw new Error(`${name} frame ${index} row ${rowIndex}`);
    });
  });
}
