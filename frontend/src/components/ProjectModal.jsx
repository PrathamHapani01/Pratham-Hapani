import { useEffect, useRef } from "react";
import PixelWindow from "./PixelWindow";
import Chip from "./Chip";
import PixelButton from "./PixelButton";
import { cleanText } from "../text";

export default function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (previous && previous.focus) previous.focus();
    };
  }, [onClose]);

  const title = cleanText(project.title, "Project");
  const details = cleanText(project.details, cleanText(project.description, "More details coming soon."));
  const hasLive = Boolean(project.live);
  const hasCode = Boolean(project.code);

  return (
    <div className="modal-back" onMouseDown={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <PixelWindow title="PROJECT.VIEW" titleAs="p" onClose={onClose}>
          <div className="modal-copy">
            <img
              className="thumb"
              src={project.image || "/projects/placeholder.png"}
              alt=""
              onError={(event) => {
                event.currentTarget.src = "/projects/placeholder.png";
              }}
            />
            <h2 id="project-title" className="project-modal-title">{title}</h2>
            <p>{details}</p>
            <div className="chip-row">
              {(project.tech || []).map((tech) => (
                <Chip key={tech}>{tech}</Chip>
              ))}
            </div>
            <div className="btn-row">
              {hasLive ? (
                <PixelButton href={project.live} target="_blank" rel="noreferrer">Live</PixelButton>
              ) : (
                <span className="px-btn" aria-disabled="true">Soon</span>
              )}
              {hasCode ? (
                <PixelButton href={project.code} variant="secondary" target="_blank" rel="noreferrer">Code</PixelButton>
              ) : (
                <span className="px-btn secondary" aria-disabled="true">Soon</span>
              )}
              <button ref={closeRef} type="button" className="px-btn secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </PixelWindow>
      </div>
    </div>
  );
}
