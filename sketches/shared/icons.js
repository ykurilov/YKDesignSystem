// Подставляет значки Phosphor из папки icons/ вместо <i class="ph" data-icon="…">
(() => {
  const cache = {};
  const load = (weight, name) =>
    (cache[`${weight}/${name}`] ??= fetch(`icons/phosphor-${weight}/${name}.svg`).then((r) => r.text()));
  const slots = [...document.querySelectorAll('i.ph[data-icon]')];
  Promise.all(slots.map(async (slot) => {
    const size = slot.dataset.size;
    if (size) slot.style.setProperty('--ph-size', size + 'px');
    slot.setAttribute('aria-hidden', 'true');
    slot.innerHTML = await load(slot.dataset.weight || 'regular', slot.dataset.icon);
  })).then(() => { document.body.dataset.iconsReady = '1'; });
})();
