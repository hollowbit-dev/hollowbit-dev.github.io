// Renders the 1200x630 share cards (Discord, X, iMessage, Slack...) listed in site/og.json.
// Run: node site/build.mjs && node scripts/og.mjs && node site/build.mjs (the 2nd build stamps image hashes into the URLs)
// Calm and exact: one controlled light in the page's colour, a strict 72px grid, real app screenshots.
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(resolve(process.env.HOME, 'Desktop/Fileshaper/package.json'));
const { chromium } = require('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const list = JSON.parse(readFileSync(resolve(root, 'site/og.json'), 'utf8'));
const only = process.argv[2]; // optional filter, e.g. "en/" or "fileshaper"

const b64 = (f) => readFileSync(resolve(root, f)).toString('base64');
const font = `data:font/woff2;base64,${b64('assets/fonts/Geist-Variable.woff2')}`;
const APPS = ['fileshaper', 'captionshaper', 'diskshaper', 'writeshaper', 'startshaper'];
const icon = Object.fromEntries(APPS.map((s) => [s, `data:image/png;base64,${b64(`assets/img/${s}-icon.png`)}`]));
const shot = Object.fromEntries(APPS.map((s) => [s, `data:image/webp;base64,${b64(`assets/img/${s}-app.webp`)}`]));
const C = { fs: '#f26a1b', cs: '#c6ff3d', ds: '#5b9dff', ws: '#f9457f', ss: '#ff8f4d', violet: '#a07cff' };
const LOGO = '<svg viewBox="0 0 24 24" width="34" height="34"><path fill="#f4f4f5" fill-rule="evenodd" d="M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm9 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/></svg>';
// Fine grain so the gradients don't band in Discord's JPEG re-encode.
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>')}")`;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const top = (o) => `<header><div class="brand">${LOGO}<span>Hollowbit</span><em>Studio</em></div><span class="url">${esc(o.domain || 'hollowbit.dev')}</span></header>`;
const headline = (o) => {
  let h = esc(o.h);
  if (o.hl && o.h.includes(o.hl)) h = h.replace(esc(o.hl), `<b>${esc(o.hl)}</b>`);
  return h;
};

function card(o) {
  if (o.kind === 'product') {
    return `<div class="light" style="--c:${C[o.v]}"></div>${top(o)}
    <section class="ptext">
      <img class="appicon" src="${icon[o.slug]}" alt="">
      <h1 class="fit">${esc(o.name)}</h1>
      <p class="kicker">${esc(o.kicker)}</p>
      <p class="sub fit-sub">${esc(o.sub)}</p>
    </section>
    <figure class="win"><img src="${shot[o.slug]}" alt=""></figure>`;
  }
  const big = o.kind === 'home' || o.kind === 'apps';
  const icons = `<div class="icons${big ? ' grid' : ''}">${APPS.map((s) => `<img src="${icon[s]}" alt="">`).join('')}</div>`;
  return `<div class="light studio"></div>${top(o)}
    <section class="stext${big ? ' narrow' : ''}">
      <h1 class="fit">${headline(o)}</h1>
      <p class="sub fit-sub">${esc(o.sub)}</p>
    </section>
    ${icons}`;
}

const css = `
@font-face { font-family: G; src: url(${font}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { position: relative; background: #08070c; color: #f5f5f7; font-family: G, "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
body::after { content: ""; position: absolute; inset: 0; background: ${GRAIN}; opacity: .045; mix-blend-mode: overlay; pointer-events: none; z-index: 5; }

/* One light source, top right, in the page's colour. */
.light { position: absolute; inset: 0; background:
  radial-gradient(620px 420px at 88% -6%, color-mix(in srgb, var(--c) 38%, transparent), transparent 70%),
  radial-gradient(520px 380px at 104% 92%, color-mix(in srgb, ${C.violet} 16%, transparent), transparent 70%),
  radial-gradient(700px 300px at 10% 120%, rgba(255,255,255,.035), transparent 70%); }
.light.studio { background:
  radial-gradient(440px 320px at 80% 30%, color-mix(in srgb, ${C.fs} 26%, transparent), transparent 70%),
  radial-gradient(440px 320px at 98% 64%, color-mix(in srgb, ${C.ws} 24%, transparent), transparent 70%),
  radial-gradient(480px 340px at 74% 92%, color-mix(in srgb, ${C.ds} 20%, transparent), transparent 70%),
  radial-gradient(520px 360px at 104% 0%, color-mix(in srgb, ${C.violet} 26%, transparent), transparent 70%); }

header { position: absolute; left: 72px; right: 72px; top: 60px; display: flex; align-items: center; justify-content: space-between; z-index: 2; }
.brand { display: flex; align-items: center; gap: 12px; font-size: 27px; font-weight: 620; letter-spacing: -.025em; }
.brand em { font-style: normal; font-weight: 450; color: #8e8d99; }
.url { font-size: 22px; font-weight: 500; color: #8e8d99; letter-spacing: -.01em; }

h1 { font-weight: 640; letter-spacing: -.045em; line-height: 1.02; text-wrap: balance; }
h1 b { font-weight: inherit; color: ${C.fs}; }
.sub { color: #a3a2ae; font-size: 26px; line-height: 1.38; letter-spacing: -.01em; text-wrap: pretty; }

/* studio pages: text bottom-left on the grid, icons on the right */
.stext { position: absolute; left: 72px; bottom: 72px; width: 900px; max-height: 400px; display: flex; flex-direction: column; justify-content: flex-end; gap: 20px; overflow: hidden; }
.stext.narrow { width: 720px; }
.stext h1 { font-size: 80px; }
.stext .sub { max-width: 640px; }
.icons { position: absolute; right: 72px; bottom: 72px; display: flex; gap: 14px; }
.icons img { width: 60px; height: 60px; filter: drop-shadow(0 8px 14px rgba(0,0,0,.55)); }
.icons.grid { top: 170px; bottom: auto; display: grid; grid-template-columns: repeat(3, 118px); gap: 10px; }
.icons.grid img { width: 118px; height: 118px; filter: drop-shadow(0 22px 30px rgba(0,0,0,.6)); }

/* product pages: text left, the real app window bleeding off the right and bottom edge */
.ptext { position: absolute; left: 72px; top: 136px; bottom: 72px; width: 470px; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden; }
.appicon { width: 92px; height: 92px; margin: 0 0 18px -8px; filter: drop-shadow(0 14px 24px color-mix(in srgb, var(--c) 45%, transparent)); }
.ptext h1 { font-size: 72px; }
.kicker { color: var(--c); font-size: 26px; font-weight: 580; letter-spacing: -.015em; margin: 14px 0 14px; }
.ptext .sub { font-size: 22px; }
.ptext { --c: inherit; }
.win { position: absolute; left: 600px; top: 136px; width: 760px; height: 560px; border-radius: 18px; overflow: hidden; background: #111;
  box-shadow: 0 0 0 1px rgba(255,255,255,.14), 0 50px 100px -30px rgba(0,0,0,.9), 0 0 0 9px rgba(255,255,255,.04); }
.win img { width: 100%; height: 100%; object-fit: cover; object-position: left top; display: block; }
`;

// Shrink the headline, then the sub line, until the text block fits its box.
const fitJs = `(() => {
  const box = document.querySelector('section'), h = document.querySelector('.fit'), s = document.querySelector('.fit-sub');
  let n = parseFloat(getComputedStyle(h).fontSize), m = parseFloat(getComputedStyle(s).fontSize);
  const over = () => box.scrollHeight > box.clientHeight + 1 || h.scrollWidth > h.clientWidth + 1;
  while (over() && n > 46) { n -= 2; h.style.fontSize = n + 'px'; }
  while (over() && m > 18) { m -= 1; s.style.fontSize = m + 'px'; }
})()`;

const br = await chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1200, height: 630 } });
let count = 0;
for (const o of list) {
  if (only && !o.file.includes(only)) continue;
  const c = o.v ? C[o.v] : C.violet;
  await pg.setContent(`<!doctype html><html lang="${o.lang}"><head><meta charset="utf-8"><style>${css}</style></head><body style="--c:${c}">${card(o)}</body></html>`, { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(fitJs);
  const out = resolve(root, o.file);
  mkdirSync(dirname(out), { recursive: true });
  await pg.screenshot({ path: out, type: 'png' });
  count++;
}
await br.close();
console.log('rendered', count, 'share cards');
