// Renders favicon.png, apple-touch-icon and the share image: node scripts/assets.mjs
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(resolve(process.env.HOME, 'Desktop/Fileshaper/package.json'));
const { chromium } = require('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch({ channel: 'chrome' });
const logo = `<svg viewBox="0 0 24 24" fill="#f4f4f5"><path fill-rule="evenodd" d="M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm9 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/></svg>`;
const shot = async (w, h, html, out, transparent) => {
  const p = await b.newPage({ viewport: { width: Math.max(w, 300), height: Math.max(h, 300) } });
  await p.setContent(html, { waitUntil: 'load' });
  await p.waitForTimeout(300);
  await p.screenshot({ path: resolve(root, out), omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
  await p.close();
};
await shot(64, 64, `<body style="margin:0">${logo.replace('<svg', '<svg width="64" height="64"')}</body>`, 'favicon.png', true);
await shot(180, 180, `<body style="margin:0;background:#08080a;width:180px;height:180px;display:grid;place-items:center">${logo.replace('<svg', '<svg width="112" height="112"')}</body>`, 'assets/img/apple-touch-icon.png', false);
const font = 'data:font/woff2;base64,' + (await import('node:fs')).readFileSync(resolve(root, 'assets/fonts/Geist-Variable.woff2')).toString('base64');
await shot(1200, 630, `<style>@font-face{font-family:G;src:url(${font}) format('woff2');font-weight:100 900}body{margin:0;width:1200px;height:630px;background:#08080a;color:#f4f4f5;font-family:G;display:flex;flex-direction:column;justify-content:center;padding:0 96px;box-sizing:border-box}h1{font-size:92px;line-height:1.02;letter-spacing:-0.045em;font-weight:600;margin:40px 0 0;max-width:12ch}p{color:#a1a1aa;font-size:30px;margin:28px 0 0}.b{display:flex;align-items:center;gap:16px;font-size:32px;font-weight:600}</style>
<div class="b">${logo.replace('<svg', '<svg width="44" height="44"')}Hollowbit</div><h1>Free tools that never upload your files.</h1><p>Fileshaper · Captionshaper</p>`, 'assets/img/og.png', false);
await b.close();
console.log('ok');
