import { useState } from "react";
import PixelWindow from "../components/PixelWindow";
import ProjectCard from "../components/ProjectCard";

const FILTERS = ["All", "Backend", "AI", "SaaS", "Tools"];

export default function Projects({ projects, onOpen }) {
  const [filter, setFilter] = useState("All");
  const list = (projects || []).filter((project) => filter === "All" || project.category === filter);

  return (
    <section id="projects" className="section">
      <PixelWindow title="PROJECTS/">
        <div className="filter-row" role="toolbar" aria-label="Filter projects">
          {FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              className={`chip${filter === name ? " is-active" : ""}`}
              aria-pressed={filter === name}
              onClick={() => setFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>
        {list.length ? (
          <div className="projects-grid">
            {list.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={onOpen} />
            ))}
          </div>
        ) : (
          <p className="empty-note">NO PROJECTS IN THIS FOLDER.</p>
        )}
      </PixelWindow>
    </section>
  );
}
