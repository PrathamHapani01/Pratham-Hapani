import { blip } from "../sound";

export default function PixelButton({
  variant = "primary",
  href,
  children,
  className = "",
  type,
  onClick,
  ...props
}) {
  const cls = `px-btn ${variant === "secondary" ? "is-ghost" : ""} ${className}`.trim();
  function handleClick(event) {
    blip("click");
    if (onClick) onClick(event);
  }
  if (href) {
    return (
      <a className={cls} href={href} onClick={handleClick} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} type={type || "button"} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
