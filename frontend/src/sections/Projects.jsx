import PixelWindow from "../components/PixelWindow";
import ProjectCard from "../components/ProjectCard";

export default function Projects({ projects, onOpen }) {
  const list = projects || [];

  return (
    <section id="projects" className="section">
      <PixelWindow title="PROJECTS/">
        <p className="prose">My GitHub account is temporarily inactive. I am trying to fix it.</p>
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
