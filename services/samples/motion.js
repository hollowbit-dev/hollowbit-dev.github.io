// Shared demo motion for the sample sites. Everything is skipped when the visitor prefers reduced motion.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  if (reduce) return;
  root.classList.add('motion');

  // Fade-and-rise as elements scroll into view. [data-stagger] children animate one after another.
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('[data-reveal], [data-stagger]').forEach((el) => {
    if (el.hasAttribute('data-stagger')) [...el.children].forEach((c, i) => c.style.setProperty('--i', i));
    io.observe(el);
  });

  // Headline split into words that rise in on load.
  document.querySelectorAll('[data-words]').forEach((h) => {
    let i = 0;
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w.trim()) { frag.append(w); return; }
          const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++);
          const inner = document.createElement('span'); inner.textContent = w; s.append(inner); frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(h);
    requestAnimationFrame(() => requestAnimationFrame(() => h.classList.add('go')));
  });

  // Count numbers up when they appear: <b data-count="1100">1,100</b>
  const fmt = new Intl.NumberFormat('en-US');
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
    const pre = el.dataset.pre || '', post = el.dataset.post || '', t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = pre + (dec ? v.toFixed(dec) : fmt.format(Math.round(v))) + post;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));

  // Gentle parallax on [data-parallax] images (speed in the attribute, e.g. 0.15).
  const par = [...document.querySelectorAll('[data-parallax]')];
  if (par.length) {
    let ticking = false;
    const run = () => {
      ticking = false;
      par.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const k = parseFloat(el.dataset.parallax) || .15;
        el.style.transform = `translate3d(0, ${((r.top + r.height / 2) - innerHeight / 2) * -k}px, 0) scale(1.12)`;
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  // Cards tilt toward the pointer: [data-tilt]
  if (matchMedia('(hover: hover)').matches) document.querySelectorAll('[data-tilt]').forEach((c) => {
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
      c.style.setProperty('--mx', `${(x + .5) * 100}%`); c.style.setProperty('--my', `${(y + .5) * 100}%`);
    });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; });
  });

  // Header gains a background once the page scrolls: [data-sticky]
  const sticky = document.querySelector('[data-sticky]');
  if (sticky) {
    const set = () => sticky.classList.toggle('stuck', scrollY > 40);
    addEventListener('scroll', set, { passive: true }); set();
  }
})();
