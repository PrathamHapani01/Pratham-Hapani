export default function CrtFrame({ children }) {
  return (
    <div className="crt">
      <div className="crt-bezel">
        <div className="crt-screen">
          <i className="cloud" style={{ top: 36, left: 48 }} aria-hidden="true" />
          <i className="cloud" style={{ top: 80, right: 72, left: "auto" }} aria-hidden="true" />
          <i className="cloud" style={{ top: 150, left: "38%" }} aria-hidden="true" />
          <div className="hero-stage">{children}</div>
        </div>
        <div className="crt-label">PIXEL TV</div>
      </div>
    </div>
  );
}
