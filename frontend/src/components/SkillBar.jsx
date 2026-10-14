import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";

export default function SkillBar({ name, level }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  const safe = Math.max(0, Math.min(10, Number(level) || 0));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (seen) setReady(true);
  }, [seen]);

  return (
    <div className={`skill${ready ? " in-view" : ""}`} ref={ref}>
      <span className="skill-name">{name.toUpperCase()}</span>
      <span className="skill-bar" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} className={i < safe ? "on" : ""} style={{ "--n": i }} />
        ))}
      </span>
      <span className="skill-lvl">{safe}</span>
      <span className="sr-only">{`${name}: ${safe} out of 10`}</span>
    </div>
  );
}
