// Renders square logo images into brand/: node scripts/logo.mjs
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(resolve(process.env.HOME, 'Desktop/Fileshaper/package.json'));
const { chromium } = require('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MARK = 'M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm9 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z';
const S = 1024;
const variants = {
  // main: graphite tile, soft studio light, white mark with depth
  'hollowbit-logo-dark': `
    <div style="position:absolute;inset:0;background:
      radial-gradient(120% 90% at 30% 10%, #2a2a31 0%, #131317 55%, #0a0a0c 100%)"></div>
    <div style="position:absolute;inset:0;background:radial-gradient(60% 50% at 50% 115%, rgba(242,106,27,.35), transparent 70%), radial-gradient(55% 45% at 105% 105%, rgba(198,255,61,.22), transparent 70%)"></div>
    <svg viewBox="0 0 24 24" style="position:absolute;left:50%;top:50%;width:52%;transform:translate(-50%,-50%);filter:drop-shadow(0 28px 50px rgba(0,0,0,.6))">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9c9d1"/></linearGradient></defs>
      <path fill="url(#g)" fill-rule="evenodd" d="${MARK}"/></svg>`,
  // colour: the brand palette as the field, black mark
  'hollowbit-logo-color': `
    <div style="position:absolute;inset:0;background:conic-gradient(from 210deg at 50% 50%, #f26a1b, #ffd03d, #c6ff3d, #33e0c0, #5b8cff, #a07cff, #ff6aa9, #f26a1b);filter:blur(60px);transform:scale(1.3)"></div>
    <div style="position:absolute;inset:0;background:radial-gradient(70% 70% at 50% 50%, rgba(255,255,255,.18), transparent 70%)"></div>
    <svg viewBox="0 0 24 24" style="position:absolute;left:50%;top:50%;width:52%;transform:translate(-50%,-50%);filter:drop-shadow(0 24px 40px rgba(0,0,0,.35))">
      <path fill="#0b0b0c" fill-rule="evenodd" d="${MARK}"/></svg>`,
  // light: for white backgrounds
  'hollowbit-logo-light': `
    <div style="position:absolute;inset:0;background:radial-gradient(120% 90% at 30% 10%, #ffffff 0%, #f1f1ee 60%, #e4e4df 100%)"></div>
    <svg viewBox="0 0 24 24" style="position:absolute;left:50%;top:50%;width:52%;transform:translate(-50%,-50%);filter:drop-shadow(0 24px 40px rgba(0,0,0,.18))">
      <path fill="#0b0b0c" fill-rule="evenodd" d="${MARK}"/></svg>`,
};
const b = await chromium.launch({ channel: 'chrome' });
for (const [name, inner] of Object.entries(variants)) {
  const p = await b.newPage({ viewport: { width: S, height: S }, deviceScaleFactor: 2 });
  await p.setContent(`<body style="margin:0;width:${S}px;height:${S}px;position:relative;overflow:hidden">${inner}</body>`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: resolve(root, `brand/${name}.png`) });
  await p.close();
}
// transparent marks (white and black) for putting on your own backgrounds
for (const [name, fill] of [['hollowbit-mark-white', '#ffffff'], ['hollowbit-mark-black', '#0b0b0c']]) {
  const p = await b.newPage({ viewport: { width: S, height: S }, deviceScaleFactor: 2 });
  await p.setContent(`<body style="margin:0;background:transparent"><svg viewBox="0 0 24 24" width="${S}" height="${S}"><path fill="${fill}" fill-rule="evenodd" d="${MARK}"/></svg></body>`);
  await p.screenshot({ path: resolve(root, `brand/${name}.png`), omitBackground: true });
  await p.close();
}
await b.close();
console.log('ok');
