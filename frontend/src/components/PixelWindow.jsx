import { useState } from "react";

export default function PixelWindow({ title, children, className = "", titleAs = "h2", onClose }) {
  const [open, setOpen] = useState(true);
  const Title = titleAs;

  function handleClose() {
    if (onClose) onClose();
    else setOpen(false);
  }

  return (
    <div className={`px-window ${className}`.trim()}>
      <div className="px-title">
        <Title className="px-title-text">{title}</Title>
        <div className="px-title-dots">
          <button type="button" className="px-dot" aria-label="Minimize window" onClick={() => setOpen(false)}>–</button>
          <button type="button" className="px-dot" aria-label="Restore window" onClick={() => setOpen(true)}>□</button>
          <button type="button" className="px-dot" aria-label="Close window" onClick={handleClose}>×</button>
        </div>
      </div>
      {open ? <div className="px-body">{children}</div> : null}
    </div>
  );
}
