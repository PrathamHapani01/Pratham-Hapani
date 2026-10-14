import PixelIcon from "./PixelIcon";
import { blip } from "../sound";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="px-btn icon-btn"
      aria-label={theme === "blue" ? "Switch to peach theme" : "Switch to blue CRT theme"}
      onClick={() => {
        blip("click");
        onToggle();
      }}
    >
      <PixelIcon name={theme === "blue" ? "snow" : "sun"} />
    </button>
  );
}
