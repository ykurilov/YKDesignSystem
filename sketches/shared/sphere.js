// Сфера из точек — индикатор «агент работает».
// Любой <canvas class="sphere" data-size="16"> на странице оживает сам;
// появившиеся позже — через window.YKSphere.attach(canvas) или YKSphere.scan(root).
(() => {
  const POINTS = (() => {
    const n = 46, pts = [];
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996;
      pts.push([Math.cos(a) * r, y, Math.sin(a) * r]);
    }
    return pts;
  })();
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvases = new Set();

  function attach(canvas) {
    if (canvases.has(canvas)) return;
    const size = +canvas.dataset.size || 16, dpr = 3;
    canvas.width = canvas.height = size * dpr;
    canvas.style.width = canvas.style.height = size + 'px';
    canvases.add(canvas);
  }

  function draw(canvas, t) {
    const color = canvas.dataset.color || getComputedStyle(canvas).getPropertyValue('--accent').trim();
    const ctx = canvas.getContext('2d'), s = canvas.width, c = s / 2, R = s * 0.375;
    const ang = t / 1400, tilt = 0.45;
    ctx.clearRect(0, 0, s, s);
    const proj = POINTS.map(([x, y, z]) => {
      const x1 = x * Math.cos(ang) + z * Math.sin(ang), z1 = -x * Math.sin(ang) + z * Math.cos(ang);
      return [x1, y * Math.cos(tilt) - z1 * Math.sin(tilt), y * Math.sin(tilt) + z1 * Math.cos(tilt)];
    }).sort((a, b) => a[2] - b[2]);
    for (const [x, y, z] of proj) {
      const depth = (z + 1) / 2;
      ctx.globalAlpha = 0.25 + depth * 0.75;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(c + x * R, c + y * R, (s / 96) * (2 + depth * 3.2), 0, Math.PI * 2); ctx.fill();
    }
  }

  const scan = (root = document) => root.querySelectorAll('canvas.sphere').forEach(attach);
  window.YKSphere = { attach, scan };
  scan();

  const tick = (t) => {
    for (const cv of canvases) {
      if (!cv.isConnected) { canvases.delete(cv); continue; }
      draw(cv, reduceMotion ? 0 : t);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
