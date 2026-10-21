// Рисунок сферы из точек — тот же алгоритм, что в sketches/shared/sphere.js

const POINT_COUNT = 46;
const GOLDEN_ANGLE = 2.39996;
const TILT = 0.45;
/** Мс на один радиан поворота. */
const SPIN_PERIOD = 1400;

type Point = readonly [x: number, y: number, z: number];

/** Точки, равномерно разложенные по сфере спиралью. */
const POINTS: readonly Point[] = Array.from({ length: POINT_COUNT }, (_, i) => {
  const y = 1 - (i / (POINT_COUNT - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const a = i * GOLDEN_ANGLE;
  return [Math.cos(a) * r, y, Math.sin(a) * r] as const;
});

export type SphereContext = Pick<CanvasRenderingContext2D, "clearRect" | "beginPath" | "arc" | "fill" | "globalAlpha" | "fillStyle">;

/** Рисует кадр сферы на квадратном холсте стороной `pixelSize` в момент `time` (мс). */
export function drawSphereFrame(ctx: SphereContext, pixelSize: number, color: string, time: number): void {
  const center = pixelSize / 2;
  const radius = pixelSize * 0.375;
  const angle = time / SPIN_PERIOD;
  const cos = Math.cos(angle), sin = Math.sin(angle);

  const projected = POINTS.map(([x, y, z]) => {
    const x1 = x * cos + z * sin;
    const z1 = -x * sin + z * cos;
    return [x1, y * Math.cos(TILT) - z1 * Math.sin(TILT), y * Math.sin(TILT) + z1 * Math.cos(TILT)] as const;
  }).sort((a, b) => a[2] - b[2]);

  ctx.clearRect(0, 0, pixelSize, pixelSize);
  ctx.fillStyle = color;
  for (const [x, y, z] of projected) {
    const depth = (z + 1) / 2;
    ctx.globalAlpha = 0.25 + depth * 0.75;
    ctx.beginPath();
    ctx.arc(center + x * radius, center + y * radius, (pixelSize / 96) * (2 + depth * 3.2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
