import { useCallback, useEffect, useRef, useState } from "react";
import { createAli } from "../../aliSprite";
import { sendChat } from "../../api/client";
import { blip } from "../../sound";

const DEFAULT_SUGGESTIONS = ["Who is Pratham?", "Show projects", "How to hire?"];

const DEFAULT_REPLIES = {
  "Who is Pratham?": "A backend dev who builds APIs and AI features. Nice to meet you!",
  "Show projects": "CafeOS and SplitTab are the big ones. Scroll down to Projects!",
  "How to hire?": "Use the contact form at the bottom. He replies fast!",
};

export default function Mascot({ hidden, section: _section, theme: _theme, reduced }) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState("idle");
  const [dir, setDir] = useState(1);
  const [showDot, setShowDot] = useState(true);
  const [bubbleText, setBubbleText] = useState("");
  const [shownCount, setShownCount] = useState(0);
  const [bubbleVariant, setBubbleVariant] = useState("speech");
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const canvasRef = useRef(null);
  const aliInstanceRef = useRef(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const typingTimerRef = useRef(null);
  const historyRef = useRef([]);

  const hoverRef = useRef(hover);
  hoverRef.current = hover;
  const openRef = useRef(open);
  openRef.current = open;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const stateRef = useRef(state);
  stateRef.current = state;
  const dirRef = useRef(dir);
  dirRef.current = dir;

  // The canvas is not in the DOM while Ali is hidden, so this must re-run
  // when the node actually mounts. Otherwise the sprite stays a blank canvas.
  const bindCanvas = useCallback((node) => {
    canvasRef.current = node;
    setCanvasReady(Boolean(node));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const instance = createAli(canvas, {
      state: stateRef.current,
      dir: dirRef.current,
      reduced,
    });
    aliInstanceRef.current = instance;
    return () => {
      instance.destroy();
      if (aliInstanceRef.current === instance) aliInstanceRef.current = null;
    };
  }, [reduced, canvasReady]);

  // Sync state to Ali sprite
  useEffect(() => {
    if (aliInstanceRef.current) {
      aliInstanceRef.current.setState(state);
    }
  }, [state]);

  // Sync direction to Ali sprite
  useEffect(() => {
    if (aliInstanceRef.current) {
      aliInstanceRef.current.setDir(dir);
    }
  }, [dir]);

  // Typewriter effect for speech bubble text
  useEffect(() => {
    if (!open || !bubbleText) {
      setShownCount(0);
      return undefined;
    }
    setShownCount(0);
    setState("talk");
    let count = 0;
    const interval = window.setInterval(() => {
      count += 1;
      setShownCount(count);
      if (count >= bubbleText.length) {
        window.clearInterval(interval);
        setState("idle");
      }
    }, 28);
    return () => window.clearInterval(interval);
  }, [open, bubbleText]);

  // Roaming loop along the bottom of the viewport.
  // State is updated only when the pose changes — setting it every frame
  // re-renders the canvas and wipes the sprite before it can paint.
  useEffect(() => {
    let x = 40;
    let target = Math.min(300, window.innerWidth - 140);
    let pause = 1.2;
    let lastT = performance.now();
    let raf = 0;
    let mode = "idle";
    let facing = 1;

    function setMode(next) {
      if (mode === next) return;
      mode = next;
      setState(next);
    }

    function setFacing(next) {
      if (facing === next) return;
      facing = next;
      setDir(next);
    }

    function roam(now) {
      raf = requestAnimationFrame(roam);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      if (hoverRef.current || openRef.current || reducedRef.current) {
        return;
      }

      if (pause > 0) {
        pause -= dt;
        setMode("idle");
        if (pause <= 0) {
          const maxTarget = Math.max(60, window.innerWidth - 140);
          target = 40 + Math.random() * (maxTarget - 40);
        }
        return;
      }

      const d = target - x;
      if (Math.abs(d) < 4) {
        pause = 2 + Math.random() * 3;
        setMode("idle");
        return;
      }

      setMode("walk");
      setFacing(d > 0 ? 1 : -1);
      x += Math.sign(d) * 70 * dt;
      if (wrapRef.current) {
        wrapRef.current.style.left = `${Math.round(x / 4) * 4}px`;
      }
    }

    if (!reduced) {
      raf = requestAnimationFrame(roam);
    } else if (wrapRef.current) {
      wrapRef.current.style.left = "40px";
    }

    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Close on Escape key
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && open) {
        setOpen(false);
        setState("idle");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Listen for desk scene hot events or announcements
  useEffect(() => {
    function onSay(event) {
      const text = event.detail?.text || "Delivered!";
      setShowDot(false);
      setOpen(true);
      setBubbleVariant(event.detail?.variant || "speech");
      setBubbleText(text);
      setSuggestions([]);
    }
    function onHot(event) {
      if (open) return;
      const text = event.detail?.text;
      if (!text) return;
      setShowDot(false);
      setOpen(true);
      setBubbleVariant("speech");
      setBubbleText(text);
      setSuggestions([]);
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = window.setTimeout(() => {
        setOpen(false);
        setState("idle");
      }, 3500);
    }
    function onDance() {
      setState("dance");
      window.setTimeout(() => setState("idle"), 2500);
    }

    window.addEventListener("ali:say", onSay);
    window.addEventListener("ali:hot", onHot);
    window.addEventListener("ali:dance", onDance);
    return () => {
      window.removeEventListener("ali:say", onSay);
      window.removeEventListener("ali:hot", onHot);
      window.removeEventListener("ali:dance", onDance);
    };
  }, [open]);

  function openChat() {
    blip("pop");
    setShowDot(false);
    setOpen(true);
    setBubbleVariant("speech");
    setBubbleText("Hi! I am Ali. Ask me anything about Pratham!");
    setSuggestions(DEFAULT_SUGGESTIONS);
  }

  async function ask(query) {
    const text = query.trim();
    if (!text) return;
    setDraft("");
    setShowDot(false);
    setOpen(true);

    if (DEFAULT_REPLIES[text]) {
      setBubbleVariant("speech");
      setBubbleText(DEFAULT_REPLIES[text]);
      setSuggestions(DEFAULT_SUGGESTIONS.filter((s) => s !== text));
      return;
    }

    setIsThinking(true);
    setBubbleVariant("thought");
    setBubbleText("Thinking...");
    setState("think");

    try {
      const data = await sendChat({
        message: text,
        history: historyRef.current.slice(-6),
        section: "",
      });
      historyRef.current = [
        ...historyRef.current,
        { role: "user", content: text },
        { role: "assistant", content: data.reply },
      ].slice(-6);
      setIsThinking(false);
      setBubbleVariant("speech");
      setBubbleText(data.reply);
      setSuggestions(data.suggestions?.length ? data.suggestions.slice(0, 3) : DEFAULT_SUGGESTIONS);
      if (data.mood === "thinking") setState("think");
      else if (data.mood === "surprised") setState("surprised");
      else if (data.mood === "wave") setState("dance");
      else setState("talk");
    } catch {
      setIsThinking(false);
      setBubbleVariant("shout");
      setBubbleText("My brain is rebooting... try asking one of the quick buttons!");
      setSuggestions(DEFAULT_SUGGESTIONS);
      setState("surprised");
    }
  }

  if (hidden) return null;

  const shownText = bubbleText.slice(0, shownCount);

  return (
    <div
      className="ali"
      ref={wrapRef}
      id="ali"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '24px',
        zIndex: 9999,
        width: '96px',
        height: '120px',
        pointerEvents: 'none',
      }}
    >
      {open ? (
        <div
          className={`ali-bubble${bubbleVariant === "thought" ? " is-thought" : bubbleVariant === "shout" ? " is-shout" : ""}`}
          role="status"
          aria-live="polite"
        >
          <div className="ali-bubble-text">{shownText}</div>
          {suggestions.length > 0 && !isThinking ? (
            <div className="ali-chips">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    ask(suggestion);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}
          <form
            className="ali-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              ask(draft);
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything..."
              aria-label="Ask Ali a question"
            />
            <button type="submit">SEND</button>
          </form>
        </div>
      ) : null}

      <button
        ref={btnRef}
        type="button"
        className="ali-btn"
        id="alibtn"
        aria-label="Ask Ali, the portfolio assistant"
        aria-expanded={open}
        style={{
          pointerEvents: 'auto',
          display: 'block',
          width: '96px',
          height: '120px',
          padding: 0,
          border: 0,
          background: 'none',
          cursor: 'pointer',
          position: 'relative',
        }}
        onPointerEnter={() => {
          setHover(true);
          if (!open) setState("surprised");
        }}
        onPointerLeave={() => {
          setHover(false);
          if (!open) setState("idle");
        }}
        onClick={() => {
          if (open) {
            setOpen(false);
            setState("idle");
          } else {
            openChat();
          }
        }}
        onDoubleClick={() => {
          setState("dance");
          window.setTimeout(() => setState("idle"), 2000);
        }}
      >
        <canvas ref={bindCanvas} aria-hidden="true" style={{ width: '96px', height: '120px', imageRendering: 'pixelated', display: 'block' }} />
        {showDot ? <span className="ali-dot" aria-hidden="true" /> : null}
      </button>
    </div>
  );
}
