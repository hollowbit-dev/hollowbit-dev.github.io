// Disk Cleaner: a small hidden game.
(() => {
  if (document.getElementById('dc')) return;
  const COLS = 7, ROWS = 11, COL = ['#f26a1b', '#5b9dff', '#22d3ee', '#f9457f', '#c6ff3d'];
  const o = document.createElement('div'); o.id = 'dc';
  o.innerHTML = `<style>#dc{position:fixed;inset:0;z-index:9999;background:#0b0a10f2;display:grid;place-items:center;font-family:inherit;color:#f4f3f8}#dc .w{display:grid;gap:12px;justify-items:center}#dc .t{display:flex;justify-content:space-between;width:100%;font-weight:600;font-size:15px;color:#adabbd}#dc .t b{color:#f4f3f8}#dc canvas{border-radius:18px;box-shadow:0 0 0 1px #ffffff1f;background:#121119;touch-action:none;cursor:pointer}#dc .x{position:fixed;top:16px;right:18px;background:#ffffff14;color:#f4f3f8;border:0;border-radius:99px;width:40px;height:40px;font-size:20px;cursor:pointer}#dc .m{position:absolute;inset:0;display:grid;place-items:center;text-align:center}#dc .m div{background:#121119;padding:24px 30px;border-radius:20px;box-shadow:0 0 0 1px #ffffff1f}#dc h2{margin:0 0 6px;font-size:24px}#dc p{margin:4px 0;color:#adabbd}#dc .go{margin-top:12px;font:600 15px inherit;padding:11px 22px;border:0;border-radius:99px;background:#f4f3f8;color:#0b0a10;cursor:pointer}</style>
  <button class="x" aria-label="Close">×</button><div class="w"><div class="t"><span>Freed <b class="s">0 MB</b></span><span>Best <b class="b">0 MB</b></span></div><canvas></canvas></div>
  <div class="m"><div><h2>Disk Cleaner</h2><p>Your disk is filling up.</p><p>Tap groups of 2+ matching blocks to clear them.</p><button class="go">Start</button></div></div>`;
  document.body.append(o);
  const cv = o.querySelector('canvas'), g = cv.getContext('2d'), menu = o.querySelector('.m'), sEl = o.querySelector('.s'), bEl = o.querySelector('.b');
  const S = Math.floor(Math.min((innerWidth - 32) / COLS, (innerHeight - 120) / ROWS, 46)), dpr = devicePixelRatio || 1;
  cv.width = COLS * S * dpr; cv.height = ROWS * S * dpr; cv.style.width = COLS * S + 'px'; cv.style.height = ROWS * S + 'px'; g.scale(dpr, dpr);
  let best = 0; try { best = +localStorage.dcBest || 0; } catch {}
  const fmt = (mb) => (mb >= 1000 ? (mb / 1000).toFixed(1) + ' GB' : mb + ' MB');
  bEl.textContent = fmt(best);
  let grid, score, timer, next, live = false, raf, pop = [];
  const row = () => Array.from({ length: COLS }, () => (Math.random() * COL.length) | 0);
  function start() {
    grid = Array.from({ length: ROWS }, (_, r) => (r >= ROWS - 4 ? row() : Array(COLS).fill(-1)));
    score = 0; timer = 0; next = 4; live = true; menu.style.display = 'none'; sEl.textContent = '0 MB';
    let last = performance.now();
    const tick = (now) => { const dt = (now - last) / 1000; last = now; timer += dt;
      if (timer >= next) { timer = 0; next = Math.max(1.3, next * 0.96); rise(); }
      draw(); if (live) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  }
  function rise() {
    if (grid[0].some((c) => c >= 0)) return end();
    grid.shift(); grid.push(row());
  }
  function end() { live = false; if (score > best) { best = score; try { localStorage.dcBest = best; } catch {} bEl.textContent = fmt(best); }
    menu.querySelector('h2').textContent = 'Disk full!'; menu.querySelector('p').textContent = `You freed ${fmt(score)}.`; menu.querySelectorAll('p')[1].textContent = '';
    menu.querySelector('.go').textContent = 'Play again'; menu.style.display = ''; draw(); }
  function draw() {
    g.clearRect(0, 0, COLS * S, ROWS * S);
    const p = 0.08;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const v = grid[r][c]; if (v < 0) continue;
      const shift = live ? (timer / next) * 0 : 0;
      g.fillStyle = COL[v]; g.beginPath(); g.roundRect(c * S + S * p, r * S + S * p - shift, S * (1 - 2 * p), S * (1 - 2 * p), S * 0.18); g.fill(); }
    g.fillStyle = '#ff4d5e'; g.fillRect(0, 0, COLS * S, 2);
    pop = pop.filter((q) => (q.l -= 0.06) > 0);
    for (const q of pop) { g.globalAlpha = q.l; g.strokeStyle = q.c; g.lineWidth = 2; g.beginPath(); g.arc(q.x, q.y, S * 0.5 * (1.6 - q.l), 0, 7); g.stroke(); }
    g.globalAlpha = 1;
    // fill warning bar
    const filled = grid.findIndex((rw) => rw.some((v) => v >= 0)), pct = filled < 0 ? 0 : (ROWS - filled) / ROWS;
    g.fillStyle = pct > 0.8 ? '#ff4d5e' : '#ffffff33'; g.fillRect(0, ROWS * S - 3, COLS * S * pct, 3);
  }
  cv.addEventListener('pointerdown', (e) => {
    if (!live) return;
    const b = cv.getBoundingClientRect(), c = Math.floor((e.clientX - b.left) / S), r = Math.floor((e.clientY - b.top) / S);
    const v = grid[r]?.[c]; if (v == null || v < 0) return;
    const seen = new Set(), st = [[r, c]];
    while (st.length) { const [y, x] = st.pop(), k = y * COLS + x; if (seen.has(k) || grid[y]?.[x] !== v) continue; seen.add(k); st.push([y + 1, x], [y - 1, x], [y, x + 1], [y, x - 1]); }
    if (seen.size < 2) return;
    for (const k of seen) { const y = (k / COLS) | 0, x = k % COLS; grid[y][x] = -1; pop.push({ x: x * S + S / 2, y: y * S + S / 2, c: COL[v], l: 1 }); }
    for (let x = 0; x < COLS; x++) { const col = []; for (let y = ROWS - 1; y >= 0; y--) if (grid[y][x] >= 0) col.push(grid[y][x]); for (let y = ROWS - 1, i = 0; y >= 0; y--, i++) grid[y][x] = col[i] ?? -1; }
    score += seen.size * seen.size * 8; sEl.textContent = fmt(score);
  });
  const close = () => { live = false; cancelAnimationFrame(raf); o.remove(); removeEventListener('keydown', esc); };
  const esc = (e) => { if (e.key === 'Escape') close(); };
  addEventListener('keydown', esc); o.querySelector('.x').onclick = close; o.querySelector('.go').onclick = start;
  grid = Array.from({ length: ROWS }, (_, r) => (r >= ROWS - 4 ? row() : Array(COLS).fill(-1))); draw();
})();
