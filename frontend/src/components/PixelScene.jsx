import { useEffect, useRef } from "react";
import { createPixelScene } from "../pixelScene";

export default function PixelScene({ theme, onHot, reduced }) {
  const ref = useRef(null);
  const scene = useRef(null);
  const hotRef = useRef(onHot);
  hotRef.current = onHot;

  useEffect(() => {
    scene.current = createPixelScene(ref.current, {
      theme,
      reduced,
      onHot: (name) => hotRef.current?.(name),
    });
    return () => scene.current?.destroy();
  }, [reduced]);

  useEffect(() => {
    scene.current?.setTheme(theme);
  }, [theme]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Animated pixel desk with a computer, coffee, plant and a sleeping cat"
    />
  );
}
