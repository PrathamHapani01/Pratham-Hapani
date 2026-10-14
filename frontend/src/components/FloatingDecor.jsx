const BITS = [
  { kind: "cloud", top: "12%", left: "6%", delay: "0s" },
  { kind: "star", top: "22%", left: "78%", delay: "0.4s" },
  { kind: "coin", top: "40%", left: "90%", delay: "0.8s" },
  { kind: "heart", top: "58%", left: "4%", delay: "0.2s" },
  { kind: "cloud", top: "70%", left: "84%", delay: "1s" },
  { kind: "star", top: "30%", left: "14%", delay: "1.2s" },
  { kind: "coin", top: "80%", left: "20%", delay: "0.6s" },
  { kind: "heart", top: "16%", left: "48%", delay: "1.4s" },
];

export default function FloatingDecor({ reduced }) {
  if (reduced) return null;
  return (
    <div className="floater-layer" aria-hidden="true">
      {BITS.map((bit, i) => (
        <span key={i} className={`floater ${bit.kind}`} style={{ top: bit.top, left: bit.left, animationDelay: bit.delay }} />
      ))}
    </div>
  );
}
