import { useState } from "react";
import PixelIcon from "./PixelIcon";
import ThemeToggle from "./ThemeToggle";
import { blip, setSoundEnabled } from "../sound";

const LINKS = [
  ["home", "HOME"],
  ["about", "ABOUT"],
  ["skills", "SKILLS"],
  ["projects", "PROJECTS"],
  ["experience", "EXPERIENCE"],
  ["contact", "CONTACT"],
];

export default function Navbar({ theme, onToggleTheme, soundOn, onToggleSound, section }) {
  const [open, setOpen] = useState(false);

  function go() {
    setOpen(false);
    blip("click");
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundEnabled(next);
    onToggleSound(next);
    if (next) blip("pop");
  }

  return (
    <header className={`nav${open ? " is-open" : ""}`}>
      <a className="nav-brand keep" href="#home" onClick={go}>
        <img className="nav-face" src="/sprites/avatar.png" alt="" width="28" height="28" />
        PRATHAM
      </a>
      <button
        type="button"
        className="nav-burger"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
      <ul className="nav-links">
        {LINKS.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={section === id ? "page" : undefined} onClick={go}>
              {label}
            </a>
          </li>
        ))}
      </ul>
      <div className="nav-tools">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          type="button"
          className="px-btn icon-btn is-ghost"
          aria-pressed={soundOn}
          aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
          onClick={toggleSound}
        >
          <PixelIcon name={soundOn ? "sound" : "mute"} />
        </button>
      </div>
    </header>
  );
}
