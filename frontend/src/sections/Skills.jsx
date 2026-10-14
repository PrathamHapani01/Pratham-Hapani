import { useState } from "react";
import PixelWindow from "../components/PixelWindow";
import SkillBar from "../components/SkillBar";

const ORDER = ["Backend", "Databases", "DevOps", "AI/ML", "Tools"];

export default function Skills({ skills }) {
  const names = ORDER.filter((name) => skills?.[name]).concat(
    Object.keys(skills || {}).filter((name) => !ORDER.includes(name)),
  );
  const [tab, setTab] = useState(names[0] || "Backend");
  const items = skills?.[tab] || [];

  return (
    <section id="skills" className="section">
      <PixelWindow title="SKILLS.DAT">
        <div className="tabs" role="tablist" aria-label="Skill categories">
          {names.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              className={`chip${tab === name ? " is-active" : ""}`}
              aria-selected={tab === name}
              onClick={() => setTab(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="skill-list" role="tabpanel">
          {items.map((skill) => (
            <SkillBar key={skill.name} name={skill.name} level={skill.level} />
          ))}
        </div>
      </PixelWindow>
    </section>
  );
}
