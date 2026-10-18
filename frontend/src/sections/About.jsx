import './about.css';

const API = import.meta.env.VITE_API_URL || '';

function AliAvatar({ size = 236 }) {
  return (
    <svg viewBox="0 0 32 34" width={size} height={Math.round((size * 34) / 32)} shapeRendering="crispEdges" role="img" aria-label="Ali, the golden robot mascot">
      <path d="M11 10h10v1h2v1h1v1h1v2h1v9h-1v2h-1v1h-1v1h-2v1H11v-1H9v-1H8v-1H7v-2H6v-9h1v-2h1v-1h1v-1h2z" fill="#F5A81F" stroke="#5B1A0C" />
      <rect x="9" y="12" width="6" height="2" fill="#FFD35A" />
      <rect x="8" y="14" width="2" height="3" fill="#FFD35A" />
      <rect x="11" y="11" width="3" height="1" fill="#FFE8A3" />
      <rect x="8" y="27" width="16" height="1" fill="#C4601A" />
      <rect x="8" y="17" width="14" height="9" fill="#08080C" stroke="#5B1A0C" />
      <rect x="10" y="19" width="3" height="4" fill="#19D5FF" />
      <rect x="16" y="19" width="3" height="4" fill="#19D5FF" />
      <rect x="12" y="24" width="1" height="1" fill="#19D5FF" />
      <rect x="16" y="24" width="1" height="1" fill="#19D5FF" />
      <rect x="13" y="25" width="3" height="1" fill="#19D5FF" />
      <rect x="25" y="18" width="2" height="6" fill="#08080C" />
      <polygon points="3,3 6,1 9,3 9,7 6,8 3,7" fill="#F5A81F" stroke="#5B1A0C" />
      <rect x="4" y="3" width="2" height="2" fill="#FFE8A3" />
      <polygon points="22,3 25,1 28,3 28,7 25,8 22,7" fill="#F5A81F" stroke="#5B1A0C" />
      <rect x="23" y="3" width="2" height="2" fill="#FFE8A3" />
    </svg>
  );
}

export default function About({ profile, experience = [] }) {
  const p = profile || {};
  const edu = p.education && p.education[0];
  const job = experience[0];
  const company = job && job.company;
  const level = job && /intern/i.test(job.role || '') ? 'Intern' : '';
  const name = p.name || 'Pratham';

  return (
    <section id="about" className="about">
      <div className="about-window">
        <div className="about-title">
          <span>ABOUT.EXE</span>
          <span className="about-dots" aria-hidden="true"><i /><i /><i /></span>
        </div>

        <div className="about-body">
          <aside className="about-card">
            <div className="about-avatar"><AliAvatar /></div>
            <div className="about-tag">PLAYER 1</div>
            <div className="about-name">{name}</div>
            {p.title && <div className="about-k">Class: {p.title}</div>}
            {level && <div className="about-k about-k--accent">Level: {level}</div>}
          </aside>

          <div className="about-main">
            {p.open_to_work && (
              <div className="about-k about-led"><span aria-hidden="true" />Open to work</div>
            )}
            <h2 className="about-heading">HI, I'M {name.toUpperCase()}.</h2>
            {(p.about || []).map((t, i) => <p key={i} className="about-text">{t}</p>)}

            <div className="about-tiles">
              {p.languages && p.languages.length > 0 && (
                <div className="about-tile">
                  <div className="about-label">Languages</div>
                  {p.languages.map((l) => <span key={l} className="about-chip">{l}</span>)}
                </div>
              )}
              {p.location && (
                <div className="about-tile">
                  <div className="about-label">Based in</div>
                  <div className="about-value">{p.location}</div>
                </div>
              )}
              {company && (
                <div className="about-tile">
                  <div className="about-label">Guild</div>
                  <div className="about-value">{company}</div>
                </div>
              )}
            </div>

            {edu && (
              <div className="about-tile about-edu">
                <div className="about-gold" aria-hidden="true" />
                <div>
                  <div className="about-label">Quest log: Education</div>
                  <div className="about-value about-value--big">{edu.degree}</div>
                  <div className="about-k">{edu.school}{edu.year && !/edit me/i.test(edu.year) ? ` · ${edu.year}` : ''}</div>
                </div>
              </div>
            )}

            <div className="about-actions">
              <a className="about-btn" href={`${API}/api/resume`}>Download resume</a>
              <a className="about-btn about-btn--ghost" href="#contact">Hire me</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
