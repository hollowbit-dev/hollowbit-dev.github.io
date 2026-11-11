(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plates = [...document.querySelectorAll('[data-plate]')];

  // Brushed-aluminium grain: horizontal streaks, drawn once.
  try {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const g = c.getContext('2d');
    const img = g.createImageData(c.width, c.height);
    for (let y = 0; y < c.height; y++) {
      let row = 128 + (Math.random() - 0.5) * 70;
      let v = row;
      for (let x = 0; x < c.width; x++) {
        v += (row + (Math.random() - 0.5) * 90 - v) * 0.08; // smear along the grain
        const i = (y * c.width + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    document.documentElement.style.setProperty('--brush', `url(${c.toDataURL('image/png')})`);
  } catch (e) { /* flat metal is fine */ }

  // Wrap each face's contents so the laser can etch them, then add the laser.
  for (const p of plates) {
    const face = p.querySelector('.plate__face');
    const ink = document.createElement('div');
    ink.className = 'plate__ink';
    while (face.firstChild) ink.appendChild(face.firstChild);
    face.appendChild(ink);
    const laser = document.createElement('span');
    laser.className = 'laser';
    laser.setAttribute('aria-hidden', 'true');
    face.appendChild(laser);

    // Anodised plates start as bare metal: a visual copy sits on top and drains away.
    if (p.hasAttribute('data-anodise') && !reduce) {
      const bare = face.cloneNode(true);
      bare.classList.add('plate__bare');
      bare.setAttribute('aria-hidden', 'true');
      bare.setAttribute('inert', '');
      bare.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
      bare.querySelectorAll('a, button').forEach((n) => n.setAttribute('tabindex', '-1'));
      p.appendChild(bare);
    }
  }

  // Specular sheen follows the pointer across each plate.
  if (!reduce && matchMedia('(hover: hover)').matches) {
    for (const p of plates) {
      let raf = 0;
      p.addEventListener('pointermove', (e) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = p.getBoundingClientRect();
          p.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
          p.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
        });
      });
    }
  }

  if (reduce || !('IntersectionObserver' in window)) {
    plates.forEach((p) => p.classList.add('is-anodised'));
    document.querySelectorAll('.product').forEach((p) => p.classList.add('is-lit'));
    return;
  }

  // Laser-etch each plate the first time it comes into view.
  plates.forEach((p) => p.classList.add('etch-wait'));
  const etchIO = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const p = en.target;
      etchIO.unobserve(p);
      p.classList.add('is-etching');
      p.classList.remove('etch-wait');
      p.querySelector('.plate__ink').addEventListener('animationend', () => {
        p.dataset.etched = '1';
        maybeAnodise(p);
      }, { once: true });
    }
  }, { threshold: 0.35 });
  plates.forEach((p) => etchIO.observe(p));

  // A product plate is anodised in its colour while it's the one you're looking at.
  const focus = new Set();
  const hover = new Set();
  function maybeAnodise(p) {
    if (!p.hasAttribute('data-anodise') || !p.dataset.etched) return;
    const on = focus.has(p) || hover.has(p);
    p.classList.toggle('is-anodised', on);
    p.closest('.product')?.classList.toggle('is-lit', on);
  }
  const focusIO = new IntersectionObserver((entries) => {
    for (const en of entries) {
      en.isIntersecting ? focus.add(en.target) : focus.delete(en.target);
      maybeAnodise(en.target);
    }
  }, { rootMargin: '-38% 0px -38% 0px' });
  document.querySelectorAll('[data-anodise]').forEach((p) => {
    focusIO.observe(p);
    p.addEventListener('pointerenter', () => { hover.add(p); maybeAnodise(p); });
    p.addEventListener('pointerleave', () => { hover.delete(p); maybeAnodise(p); });
    p.addEventListener('focusin', () => { hover.add(p); maybeAnodise(p); });
    p.addEventListener('focusout', () => { hover.delete(p); maybeAnodise(p); });
  });

  // Screenshots sit behind their plates and drift a little slower, so the overlap reads as depth.
  const shots = [...document.querySelectorAll('.shot')];
  let ticking = false;
  function drift() {
    ticking = false;
    const vh = innerHeight;
    for (const s of shots) {
      const r = s.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const t = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 around centre
      s.style.setProperty('--py', `${(t * 36).toFixed(1)}px`);
    }
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
  addEventListener('resize', drift);
  drift();
})();
