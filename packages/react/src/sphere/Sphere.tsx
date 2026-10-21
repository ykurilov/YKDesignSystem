import { useEffect, useRef, type CSSProperties } from "react";
import { drawSphereFrame } from "./sphereDrawing.js";
import { attachSphere } from "./sphereLoop.js";

const FALLBACK_ACCENT = "#EE6A3C";

export interface SphereProps {
  /** Размер на странице в px. */
  size?: number;
  /** Цвет точек. По умолчанию — акцент `--yk-accent`; `currentColor` — цвет текста вокруг. */
  color?: string;
  /** Подпись для экранного диктора («Агент пишет ответ»). Без неё сфера декоративная. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/** Сфера из точек — «агент работает». Одна и та же в крупном и мелком размере. */
export function Sphere({ size = 16, color, label, className, style }: SphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pixelSize = size * pixelRatio();
    canvas.width = canvas.height = pixelSize;
    return attachSphere((time) => drawSphereFrame(ctx, pixelSize, resolveColor(canvas, color), time));
  }, [size, color]);

  const rootClass = className ? `yk-sphere ${className}` : "yk-sphere";
  const canvas = (
    <canvas ref={canvasRef} className="yk-sphere__canvas" aria-hidden="true" style={{ width: size, height: size }} />
  );

  if (!label) {
    return <span className={rootClass} style={style} aria-hidden="true">{canvas}</span>;
  }
  return (
    <span className={rootClass} style={style} role="status">
      {canvas}
      <span className="yk-visually-hidden">{label}</span>
    </span>
  );
}

/** Не меньше двух пикселей экрана на точку: мелкая сфера иначе мылится. */
function pixelRatio(): number {
  return Math.max(2, Math.ceil(globalThis.devicePixelRatio || 1));
}

function resolveColor(canvas: HTMLCanvasElement, color: string | undefined): string {
  const computed = getComputedStyle(canvas);
  if (color === "currentColor") return computed.color || FALLBACK_ACCENT;
  if (color) return color;
  return computed.getPropertyValue("--yk-accent").trim() || FALLBACK_ACCENT;
}
