import { useState } from "react";
import PixelWindow from "../components/PixelWindow";
import PixelButton from "../components/PixelButton";
import Chip from "../components/Chip";
import { downloadResume } from "../api/client";
import { cleanText, isPlaceholder } from "../text";

export default function About({ profile }) {
  const [resumeMsg, setResumeMsg] = useState("");
  const edu = profile.education?.[0];

  async function onResume() {
    setResumeMsg("");
    try {
      await downloadResume();
    } catch (error) {
      setResumeMsg(error.message || "Resume not uploaded yet.");
    }
  }

  return (
    <section id="about" className="section">
      <PixelWindow title="ABOUT.EXE">
        <div className="about-grid">
          <img className="portrait" src="/sprites/avatar.png" alt="" width="160" height="160" />
          <div className="stack">
            {profile.open_to_work ? <Chip>Open to work</Chip> : null}
            {(profile.about || []).map((paragraph) => (
              <p className="prose" key={paragraph}>{paragraph}</p>
            ))}
            <p className="meta">
              {profile.location}
              {" · "}
              {(profile.languages || []).join(" · ")}
            </p>
            <div className="stat-grid">
              {(profile.stats || []).filter((stat) => cleanText(stat.value)).map((stat) => (
                <div className="stat-tile" key={stat.label}>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
            {edu ? (
              <div className="edu-tile">
                <p className="job-role">{edu.degree}</p>
                <p className="meta">{edu.school}{!isPlaceholder(edu.year) && edu.year ? ` · ${edu.year}` : ""}</p>
              </div>
            ) : null}
            <div className="btn-row">
              <PixelButton onClick={onResume}>Download Resume</PixelButton>
            </div>
            {resumeMsg ? <p className="err" role="status">{resumeMsg}</p> : null}
          </div>
        </div>
      </PixelWindow>
    </section>
  );
}
