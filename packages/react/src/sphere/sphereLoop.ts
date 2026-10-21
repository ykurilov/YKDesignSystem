// Один общий цикл анимации на все сферы страницы.
// При «уменьшить движение» сферы рисуются одним кадром и перерисовываются только при смене темы.

type DrawFrame = (time: number) => void;

const animated = new Set<DrawFrame>();
const still = new Set<DrawFrame>();
let frameId: number | null = null;
let stopThemeWatch: (() => void) | null = null;

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Подключает сферу к общему циклу. Возвращает отключение. */
export function attachSphere(draw: DrawFrame): () => void {
  if (prefersReducedMotion()) {
    draw(0);
    still.add(draw);
    watchTheme();
    return () => {
      still.delete(draw);
      if (still.size === 0) unwatchTheme();
    };
  }
  animated.add(draw);
  if (frameId === null) frameId = requestAnimationFrame(tick);
  return () => {
    animated.delete(draw);
    if (animated.size === 0 && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}

function tick(time: number) {
  animated.forEach((draw) => draw(time));
  frameId = animated.size > 0 ? requestAnimationFrame(tick) : null;
}

function redrawStill() {
  still.forEach((draw) => draw(0));
}

function watchTheme() {
  if (stopThemeWatch || typeof document === "undefined") return;
  const observer = typeof MutationObserver === "function" ? new MutationObserver(redrawStill) : null;
  observer?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener?.("change", redrawStill);
  stopThemeWatch = () => {
    observer?.disconnect();
    scheme.removeEventListener?.("change", redrawStill);
  };
}

function unwatchTheme() {
  stopThemeWatch?.();
  stopThemeWatch = null;
}
