// Подставляет значки Phosphor из папки icons/ вместо <i class="ph" data-icon="…">.
// Появившиеся позже — через window.YKIcons.render(root).
(() => {
  const cache = {};
  const load = (weight, name) =>
    (cache[`${weight}/${name}`] ??= fetch(`icons/phosphor-${weight}/${name}.svg`).then((r) => r.text()));

  function render(root = document) {
    const slots = [...root.querySelectorAll('i.ph[data-icon]:not([data-rendered])')];
    return Promise.all(slots.map(async (slot) => {
      slot.dataset.rendered = '1';
      const size = slot.dataset.size;
      if (size) slot.style.setProperty('--ph-size', size + 'px');
      slot.setAttribute('aria-hidden', 'true');
      slot.innerHTML = await load(slot.dataset.weight || 'regular', slot.dataset.icon);
    }));
  }

  window.YKIcons = { render };
  render().then(() => { document.body.dataset.iconsReady = '1'; });
})();
