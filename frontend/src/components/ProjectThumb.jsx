import { useEffect, useRef } from "react";

const INK = "#2E2A2A";
const CREAM = "#FDEFD6";
const ORANGE = "#F26A38";
const GOLD = "#F5C842";
const BLUE = "#2C41B0";

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCafe(ctx, t) {
  rect(ctx, 0, 0, 96, 60, "#F4DEC0");
  rect(ctx, 34, 28, 28, 18, CREAM);
  rect(ctx, 33, 27, 30, 2, INK);
  rect(ctx, 33, 44, 30, 2, INK);
  rect(ctx, 32, 29, 2, 16, INK);
  rect(ctx, 62, 29, 2, 16, INK);
  rect(ctx, 40, 18, 16, 10, ORANGE);
  rect(ctx, 62, 32, 8, 2, INK);
  rect(ctx, 68, 32, 2, 8, INK);
  const steam = Math.floor(t * 4) % 8;
  rect(ctx, 44, 12 - steam, 2, 4, CREAM);
  rect(ctx, 50, 8 - (steam % 5), 2, 4, CREAM);
  rect(ctx, 8, 10, 22, 28, CREAM);
  rect(ctx, 8, 10, 22, 2, INK);
  for (let i = 0; i < 4; i += 1) rect(ctx, 11, 16 + i * 5, 16, 1, ORANGE);
}

function drawSplit(ctx, t) {
  rect(ctx, 0, 0, 96, 60, "#E7F3FF");
  const hop = Math.floor(t * 3) % 2;
  rect(ctx, 18, 28 + hop, 10, 14, BLUE);
  rect(ctx, 20, 22 + hop, 6, 6, "#FDEFD6");
  rect(ctx, 62, 28, 10, 14, ORANGE);
  rect(ctx, 64, 22, 6, 6, "#FDEFD6");
  const coinX = 28 + ((t * 24) % 30);
  rect(ctx, coinX, 24, 6, 6, GOLD);
  rect(ctx, coinX + 2, 26, 2, 2, INK);
}

function drawAi(ctx, t) {
  rect(ctx, 0, 0, 96, 60, "#12203A");
  const nodes = [[20, 16], [20, 40], [48, 12], [48, 30], [48, 48], [74, 28]];
  nodes.forEach(([x, y], i) => {
    const pulse = Math.floor(t * 3 + i) % 2;
    rect(ctx, x, y, 6, 6, pulse ? GOLD : "#7FD6E8");
  });
  rect(ctx, 26, 18, 22, 2, "#3A4A70");
  rect(ctx, 26, 40, 22, 2, "#3A4A70");
  rect(ctx, 54, 30, 20, 2, "#3A4A70");
}

function drawCode(ctx, t) {
  rect(ctx, 0, 0, 96, 60, "#1B2340");
  const shift = Math.floor(t * 6) % 8;
  for (let i = 0; i < 6; i += 1) {
    rect(ctx, 8, 8 + i * 8 - shift, 8 + ((i * 17) % 40), 3, i % 2 ? "#7FD6E8" : GOLD);
  }
  if (Math.floor(t * 2) % 2 === 0) rect(ctx, 70, 44, 6, 8, CREAM);
}

const DRAW = { cafe: drawCafe, split: drawSplit, ai: drawAi, code: drawCode };

export default function ProjectThumb({ kind }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    canvas.width = 96;
    canvas.height = 60;
    const paint = DRAW[kind] || drawCode;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let visible = true;
    const frame = (ms) => {
      raf = requestAnimationFrame(frame);
      if (!visible || ms - last < 80) return;
      last = ms;
      ctx.imageSmoothingEnabled = false;
      paint(ctx, ms / 1000);
    };
    if (reduced) paint(ctx, 1);
    else raf = requestAnimationFrame(frame);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [kind]);

  return <canvas ref={ref} aria-hidden="true" />;
}

export function thumbKind(project) {
  const id = String(project.id || "").toLowerCase();
  const category = String(project.category || "").toLowerCase();
  if (id.includes("cafe")) return "cafe";
  if (id.includes("split")) return "split";
  if (category === "ai") return "ai";
  return "code";
}
