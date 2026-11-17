import { useEffect, useState } from "react";
import PixelWindow from "./PixelWindow";

const BOOT_LINES = [
  "BOOT> PIXEL OS v1.0",
  "INIT> waking Ali...",
  "LOAD> sprite sheets",
  "SPIN> backend server (cold start)",
  "BREW> pixel coffee",
  "SYNC> resume docs",
  "MAP> projects & skills",
  "READY> almost there...",
];

const TIPS = [
  "Ali only chats about Pratham — ask him anything resume-related.",
  "Try the Konami code later. Ali might dance.",
  "Peach or blue theme? Flip it in the navbar.",
  "Backend waking up from sleep… hang tight.",
];

function PixelAli() {
  return (
    <div className="load-ali" aria-hidden="true">
      <div className="load-ali-body">
        <span className="load-ali-eye" />
        <span className="load-ali-eye" />
      </div>
      <div className="load-ali-feet">
        <span />
        <span />
      </div>
    </div>
  );
}

export default function CreativeLoading() {
  const [lineIndex, setLineIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(8);
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const boot = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % BOOT_LINES.length);
      setTicks((t) => t + 1);
    }, 900);
    const tip = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 3200);
    const bar = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return 88 + Math.random() * 4;
        return Math.min(92, p + 3 + Math.random() * 6);
      });
    }, 700);
    return () => {
      window.clearInterval(boot);
      window.clearInterval(tip);
      window.clearInterval(bar);
    };
  }, []);

  const visibleLines = BOOT_LINES.slice(0, Math.min(lineIndex + 1, BOOT_LINES.length));

  return (
    <div className="loading-wrap load-stage">
      <div className="load-scan" aria-hidden="true" />
      <PixelWindow title="BOOT.EXE" titleAs="p" className="load-window">
        <div className="load-body">
          <div className="load-hero">
            <PixelAli />
            <div className="load-copy">
              <p className="load-title">Waking the portfolio…</p>
              <p className="load-sub">
                Server boot can take a moment after idle. Ali is stretching his pixels.
              </p>
            </div>
          </div>

          <div className="load-terminal" aria-live="polite">
            {visibleLines.map((line) => (
              <p key={line} className="load-line">
                {line}
              </p>
            ))}
            <p className="load-line load-cursor">
              {BOOT_LINES[lineIndex]}
              <span className="load-blink">▌</span>
            </p>
          </div>

          <div className="load-bar-wrap" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
            <div className="load-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="load-pct">{Math.round(progress)}% · frame {ticks}</p>

          <p className="load-tip" key={tipIndex}>
            TIP · {TIPS[tipIndex]}
          </p>
        </div>
      </PixelWindow>
    </div>
  );
}
