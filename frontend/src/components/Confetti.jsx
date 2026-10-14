import { useEffect, useState } from "react";

export default function Confetti() {
  const [bits, setBits] = useState([]);

  useEffect(() => {
    function onGo() {
      const next = Array.from({ length: 12 }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        left: `${8 + Math.random() * 84}%`,
        color: i % 2 === 0 ? "var(--accent)" : "var(--ink)",
        delay: `${i * 20}ms`,
      }));
      setBits(next);
      window.setTimeout(() => setBits([]), 900);
    }
    window.addEventListener("pixel-confetti", onGo);
    return () => window.removeEventListener("pixel-confetti", onGo);
  }, []);

  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((bit) => (
        <i key={bit.id} style={{ left: bit.left, background: bit.color, animationDelay: bit.delay }} />
      ))}
    </div>
  );
}
