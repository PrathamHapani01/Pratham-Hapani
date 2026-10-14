import { useEffect, useRef } from "react";
import PixelWindow from "../components/PixelWindow";
import { cleanText } from "../text";

function Runner() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 16;
    canvas.height = 16;
    ctx.fillStyle = "#F26A38";
    ctx.fillRect(4, 1, 8, 8);
    ctx.fillStyle = "#F5C842";
    ctx.fillRect(6, 0, 4, 2);
    ctx.fillStyle = "#F7FBFF";
    ctx.fillRect(6, 3, 2, 2);
    ctx.fillRect(10, 3, 2, 2);
    ctx.fillStyle = "#2E2A2A";
    ctx.fillRect(5, 11, 2, 4);
    ctx.fillRect(9, 11, 2, 4);
    ctx.fillRect(2, 5, 2, 4);
  }, []);
  return <canvas ref={ref} className="runner" width="16" height="16" aria-hidden="true" />;
}

export default function Experience({ experience, education }) {
  const track = useRef(null);
  const schools = education || [];

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    function onScroll() {
      const rect = el.getBoundingClientRect();
      const viewed = Math.min(Math.max(-rect.top + 120, 0), rect.height);
      const progress = rect.height ? viewed / rect.height : 0;
      el.style.setProperty("--progress", String(Math.min(1, Math.max(0, progress))));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="experience" className="section">
      <PixelWindow title="EXPERIENCE.LOG">
        <ol className="timeline" ref={track}>
          <Runner />
          {(experience || []).map((job) => (
            <li key={`${job.company}-${job.role}`}>
              <PixelWindow title={job.company} titleAs="p">
                <h3 className="job-role">{job.role}</h3>
                {cleanText(job.period) ? <p className="meta">{job.period}</p> : null}
                <ul className="points">
                  {(job.points || []).map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </PixelWindow>
            </li>
          ))}
          {schools.map((school) => (
            <li key={school.school}>
              <PixelWindow title="EDUCATION" titleAs="p">
                <h3 className="job-role">{school.degree}</h3>
                <p className="meta">{school.school}{cleanText(school.year) ? ` · ${school.year}` : ""}</p>
              </PixelWindow>
            </li>
          ))}
        </ol>
      </PixelWindow>
    </section>
  );
}
