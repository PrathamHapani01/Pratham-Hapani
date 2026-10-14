import { cleanText } from "../text";

export default function Marquee({ skills }) {
  const names = Object.values(skills || {})
    .flat()
    .map((skill) => cleanText(skill.name))
    .filter(Boolean);
  if (!names.length) return null;
  const loop = [...names, ...names];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {loop.map((name, index) => (
          <span key={`${name}-${index}`}>{name.toUpperCase()}</span>
        ))}
      </div>
    </div>
  );
}
