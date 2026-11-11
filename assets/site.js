(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;

  // Opened from the folder (file://): folder links need index.html to open the page.
  if (location.protocol === 'file:') {
    $$('a[href]').forEach((a) => {
      const h = a.getAttribute('href');
      if (!/^[a-z]+:|^#/.test(h) && (/\/(#.*)?$/.test(h) || h === '.' || h === '..')) a.setAttribute('href', h.replace(/^(\.\.?)$/, '$1/').replace(/\/(#.*)?$/, '/index.html$1'));
    });
  }

  /* email: assembled here so scrapers reading the HTML don't get it */
  const email = ['ezygmanta', 'gmail.com'].join('@');
  $$('[data-email]').forEach((el) => { el.textContent = email; });
  $$('[data-email-link]').forEach((a) => { a.href = 'mailto:' + email; });
  $$('[data-copy-email]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(email); } catch { const t = document.createElement('textarea'); t.value = email; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    const label = $('span', b), old = label.textContent;
    b.classList.add('copied'); label.textContent = 'Copied';
    b.querySelector('use').setAttribute('href', '#check');
    setTimeout(() => { b.classList.remove('copied'); label.textContent = old; b.querySelector('use').setAttribute('href', '#copy'); }, 1800);
  }));

  /* your OS: highlight the matching download */
  const os = html.dataset.os;
  if (os === 'mac' || os === 'win') {
    $$(`.plat[data-plat="${os}"]`).forEach((p) => p.classList.add('is-rec'));
    const note = $('[data-os-note]');
    if (note) note.textContent = os === 'mac' ? ' Looks like you’re on a Mac.' : ' Looks like you’re on Windows.';
  }

  /* sticky nav + mobile menu */
  const nav = $('[data-nav]');
  const menuBtn = $('.nav-menu');
  const setNav = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', setNav, { passive: true }); setNav();
  menuBtn?.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) menuBtn.click(); });

  /* headlines: words blur in (hero at once, others when scrolled to) */
  const wordsIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('go'); wordsIO.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  for (const el of $$('[data-words]')) {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    const words = text.split(/\s+/);
    const hl = (el.dataset.hl || '').split(/\s+/).filter(Boolean);
    const at = hl.length ? words.findIndex((w, i) => hl.every((h, k) => words[i + k] === h)) : -1;
    let out = words.map((w, i) => `<span class="w" aria-hidden="true" style="--i:${i}">${w}</span>`);
    if (at >= 0) out = [...out.slice(0, at), `<span class="hlg">${out.slice(at, at + hl.length).join(' ')}</span>`, ...out.slice(at + hl.length)];
    el.innerHTML = out.join(' ');
    if (el.dataset.words === 'scroll') wordsIO.observe(el); else el.classList.add('go');
  }

  /* reveal on scroll */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  $$('.reveal, [data-wipe], .foot-word').forEach((el) => io.observe(el));

  /* product cards: tilt toward the pointer, light follows */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    for (const c of $$('[data-tilt-card]')) {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--rx', `${(x - 0.5) * 6}deg`);
        c.style.setProperty('--ry', `${(0.5 - y) * 5}deg`);
        c.style.setProperty('--mx', `${x * 100}%`);
        c.style.setProperty('--my', `${y * 100}%`);
      });
      c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    }
  }

  /* principles light up as you scroll past */
  const rules = $$('.rules li');
  let tick = false;
  function onScroll() {
    tick = false;
    const vh = innerHeight;
    for (const li of rules) { const r = li.getBoundingClientRect(); li.classList.toggle('lit', r.top + r.height / 2 < vh * 0.66); }
  }
  if (rules.length) { addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll(); }

  /* ---------- demos ---------- */
  const sleep = (ms, sig) => new Promise((res, rej) => {
    const t = setTimeout(res, ms);
    sig?.addEventListener('abort', () => { clearTimeout(t); rej(new DOMException('stop', 'AbortError')); }, { once: true });
  });
  const tween = (ms, fn, sig) => new Promise((res, rej) => {
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      fn(p);
      if (p < 1) raf = requestAnimationFrame(step); else res();
    };
    raf = requestAnimationFrame(step);
    sig?.addEventListener('abort', () => { cancelAnimationFrame(raf); rej(new DOMException('stop', 'AbortError')); }, { once: true });
  });
  const ease = (p) => 1 - Math.pow(1 - p, 3);

  const DEMOS = {
    'demo-fs': {
      length: 8200,
      setup(d) { return d; },
      reset(d, final) {
        const field = $('.fs-field', d), typed = $('.fs-typed', d);
        typed.textContent = final ? 'compress video' : '';
        field.classList.toggle('typing', final);
        field.classList.remove('focus');
        $$('.fs-list li', d).forEach((li, i) => { li.classList.remove('hl', 'press'); li.classList.toggle('gone', final && i > 0); });
        if (final) $('.fs-list li', d).classList.add('hl');
        $('.fs-job', d).classList.toggle('on', final);
        $('.fs-bar', d).style.setProperty('--p', final ? 1 : 0);
        $('.fs-done', d).classList.toggle('on', final);
        $('.fs-status', d).textContent = final ? 'Saved next to the original' : 'Encoding, pass 1 of 2';
        $('.fs-size', d).textContent = final ? '9.6 MB' : '214 MB';
      },
      async run(d, sig) {
        const field = $('.fs-field', d), typed = $('.fs-typed', d), items = $$('.fs-list li', d);
        await sleep(500, sig);
        field.classList.add('focus');
        await sleep(350, sig);
        const q = 'compress video';
        for (let i = 1; i <= q.length; i++) {
          const s = q.slice(0, i);
          typed.textContent = s;
          field.classList.add('typing');
          let first = true;
          for (const li of items) {
            const show = li.dataset.k.includes(s);
            li.classList.toggle('gone', !show);
            li.classList.toggle('hl', show && first);
            if (show) first = false;
          }
          await sleep(55 + Math.random() * 45, sig);
        }
        await sleep(450, sig);
        items[0].classList.add('press');
        await sleep(160, sig);
        items[0].classList.remove('press');
        field.classList.remove('focus');
        $('.fs-job', d).classList.add('on');
        await sleep(350, sig);
        const bar = $('.fs-bar', d), status = $('.fs-status', d), size = $('.fs-size', d);
        await tween(2600, (p) => {
          bar.style.setProperty('--p', ease(p).toFixed(4));
          status.textContent = p < 0.5 ? 'Encoding, pass 1 of 2' : 'Encoding, pass 2 of 2';
        }, sig);
        status.textContent = 'Saved next to the original';
        size.textContent = '9.6 MB';
        $('.fs-done', d).classList.add('on');
        await sleep(2400, sig);
      },
    },

    'demo-cs': {
      length: 8600,
      groups: [['Nothing', 'gets'], ['uploaded,'], ['and', 'it', 'works'], ['without'], ['the', 'internet.'], ['After', 'that,'], ['you', 'can', 'fix'], ['any', 'mistakes.']],
      start: 12.9,
      setup(d) {
        const wave = $('.cs-wave', d);
        let seed = 7;
        const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < 96; i++) {
          const b = document.createElement('b');
          const speech = (i % 23) > 3;
          b.style.setProperty('--h', `${speech ? 18 + rnd() * 72 : 6 + rnd() * 8}%`);
          wave.insertBefore(b, $('.cs-head', wave));
        }
        const list = $('.cs-list', d);
        list.innerHTML = '<div class="cs-rows"></div>';
      },
      fmt(t) { const m = Math.floor(t / 60), s = (t % 60).toFixed(1).padStart(4, '0'); return `${m}:${s}`; },
      row(rows, t0, t1, text) {
        const r = document.createElement('div');
        r.className = 'cs-row';
        r.innerHTML = `<small>${this.fmt(t0)}<br>${this.fmt(t1)}</small><span>${text}</span>`;
        rows.appendChild(r);
        return r;
      },
      reset(d, final) {
        const rows = $('.cs-rows', d);
        rows.innerHTML = '';
        rows.style.transform = '';
        this.row(rows, 9.7, 10.4, 'then it listens');
        this.row(rows, 10.4, 11.0, 'to every');
        this.row(rows, 11.0, 11.6, 'word, right');
        this.row(rows, 11.7, 12.8, 'on your computer.');
        const cap = $('.cs-cap', d);
        cap.innerHTML = '';
        $$('.cs-wave b', d).forEach((b) => b.classList.remove('past'));
        $('.cs-head', d).style.setProperty('--x', '0px');
        if (final) {
          const g = this.groups[0];
          this.row(rows, 12.9, 13.6, g.join(' ')).classList.add('now');
          cap.innerHTML = g.map((w, i) => `<span class="${i === 1 ? 'now' : ''}">${w}</span>`).join('');
        }
      },
      async run(d, sig) {
        const rows = $('.cs-rows', d), cap = $('.cs-cap', d), wave = $('.cs-wave', d), head = $('.cs-head', d);
        const bars = $$('.cs-wave b', d), time = $('.cs-time', d);
        const W = 0.36, total = this.groups.flat().length * W + 1.4;
        const startT = performance.now();
        let stop = false;
        sig.addEventListener('abort', () => { stop = true; }, { once: true });
        const width = wave.offsetWidth - 12;
        const playhead = () => {
          if (stop) return;
          const p = Math.min(1, (performance.now() - startT) / (total * 1000));
          head.style.setProperty('--x', `${6 + p * width}px`);
          const n = Math.floor(p * bars.length);
          bars.forEach((b, i) => b.classList.toggle('past', i < n));
          time.textContent = `${this.fmt(this.start + p * total).replace(/\.\d$/, '')} / 0:38`;
          if (p < 1) requestAnimationFrame(playhead);
        };
        requestAnimationFrame(playhead);
        await sleep(500, sig);
        let t = this.start, shown = 4;
        for (const g of this.groups) {
          $$('.cs-row', rows).forEach((r) => r.classList.remove('now'));
          const r = this.row(rows, t, t + g.length * W, '');
          r.classList.add('now', 'typing');
          shown++;
          if (shown > 7) rows.style.transform = `translateY(${-(shown - 7) * 49}px)`;
          cap.innerHTML = g.map((w) => `<span>${w}</span>`).join('');
          const spans = $$('span', cap);
          for (let i = 0; i < g.length; i++) {
            spans.forEach((s, j) => s.classList.toggle('now', j === i));
            $('span', r).textContent = g.slice(0, i + 1).join(' ');
            await sleep(W * 1000, sig);
          }
          r.classList.remove('typing');
          t += g.length * W + 0.05;
        }
        await sleep(1800, sig);
      },
    },
  };

  for (const stage of $$('[data-stage]')) {
    const demos = $$('.demo', stage);
    const tabs = $$('.tab', stage);
    const scaleBox = $('.stage-scale', stage);
    demos.forEach((d) => DEMOS[d.id].setup(d));

    const fit = () => {
      const compact = stage.parentElement.clientWidth < 700;
      stage.classList.toggle('compact', compact);
      const s = scaleBox.clientWidth / (compact ? 600 : 1040);
      demos.forEach((d) => d.style.setProperty('--s', s));
    };
    addEventListener('resize', fit);
    new ResizeObserver(fit).observe(scaleBox);
    fit();

    let cur = 0, ctrl = null, visible = false, barRaf = 0;
    const show = (i) => {
      cur = i;
      demos.forEach((d, j) => { d.hidden = j !== i; });
      stage.style.setProperty('--glow', demos[i].id === 'demo-cs' ? 'var(--cs)' : 'var(--fs)');
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; t.style.setProperty('--p', 0); });
    };
    const stopRun = () => { ctrl?.abort(); ctrl = null; cancelAnimationFrame(barRaf); };

    async function loop() {
      stopRun();
      if (reduce) { demos.forEach((d) => DEMOS[d.id].reset(d, true)); return; }
      const c = (ctrl = new AbortController());
      try {
        while (!c.signal.aborted) {
          const d = demos[cur], def = DEMOS[d.id], tab = tabs[cur];
          def.reset(d, false);
          const t0 = performance.now();
          if (tab) {
            const bar = () => { tab.style.setProperty('--p', Math.min(1, (performance.now() - t0) / def.length)); barRaf = requestAnimationFrame(bar); };
            barRaf = requestAnimationFrame(bar);
          }
          await def.run(d, c.signal);
          cancelAnimationFrame(barRaf);
          if (demos.length > 1) { show((cur + 1) % demos.length); await sleep(250, c.signal); }
        }
      } catch (e) { if (e.name !== 'AbortError') throw e; }
    }

    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { show(i); if (visible) loop(); else DEMOS[demos[i].id].reset(demos[i], true); });
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[n].focus(); tabs[n].click();
      });
    });

    show(0);
    demos.forEach((d) => DEMOS[d.id].reset(d, true));
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !document.hidden) loop(); else stopRun();
    }, { threshold: 0.25 }).observe(stage);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopRun(); else if (visible) loop(); });
  }
})();
