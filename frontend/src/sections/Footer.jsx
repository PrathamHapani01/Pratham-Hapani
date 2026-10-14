import PixelWindow from "../components/PixelWindow";
import PixelButton from "../components/PixelButton";

export default function Footer({ aliHidden, onToggleAli }) {
  return (
    <footer className="footer-wrap">
      <PixelWindow title="SYS" titleAs="p">
        <div className="footer-row">
          <p className="footer-note">© 2026 PRATHAM — MADE WITH PIXELS</p>
          <PixelButton href="#home">Press up to continue</PixelButton>
          <PixelButton variant="secondary" onClick={onToggleAli}>
            {aliHidden ? "Show Ali" : "Hide Ali"}
          </PixelButton>
        </div>
      </PixelWindow>
    </footer>
  );
}
