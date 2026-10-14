import { useState } from "react";

export default function PixelWindow({ title, children, className = "", titleAs = "h2" }) {
  const [open, setOpen] = useState(true);
  const Title = titleAs;

  return (
    <div className={`px-window ${className}`.trim()}>
      <div className="px-title">
        <Title className="px-title-text">{title}</Title>
        <div className="px-title-dots">
          <button type="button" className="px-dot" aria-label="Minimize window" onClick={() => setOpen(false)}>–</button>
          <button type="button" className="px-dot" aria-label="Restore window" onClick={() => setOpen(true)}>□</button>
          <button type="button" className="px-dot" aria-label="Close window" onClick={() => setOpen(false)}>×</button>
        </div>
      </div>
      {open ? <div className="px-body">{children}</div> : null}
    </div>
  );
}
