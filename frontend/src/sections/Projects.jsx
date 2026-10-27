import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PixelWindow from "../components/PixelWindow";
import PixelButton from "../components/PixelButton";
import Chip from "../components/Chip";
import ProjectThumb, { thumbKind } from "../components/ProjectThumb";
import { cleanText } from "../text";
import "./projects-carousel.css";

const SWIPE_THRESHOLD = 40;
const VISIBLE_SPAN = 2;
const AUTO_MS = 4200;

function wrapOffset(index, selected, total) {
  if (!total) return 0;
  let diff = index - selected;
  const half = Math.floor(total / 2);
  if (diff > half) diff -= total;
  if (diff < -half) diff += total;
  return diff;
}

function fileName(title) {
  return `${String(title).replace(/[^a-z0-9]+/gi, "").toUpperCase() || "NEW"}.APP`;
}

function buildDeck(projects) {
  const real = (projects || []).map((project) => {
    const title = cleanText(project.title, "New project");
    const description = cleanText(project.description, "Details coming soon.");
    const details = cleanText(project.details, description);
    return {
      ...project,
      kind: "project",
      title,
      description,
      details,
      category: cleanText(project.category, "Backend"),
      tech: project.tech || [],
      live: project.live || "",
      code: project.code || "",
      file: fileName(title),
    };
  });

  return [
    ...real,
    {
      id: "__next-project",
      kind: "soon",
      title: "Next project / coming soon",
      description: "A new backend project is in progress.",
      details: "A new backend project is in progress. Links will show up here when it ships.",
      category: "Soon",
      tech: [],
      live: "",
      code: "",
      file: "NEXT.APP",
    },
    {
      id: "__your-idea",
      kind: "idea",
      title: "Your idea here",
      description: "Got a product idea? Let's build the backend together.",
      details: "Got a product idea? Let's build the backend together. Jump to contact and say hi.",
      category: "Hire",
      tech: ["Python", "FastAPI"],
      live: "",
      code: "",
      file: "IDEA.APP",
      ctaHref: "#contact",
    },
  ];
}

export default function Projects({ projects, onOpen }) {
  const deck = useMemo(() => buildDeck(projects), [projects]);
  const total = deck.length;
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef(null);
  const selectedRef = useRef(0);
  const touchRef = useRef({ x: 0, y: 0, active: false });

  selectedRef.current = selected;

  const goTo = useCallback((index) => {
    if (!total) return;
    setSelected(((index % total) + total) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    goTo(selectedRef.current - 1);
  }, [goTo]);

  const goNext = useCallback(() => {
    goTo(selectedRef.current + 1);
  }, [goTo]);

  useEffect(() => {
    if (selected >= total && total > 0) setSelected(0);
  }, [selected, total]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return undefined;
    function onKey(event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  useEffect(() => {
    if (paused || total < 2) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;
    const id = window.setInterval(() => {
      goNext();
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, total, goNext]);

  function onPointerDown(event) {
    if (event.target.closest(".projects-fan-nav")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    touchRef.current = { x: event.clientX, y: event.clientY, active: true };
  }

  function onPointerUp(event) {
    if (!touchRef.current.active) return;
    const dx = event.clientX - touchRef.current.x;
    const dy = event.clientY - touchRef.current.y;
    touchRef.current.active = false;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNext();
    else goPrev();
  }

  function onPointerCancel() {
    touchRef.current.active = false;
  }

  if (!total) {
    return (
      <section id="projects" className="section">
        <PixelWindow title="PROJECTS/">
          <p className="empty-note">NO PROJECTS IN THIS FOLDER.</p>
        </PixelWindow>
      </section>
    );
  }

  const current = deck[selected] || deck[0];
  const hasLinks = Boolean(current.live || current.code);

  return (
    <section id="projects" className="section">
      <PixelWindow title="PROJECTS/">
        <div className="projects-fan">
          <p className="prose projects-fan-note">
            My GitHub account is temporarily inactive. I am trying to fix it.
          </p>

          <div
            className="projects-fan-stage"
            ref={stageRef}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Project carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
            }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            <button
              type="button"
              className="projects-fan-nav prev"
              aria-label="Previous project"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
            >
              <span aria-hidden="true">◀</span>
            </button>

            <div className="projects-fan-track">
              {deck.map((card, index) => {
                const off = wrapOffset(index, selected, total);
                const abs = Math.abs(off);
                const hidden = abs > VISIBLE_SPAN;
                const active = index === selected;
                return (
                  <article
                    key={card.id}
                    className={`projects-fan-card${active ? " is-active" : ""}`}
                    style={{
                      "--off": String(off),
                      "--abs": String(abs),
                    }}
                    data-hidden={hidden ? "true" : "false"}
                    aria-hidden={active ? undefined : true}
                    aria-current={active ? "true" : undefined}
                  >
                    <button
                      type="button"
                      className="projects-fan-hit"
                      tabIndex={0}
                      aria-label={
                        active
                          ? (card.kind === "project" ? `Open details for ${card.title}` : card.title)
                          : `Select ${card.title}`
                      }
                      onClick={() => {
                        if (!active) {
                          goTo(index);
                          return;
                        }
                        if (card.kind === "project") onOpen?.(card);
                        else if (card.kind === "idea") {
                          window.location.hash = "contact";
                        }
                      }}
                    />
                    <div className="projects-fan-chrome">
                      <span className="projects-fan-file">{card.file}</span>
                      <span className="projects-fan-leds" aria-hidden="true">
                        <i /><i /><i />
                      </span>
                    </div>
                    <div className="projects-fan-body">
                      <div className="projects-fan-shot" aria-hidden="true">
                        {card.kind === "project" ? (
                          <ProjectThumb kind={thumbKind(card)} />
                        ) : (
                          <div className={`projects-fan-mock${card.kind === "idea" ? " is-idea" : ""}`}>
                            {card.kind === "soon" ? "SOON" : "IDEA"}
                          </div>
                        )}
                      </div>
                      <Chip>{card.category}</Chip>
                      <h3 className="projects-fan-title">{card.title}</h3>
                      <p className="projects-fan-sub clamp">{card.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              className="projects-fan-nav next"
              aria-label="Next project"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
            >
              <span aria-hidden="true">▶</span>
            </button>
          </div>

          <div className="projects-fan-dots" role="tablist" aria-label="Project position">
            {deck.map((card, index) => (
              <button
                key={`dot-${card.id}`}
                type="button"
                role="tab"
                className={`projects-fan-dot${index === selected ? " is-active" : ""}`}
                aria-label={`Show ${card.title}`}
                aria-selected={index === selected}
                onClick={() => goTo(index)}
              />
            ))}
          </div>

          <div className="projects-fan-meta">
            <div className="projects-fan-pill" aria-live="polite">
              {current.title}
            </div>

            <div className="projects-fan-detail">
              <p className="projects-fan-detail-copy">{current.details}</p>

              {current.tech?.length ? (
                <div className="projects-fan-chips">
                  {current.tech.map((tech) => (
                    <Chip key={tech}>{tech}</Chip>
                  ))}
                </div>
              ) : null}

              <div className="projects-fan-actions">
                {current.kind === "idea" ? (
                  <PixelButton href={current.ctaHref || "#contact"}>Hire me</PixelButton>
                ) : null}

                {current.kind === "project" && current.live ? (
                  <PixelButton href={current.live} target="_blank" rel="noreferrer">Live</PixelButton>
                ) : null}

                {current.kind === "project" && current.code ? (
                  <PixelButton href={current.code} variant="secondary" target="_blank" rel="noreferrer">Code</PixelButton>
                ) : null}

                {current.kind === "project" && !hasLinks ? (
                  <span className="projects-fan-soon">Links coming soon · click card for details</span>
                ) : null}

                {current.kind === "project" && hasLinks ? (
                  <span className="projects-fan-soon">Click the card for full details</span>
                ) : null}

                {current.kind === "soon" ? (
                  <span className="projects-fan-soon">Links coming soon</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </PixelWindow>
    </section>
  );
}
