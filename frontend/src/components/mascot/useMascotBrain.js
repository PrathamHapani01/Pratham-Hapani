import { useEffect, useRef, useState } from "react";

const SPEED = 78;

function snap(n) {
  return Math.round(n / 4) * 4;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function useMascotBrain({ paused, reduced, hidden, mobile, override }) {
  const elRef = useRef(null);
  const pausedRef = useRef(paused);
  const reducedRef = useRef(reduced);
  const hiddenRef = useRef(hidden);
  const mobileRef = useRef(mobile);
  const overrideRef = useRef(override);
  const mouseRef = useRef({ x: 200, y: 200, t: performance.now() });
  const [anim, setAnim] = useState("idle");
  const [facing, setFacing] = useState("right");
  const animRef = useRef("idle");
  const facingRef = useRef("right");

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { reducedRef.current = reduced; }, [reduced]);
  useEffect(() => { hiddenRef.current = hidden; }, [hidden]);
  useEffect(() => { mobileRef.current = mobile; }, [mobile]);
  useEffect(() => { overrideRef.current = override; }, [override]);

  useEffect(() => {
    const pos = {
      x: snap(Math.max(8, window.innerWidth - 120)),
      y: snap(Math.max(96, window.innerHeight - 150)),
    };
    let target = { ...pos };
    let mode = "idle";
    let until = performance.now() + rand(1400, 2400);
    let followUntil = 0;
    let danceUntil = 0;
    let last = performance.now();
    let raf = 0;

    function applyAnim(name) {
      if (animRef.current !== name) {
        animRef.current = name;
        setAnim(name);
      }
    }

    function applyFacing(dir) {
      if (facingRef.current !== dir) {
        facingRef.current = dir;
        setFacing(dir);
      }
    }

    function place() {
      if (!elRef.current) return;
      elRef.current.style.transform = `translate3d(${snap(pos.x)}px, ${snap(pos.y)}px, 0)`;
    }

    function clampTarget(point) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const narrow = mobileRef.current;
      const minY = narrow ? vh * 0.7 : 96;
      const maxY = vh - 128;
      return {
        x: snap(Math.max(8, Math.min(vw - 104, point.x))),
        y: snap(Math.max(minY, Math.min(maxY, point.y))),
      };
    }

    function blocked(x, y) {
      const el = document.elementFromPoint(x + 24, y + 24);
      return Boolean(el && el.closest("button, input, textarea, a, select"));
    }

    function pickWalk() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const next = clampTarget({
          x: rand(16, vw - 104),
          y: rand(mobileRef.current ? vh * 0.72 : 120, vh - 130),
        });
        if (!blocked(next.x, next.y) || attempt === 5) {
          target = next;
          break;
        }
      }
      mode = "walk";
    }

    function pickSit() {
      const bars = [...document.querySelectorAll(".px-title")];
      const visible = bars.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom > 90 && rect.top < window.innerHeight - 20 && rect.width > 48;
      });
      if (!visible.length || mobileRef.current) {
        pickWalk();
        return;
      }
      const rect = visible[Math.floor(Math.random() * visible.length)].getBoundingClientRect();
      target = clampTarget({ x: rect.left + 20, y: rect.top - 64 });
      mode = "walk";
    }

    function onMouse(event) {
      mouseRef.current = { x: event.clientX, y: event.clientY, t: performance.now() };
    }

    function onDance() {
      danceUntil = performance.now() + 2000;
    }

    function onWalkTo(event) {
      const id = event.detail?.id;
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      target = clampTarget({ x: rect.left + 32, y: rect.top + 72 });
      mode = "walk";
      until = 0;
    }

    function onFocusIn(event) {
      const tag = event.target?.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA") return;
      const box = event.target.getBoundingClientRect();
      const side = box.left > window.innerWidth / 2 ? 12 : window.innerWidth - 104;
      target = clampTarget({ x: side, y: window.innerHeight - 130 });
      mode = "walk";
      followUntil = 0;
    }

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("ali:dance", onDance);
    window.addEventListener("ali:walk-to", onWalkTo);
    window.addEventListener("focusin", onFocusIn);

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const mouseIdle = now - mouseRef.current.t;

      if (reducedRef.current) {
        const parked = clampTarget({ x: window.innerWidth - 104, y: window.innerHeight - 130 });
        pos.x = parked.x;
        pos.y = parked.y;
        applyAnim(overrideRef.current || "idle");
        place();
        raf = requestAnimationFrame(tick);
        return;
      }

      if (danceUntil > now) {
        applyAnim("dance");
        place();
        raf = requestAnimationFrame(tick);
        return;
      }

      if (!hiddenRef.current && mouseIdle > 20000 && !pausedRef.current && mode !== "follow") {
        applyAnim("sleep");
        place();
        raf = requestAnimationFrame(tick);
        return;
      }

      if (pausedRef.current || hiddenRef.current) {
        const dx = mouseRef.current.x - pos.x;
        if (Math.abs(dx) > 12) applyFacing(dx < 0 ? "left" : "right");
        applyAnim(overrideRef.current || "idle");
        place();
        raf = requestAnimationFrame(tick);
        return;
      }

      if (mode === "follow") {
        if (mobileRef.current || now > followUntil) {
          mode = "idle";
          until = now + rand(800, 1500);
        } else {
          target = clampTarget({ x: mouseRef.current.x - 40, y: mouseRef.current.y - 28 });
        }
      }

      if (mode === "idle" && now > until) {
        const roll = Math.random();
        if (roll < 0.14 && !mobileRef.current) {
          mode = "follow";
          followUntil = now + rand(3000, 5000);
        } else if (roll < 0.32) {
          pickSit();
        } else if (roll < 0.42) {
          target = clampTarget({
            x: Math.random() < 0.5 ? 8 : window.innerWidth - 104,
            y: rand(140, window.innerHeight - 130),
          });
          mode = "walk";
        } else {
          pickWalk();
        }
      }

      if (mode === "walk" || mode === "follow") {
        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 6) {
          mode = "idle";
          until = now + rand(2000, 4000);
          applyAnim("idle");
        } else {
          const step = Math.min(dist, SPEED * dt);
          pos.x += (dx / dist) * step;
          pos.y += (dy / dist) * step;
          if (Math.abs(dx) > 2) applyFacing(dx < 0 ? "left" : "right");
          applyAnim(dx < 0 ? "walkL" : "walkR");
        }
      } else {
        applyAnim(overrideRef.current || "idle");
      }

      place();
      raf = requestAnimationFrame(tick);
    }

    place();
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("ali:dance", onDance);
      window.removeEventListener("ali:walk-to", onWalkTo);
      window.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  return { elRef, anim, facing };
}
