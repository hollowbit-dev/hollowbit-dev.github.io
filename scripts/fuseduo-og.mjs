// Renders Fuseduo's 1200x630 share image: node scripts/fuseduo-og.mjs (then node site/build.mjs to stamp its hash)
// Same calm style as the studio cards: near-black, one soft light in the product colour, the real app window.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// Uses whichever local Playwright has a browser installed.
let chromium;
for (const base of ['.claude/skills/playwright-skill/package.json', 'Desktop/Fileshaper/package.json', 'Desktop/Diskshaper/package.json']) {
  try { const c = createRequire(resolve(process.env.HOME, base))('playwright').chromium; const b = await c.launch(); await b.close(); chromium = c; break; } catch { /* try the next */ }
}
if (!chromium) throw new Error('No Playwright browser found. Run: npx playwright install chromium');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (f) => readFileSync(resolve(root, f)).toString('base64');
const font = b64('assets/fonts/Geist-Variable.woff2');
const html = `<!doctype html><html><head><style>
@font-face { font-family: Geist; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #0c0b12; font-family: Geist; color: #f3f2f8; position: relative; }
.light { position: absolute; width: 900px; height: 900px; left: -260px; top: -420px; border-radius: 50%; background: radial-gradient(circle, rgba(122,99,255,.55), transparent 62%); }
.light2 { position: absolute; width: 700px; height: 700px; right: -260px; bottom: -420px; border-radius: 50%; background: radial-gradient(circle, rgba(34,199,192,.28), transparent 62%); }
.l { position: absolute; left: 72px; top: 72px; width: 470px; }
.brand { display: flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 700; letter-spacing: -.02em; }
.brand img { width: 52px; height: 52px; }
.brand small { font-size: 17px; color: #7d7a8f; font-weight: 560; }
h1 { margin-top: 70px; font-size: 64px; line-height: 1.02; letter-spacing: -.045em; font-weight: 740; }
h1 span { background: linear-gradient(100deg, #d8caff, #9d8bff 40%, #5fe8d9); -webkit-background-clip: text; color: transparent; }
p { margin-top: 26px; font-size: 22px; color: #b1aec2; line-height: 1.4; }
.pill { position: absolute; left: 72px; bottom: 72px; font-size: 17px; color: #b1aec2; padding: 8px 16px; border-radius: 99px; background: rgba(255,255,255,.07); box-shadow: inset 0 1px 0 rgba(255,255,255,.12); }
.shot { position: absolute; left: 600px; top: 96px; width: 840px; border-radius: 16px; overflow: hidden; box-shadow: 0 0 0 1px rgba(255,255,255,.1), 0 40px 100px rgba(0,0,0,.6); }
.shot img { width: 100%; display: block; }
</style></head><body><div class="light"></div><div class="light2"></div>
<div class="l"><div class="brand"><img src="data:image/png;base64,${b64('fuseduo/assets/img/icon-256.png')}">Fuseduo <small>by Hollowbit</small></div>
<h1>Drop one app on another. <span>Get an automation.</span></h1>
<p>Claude writes it, you read it, nothing runs until you approve.</p></div>
<div class="pill">Coming to Mac · hollowbit.dev/fuseduo</div>
<div class="shot"><img src="data:image/webp;base64,${b64('fuseduo/assets/img/app-plan.webp')}"></div>
</body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html); await p.waitForTimeout(400);
await p.screenshot({ path: resolve(root, 'fuseduo/assets/img/og.png') });
await b.close();
console.log('fuseduo og.png written');
