import PixelWindow from "./PixelWindow";
import PixelButton from "./PixelButton";
import Chip from "./Chip";
import ProjectThumb, { thumbKind } from "./ProjectThumb";
import { cleanText } from "../text";

function Soon({ children }) {
  return <span className="px-btn" aria-disabled="true">{children}</span>;
}

export default function ProjectCard({ project, onOpen }) {
  const title = cleanText(project.title, "New project");
  const file = `${title.replace(/[^a-z0-9]+/gi, "").toUpperCase() || "NEW"}.APP`;
  const description = cleanText(project.description, "Details coming soon.");

  return (
    <PixelWindow title={file} titleAs="p" className="card is-lift">
      <div className="card-thumb">
        <ProjectThumb kind={thumbKind(project)} />
      </div>
      <Chip>{project.category}</Chip>
      <h3>{title}</h3>
      <p className="clamp">{description}</p>
      <div className="chips">
        {(project.tech || []).map((tech) => (
          <Chip key={tech}>{tech}</Chip>
        ))}
      </div>
      <div className="card-actions">
        {project.live ? (
          <PixelButton href={project.live} target="_blank" rel="noreferrer">Live</PixelButton>
        ) : (
          <Soon>Soon</Soon>
        )}
        {project.code ? (
          <PixelButton href={project.code} variant="secondary" target="_blank" rel="noreferrer">Code</PixelButton>
        ) : (
          <Soon>Soon</Soon>
        )}
        <PixelButton variant="secondary" onClick={() => onOpen(project)}>Info</PixelButton>
      </div>
    </PixelWindow>
  );
}
