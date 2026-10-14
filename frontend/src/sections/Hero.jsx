import { useEffect, useState } from "react";
import PixelWindow from "../components/PixelWindow";
import PixelButton from "../components/PixelButton";
import PixelScene from "../components/PixelScene";
import { cleanText } from "../text";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useRef } from "react";
import { createNameFX } from "../nameFX";

const HOT_LINES = {
  cat: "Shh, he's sleeping!",
  monitor: "That's real code. Mostly.",
  coffee: "Caffeine = commits.",
};

function useTypedRoles(roles, reduced) {
  const [text, setText] = useState(roles[0] || "");
  const key = roles.join("|");

  useEffect(() => {
    const list = key ? key.split("|") : [];
    if (!list.length) return undefined;
    if (reduced) {
      setText(list[0]);
      return undefined;
    }
    let index = 0;
    let cursor = 0;
    let mode = "type";
    let hold = 0;
    let timer = 0;
    function tick() {
      const word = list[index];
      let delay = 90;
      if (mode === "type") {
        cursor += 1;
        setText(word.slice(0, cursor));
        if (cursor >= word.length) {
          mode = "hold";
          hold = 13;
        }
      } else if (mode === "hold") {
        hold -= 1;
        delay = 90;
        if (hold <= 0) mode = "delete";
      } else {
        cursor -= 1;
        delay = 40;
        setText(word.slice(0, Math.max(0, cursor)));
        if (cursor <= 0) {
          index = (index + 1) % list.length;
          mode = "type";
          delay = 90;
        }
      }
      timer = window.setTimeout(tick, delay);
    }
    timer = window.setTimeout(tick, 90);
    return () => window.clearTimeout(timer);
  }, [key, reduced]);

  return text;
}

function Stat({ label, value, run }) {
  const numeric = Number(value);
  const countable = Number.isFinite(numeric);
  const [shown, setShown] = useState(countable ? 0 : value);

  useEffect(() => {
    if (!run || !countable) return undefined;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setShown(current);
      if (current >= numeric) clearInterval(id);
    }, 90);
    return () => clearInterval(id);
  }, [run, countable, numeric]);

  return (
    <div className="stat">
      <b>{shown}</b>
      <small>{label}</small>
    </div>
  );
}

export default function Hero({ profile, theme }) {
  const reduced = useReducedMotion();
  const statsRef = useRef(null);
  const nameFxHostRef = useRef(null);
  const nameFxRef = useRef(null);
  const statsSeen = useInView(statsRef);
  const roles = (profile.roles || [profile.title])
    .map((role) => cleanText(role))
    .filter(Boolean)
    .map((role) => role.toUpperCase());
  const typed = useTypedRoles(roles, reduced);
  const name = profile.name || "Pratham";
  const words = name.trim().split(/\s+/);
  const totalLetters = words.reduce((sum, word) => sum + word.length, 0);

  const [revealedLetters, setRevealedLetters] = useState(() => (reduced ? totalLetters : 0));
  const [isTypingName, setIsTypingName] = useState(() => !reduced);
  const [isGlitching, setIsGlitching] = useState(false);

  // Typewriter effect for revealing the name "Pratham"
  useEffect(() => {
    if (reduced) {
      setRevealedLetters(totalLetters);
      setIsTypingName(false);
      return undefined;
    }
    setRevealedLetters(0);
    setIsTypingName(true);
    let count = 0;
    const interval = window.setInterval(() => {
      count += 1;
      setRevealedLetters(count);
      if (count >= totalLetters) {
        setIsTypingName(false);
        window.clearInterval(interval);
      }
    }, 90);
    return () => window.clearInterval(interval);
  }, [name, totalLetters, reduced]);

  // Name FX canvas (orbiting golden crystals, code glyphs, lightning, rocket)
  useEffect(() => {
    const host = nameFxHostRef.current;
    if (!host) return undefined;
    const fx = createNameFX(host, {
      theme,
      reduced,
      onGlitch: () => {
        setIsGlitching(true);
        window.setTimeout(() => setIsGlitching(false), 300);
      },
    });
    nameFxRef.current = fx;
    return () => {
      fx.destroy();
      nameFxRef.current = null;
    };
  }, [reduced, theme]);

  let letterIndex = 0;
  const stats = (profile.stats || []).filter((stat) => cleanText(stat.value));

  function onHot(hot) {
    const text = HOT_LINES[hot];
    if (!text) return;
    window.dispatchEvent(new CustomEvent("ali:hot", { detail: { text } }));
  }

  const scene = (
    <PixelWindow title="WORKSTATION.EXE" titleAs="p" className="scene-wrap">
      <PixelScene theme={theme} onHot={onHot} reduced={reduced} />
      <p className="scene-hint">HOVER THE DESK. CLICK THE CAT, COFFEE, OR WINDOW.</p>
    </PixelWindow>
  );

  return (
    <section id="home" className="section">
      <div className="hero">
        <div>
          <p className="hero-kicker">
            PORTFOLIO.EXE{profile.open_to_work ? " · OPEN TO WORK" : ""}
          </p>
          <div className="name-fx" ref={nameFxHostRef} id="namefx">
            <h1
              className={`hero-name${isGlitching ? " glitch" : ""}`}
              aria-label={name}
              id="name"
            >
              {words.map((word, wordIndex) => (
                <span className="hero-word" key={`${word}-${wordIndex}`} aria-hidden="true">
                  {wordIndex > 0 ? <br /> : null}
                  {[...word].map((ch) => {
                    const i = letterIndex;
                    letterIndex += 1;
                    const isRevealed = i < revealedLetters;
                    return (
                      <span
                        key={`${word}-${i}`}
                        style={{
                          "--i": i,
                          visibility: isRevealed ? "visible" : "hidden",
                          opacity: isRevealed ? 1 : 0,
                        }}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </span>
              ))}
              {isTypingName && (
                <span className="caret name-caret" aria-hidden="true" />
              )}
            </h1>
          </div>
          <p className="hero-role" aria-live="polite">
            {typed}
            <span className="caret" aria-hidden="true" />
          </p>
          <div className="hero-cta">
            <PixelButton href="#projects">View Projects</PixelButton>
            <PixelButton href="#contact" variant="secondary">Hire Me</PixelButton>
          </div>
          <div className="hero-stats" ref={statsRef}>
            {stats.map((stat) => (
              <Stat key={stat.label} label={stat.label} value={stat.value} run={statsSeen} />
            ))}
          </div>
        </div>
        {theme === "blue" ? <div className="crt-bezel scene-crt">{scene}</div> : scene}
      </div>
    </section>
  );
}
