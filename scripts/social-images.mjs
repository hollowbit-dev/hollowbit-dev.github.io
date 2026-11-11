// Renders Hollowbit's social banners and avatar into brand/social/. Run: node scripts/social-images.mjs
// Content sits in the centre so it survives X's avatar overlap and YouTube's crop on phones.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const font = fs.readFileSync(path.join(root, 'assets/fonts/Geist-Variable.woff2')).toString('base64');
const MARK = 'M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm9 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z';
// [file, width, height, safe-area height the text must fit in]
const BANNERS = [
  ['banner-x-1500x500.png', 1500, 500, 500],
  ['banner-bluesky-3000x1000.png', 3000, 1000, 1000],
  ['banner-youtube-2560x1440.png', 2560, 1440, 423],
  ['banner-reddit-1920x384.png', 1920, 384, 384],
];
const page = (w, h, safe) => {
  const u = safe / 500;            // 1 unit = what looks right on a 500px-tall banner
  return `<html><head><style>
@font-face { font-family: G; src: url(data:font/woff2;base64,${font}); }
* { margin: 0; box-sizing: border-box; }
body { width: ${w}px; height: ${h}px; background: #0a0a0c; font-family: G; color: #f4f4f5; position: relative; overflow: hidden; }
/* the off-centre hole from the mark, huge and barely there */
.ghost { position: absolute; width: ${h * 1.6}px; height: ${h * 1.6}px; right: ${-h * 0.35}px; top: 50%; transform: translateY(-50%); border-radius: 50%; border: ${Math.max(1, 1.2 * u)}px solid rgba(255,255,255,.055); }
.ghost::after { content: ""; position: absolute; inset: 22%; border-radius: 50%; border: ${Math.max(1, 1.2 * u)}px solid rgba(255,255,255,.035); }
.grain { position: absolute; inset: 0; background: radial-gradient(${w * 0.5}px ${h * 0.9}px at 50% 110%, rgba(255,255,255,.035), transparent 70%); }
.c { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: ${22 * u}px; }
.row { display: flex; align-items: center; gap: ${18 * u}px; }
.row svg { width: ${56 * u}px; height: ${56 * u}px; }
.name { font-size: ${50 * u}px; font-weight: 640; letter-spacing: -.035em; }
.name span { color: #8b8b93; font-weight: 500; }
.line { font-size: ${22 * u}px; color: #8b8b93; letter-spacing: -.005em; }
.dots { display: flex; gap: ${9 * u}px; margin-top: ${4 * u}px; }
.dots i { width: ${8 * u}px; height: ${8 * u}px; border-radius: ${2.5 * u}px; }
</style></head><body>
<div class="grain"></div><div class="ghost"></div>
<div class="c">
  <div class="row"><svg viewBox="0 0 24 24"><path fill="#f4f4f5" fill-rule="evenodd" d="${MARK}"/></svg><div class="name">Hollowbit <span>Studio</span></div></div>
  <div class="line">Free tools that never upload your files.</div>
  <div class="dots"><i style="background:#f26a1b"></i><i style="background:#c6ff3d"></i><i style="background:#5b9dff"></i></div>
</div></body></html>`;
};
const avatar = (s) => `<html><body style="margin:0;width:${s}px;height:${s}px;background:#0a0a0c;display:grid;place-items:center">
<svg viewBox="0 0 24 24" style="width:${s * 0.46}px;height:${s * 0.46}px"><path fill="#f4f4f5" fill-rule="evenodd" d="${MARK}"/></svg></body></html>`;

const out = path.join(root, 'brand/social');
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
for (const [f, w, h, safe] of BANNERS) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(page(w, h, safe)); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(out, f) }); await p.close();
}
const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
await p.setContent(avatar(1080)); await p.waitForTimeout(100);
await p.screenshot({ path: path.join(out, 'avatar-1080.png') });
await b.close();
console.log('written to brand/social:', fs.readdirSync(out).join(', '));
