// Renders the 1200x630 share cards (Discord, X, iMessage, Slack...) listed in site/og.json.
// Run after the build: node site/build.mjs && node scripts/og.mjs
// Same dark liquid-glass look as the site: colour wash, frosted panel, product colours.
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
const icon = Object.fromEntries(['fileshaper', 'captionshaper', 'diskshaper', 'writeshaper'].map((s) => [s, `data:image/png;base64,${b64(`assets/img/${s}-icon.png`)}`]));
const shot = Object.fromEntries(['fileshaper', 'captionshaper', 'diskshaper', 'writeshaper'].map((s) => [s, `data:image/webp;base64,${b64(`assets/img/${s}-app.webp`)}`]));
const C = { fs: '#f26a1b', cs: '#c6ff3d', ds: '#5b9dff', ws: '#f9457f', violet: '#a07cff' };
const LOGO = '<svg viewBox="0 0 24 24" width="40" height="40"><path fill="#f4f4f5" fill-rule="evenodd" d="M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm9 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/></svg>';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const APPS = ['fileshaper', 'captionshaper', 'diskshaper', 'writeshaper'];

// Wash colours: a product page is lit by its own colour, the studio pages by all four.
const wash = (o) => {
  const c = o.v ? [C[o.v], C.violet, C[o.v], C.violet] : [C.fs, C.ws, C.violet, C.ds];
  return `<div class="wash"><i style="background:${c[0]};left:-260px;top:-300px"></i><i style="background:${c[1]};right:-240px;top:-320px"></i><i style="background:${c[2]};left:180px;bottom:-460px"></i><i style="background:${c[3]};right:-300px;bottom:-420px"></i></div>`;
};
const brand = (o) => `<div class="brand">${LOGO}<span>Hollowbit</span><em>Studio</em></div>`;
const head = (o) => {
  let h = esc(o.h);
  if (o.hl && o.h.includes(o.hl)) h = h.replace(esc(o.hl), `<mark>${esc(o.hl)}</mark>`);
  return h;
};

function card(o) {
  if (o.kind === 'product') {
    return `<div class="prod" style="--c:${C[o.v]}">
      <div class="left">
        ${brand(o)}
        <div class="mid">
          <img class="appicon" src="${icon[o.slug]}">
          <h1 class="fit name">${esc(o.name)}</h1>
          <p class="kicker">${esc(o.kicker)}</p>
          <p class="sub fit-sub">${esc(o.sub)}</p>
        </div>
        <div class="foot"><span class="pill">${esc(o.plats)}</span><span class="url">${esc(o.domain)}</span></div>
      </div>
      <div class="frame"><img src="${shot[o.slug]}"></div>
    </div>`;
  }
  const icons = `<div class="icons">${APPS.map((s, i) => `<img src="${icon[s]}" style="--i:${i}">`).join('')}</div>`;
  return `<div class="std ${o.kind}">
    ${brand(o)}
    <div class="mid"><h1 class="fit">${head(o)}</h1><p class="sub fit-sub">${esc(o.sub)}</p></div>
    <div class="foot">${icons}<span class="url">hollowbit.dev</span></div>
  </div>`;
}

const css = `
@font-face { font-family: G; src: url(${font}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { background: #0b0a10; color: #f4f4f5; font-family: G, "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif; position: relative; -webkit-font-smoothing: antialiased; }
.wash { position: absolute; inset: 0; overflow: hidden; }
.wash i { position: absolute; width: 760px; height: 760px; border-radius: 50%; filter: blur(110px); opacity: .34; }
.glass { position: absolute; inset: 28px; border-radius: 40px; background: linear-gradient(160deg, rgba(255,255,255,.085), rgba(255,255,255,.025) 45%, rgba(255,255,255,.04)); border: 1px solid rgba(255,255,255,.12); box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 40px 120px -40px rgba(0,0,0,.7); overflow: hidden; }
.glass::before { content: ""; position: absolute; inset: 0; background: radial-gradient(900px 300px at 20% -10%, rgba(255,255,255,.08), transparent 70%); pointer-events: none; }
.brand { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 640; letter-spacing: -.03em; }
.brand em { font-style: normal; color: #9a99a6; font-weight: 500; margin-left: -4px; }
.url { color: #8b8a96; font-size: 24px; font-weight: 500; letter-spacing: -.01em; }
.sub { text-wrap: pretty; color: #b4b3bf; font-size: 28px; line-height: 1.34; letter-spacing: -.012em; }
h1 { text-wrap: balance; font-weight: 650; letter-spacing: -.045em; line-height: 1.02; }
mark { color: #0b0a10; background: ${C.fs}; padding: 0 .12em; border-radius: .16em; box-shadow: inset 0 .04em 0 rgba(255,255,255,.45); -webkit-box-decoration-break: clone; }

/* studio pages */
.std { position: absolute; inset: 28px; padding: 54px 64px 50px; display: flex; flex-direction: column; }
.std .mid { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 22px; min-height: 0; overflow: hidden; }
.std h1 { font-size: 88px; max-width: 980px; }
.std .sub { max-width: 900px; }
.std .foot { display: flex; align-items: center; justify-content: space-between; }
.icons { display: flex; gap: 14px; }
.icons img { width: 64px; height: 64px; border-radius: 16px; filter: drop-shadow(0 10px 22px rgba(0,0,0,.45)); }
.home .icons img, .apps .icons img { width: 76px; height: 76px; }

/* product pages */
.prod { position: absolute; inset: 28px; display: flex; }
.prod .left { width: 600px; padding: 54px 0 50px 64px; display: flex; flex-direction: column; flex: none; }
.prod .mid { flex: 1; display: flex; flex-direction: column; justify-content: center; min-height: 0; overflow: hidden; }
.appicon { width: 84px; height: 84px; border-radius: 20px; margin: 10px 0 18px; filter: drop-shadow(0 16px 34px color-mix(in srgb, var(--c) 55%, transparent)); }
.name { font-size: 76px; }
.kicker { color: var(--c); font-size: 30px; font-weight: 600; letter-spacing: -.02em; margin: 10px 0 12px; }
.prod .sub { font-size: 24px; max-width: 520px; margin-bottom: 10px; }
.prod .foot { display: flex; align-items: center; gap: 18px; }
.pill { padding: 9px 18px; border-radius: 99px; font-size: 21px; font-weight: 600; color: #0b0a10; background: var(--c); box-shadow: inset 0 1px 0 rgba(255,255,255,.4); }
.frame { position: absolute; left: 640px; top: 72px; width: 760px; height: 520px; border-radius: 22px; overflow: hidden; border: 1px solid rgba(255,255,255,.16); box-shadow: 0 40px 90px -20px rgba(0,0,0,.75), 0 0 0 10px rgba(255,255,255,.035), 0 0 120px -30px var(--c); }
.frame img { width: 100%; height: 100%; object-fit: cover; object-position: left top; display: block; }
`;

// Shrink the headline (then the sub line) until the middle block fits.
const fitJs = `(() => {
  const mid = document.querySelector('.mid'); const h = document.querySelector('.fit'); const s = document.querySelector('.fit-sub');
  let n = parseFloat(getComputedStyle(h).fontSize), m = parseFloat(getComputedStyle(s).fontSize);
  while (mid.scrollHeight > mid.clientHeight + 1 && n > 44) { n -= 2; h.style.fontSize = n + 'px'; }
  while (mid.scrollHeight > mid.clientHeight + 1 && m > 18) { m -= 1; s.style.fontSize = m + 'px'; }
  while (h.scrollWidth > h.clientWidth + 1 && n > 44) { n -= 2; h.style.fontSize = n + 'px'; }
})()`;

const br = await chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1200, height: 630 } });
let n = 0;
for (const o of list) {
  if (only && !o.file.includes(only)) continue;
  await pg.setContent(`<!doctype html><html lang="${o.lang}"><head><meta charset="utf-8"><style>${css}</style></head><body>${wash(o)}<div class="glass"></div>${card(o)}</body></html>`, { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(fitJs);
  const out = resolve(root, o.file);
  mkdirSync(dirname(out), { recursive: true });
  await pg.screenshot({ path: out, type: 'png' });
  n++;
}
await br.close();
console.log('rendered', n, 'share cards');
