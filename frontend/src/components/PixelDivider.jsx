export default function PixelDivider() {
  return (
    <div className="px-divider" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} style={{ left: `${i * 7}%` }} />
      ))}
      <span className="bird" />
    </div>
  );
}
