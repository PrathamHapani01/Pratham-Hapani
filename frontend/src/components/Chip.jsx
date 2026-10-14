import { blip } from "../sound";

export default function Chip({ children, active = false, onClick, href }) {
  const cls = `chip${active ? " is-active" : ""}`;
  if (href) {
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        className={cls}
        aria-pressed={active}
        onClick={(event) => {
          blip("click");
          onClick(event);
        }}
      >
        {children}
      </button>
    );
  }
  return <span className={cls}>{children}</span>;
}
