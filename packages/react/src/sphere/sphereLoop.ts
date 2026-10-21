// Один общий цикл анимации на все сферы страницы.
// При «уменьшить движение» сферы рисуются одним кадром и перерисовываются только при смене темы.
// Настройку движения и тему страницы отслеживаем на лету, пока на странице есть хоть одна сфера.

type DrawFrame = (time: number) => void;

interface SphereHandle {
  draw: DrawFrame;
  /** Перечитать цвет: тема страницы сменилась. */
  refreshColor: () => void;
}

const spheres = new Set<SphereHandle>();
let reducedMotion = false;
let frameId: number | null = null;
let stopWatching: (() => void) | null = null;

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Подключает сферу к общему циклу. Возвращает отключение. */
export function attachSphere(draw: DrawFrame, refreshColor: () => void = () => {}): () => void {
  const handle: SphereHandle = { draw, refreshColor };
  if (spheres.size === 0) {
    reducedMotion = prefersReducedMotion();
    stopWatching = watchPage();
  }
  spheres.add(handle);
  syncMode(handle);
  return () => {
    spheres.delete(handle);
    if (spheres.size > 0) return;
    stopFrames();
    stopWatching?.();
    stopWatching = null;
  };
}

/** Новая сфера: при «уменьшить движение» рисует один кадр, иначе запускает цикл, если он стоит. */
function syncMode(fresh?: SphereHandle) {
  if (reducedMotion) {
    stopFrames();
    (fresh ? [fresh] : [...spheres]).forEach(({ draw }) => draw(0));
  } else if (frameId === null && spheres.size > 0) {
    frameId = requestAnimationFrame(tick);
  }
}

function stopFrames() {
  if (frameId === null) return;
  cancelAnimationFrame(frameId);
  frameId = null;
}

function tick(time: number) {
  spheres.forEach(({ draw }) => draw(time));
  frameId = spheres.size > 0 ? requestAnimationFrame(tick) : null;
}

function handleThemeChange() {
  spheres.forEach(({ refreshColor }) => refreshColor());
  if (reducedMotion) spheres.forEach(({ draw }) => draw(0));
}

function handleMotionChange(event: { matches: boolean }) {
  reducedMotion = event.matches;
  syncMode();
}

/** Следит за темой страницы (атрибут data-theme, системная тема) и настройкой движения. */
function watchPage(): () => void {
  if (typeof document === "undefined" || typeof matchMedia !== "function") return () => {};
  const observer = typeof MutationObserver === "function" ? new MutationObserver(handleThemeChange) : null;
  observer?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  scheme.addEventListener?.("change", handleThemeChange);
  motion.addEventListener?.("change", handleMotionChange);
  return () => {
    observer?.disconnect();
    scheme.removeEventListener?.("change", handleThemeChange);
    motion.removeEventListener?.("change", handleMotionChange);
  };
}
