// Renders favicon.png, img/apple-touch-icon.png and img/og.png: node scripts/assets.mjs
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(resolve(process.env.HOME, 'Desktop/Fileshaper/package.json'));
const { chromium } = require('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch({ channel: 'chrome' });
const icon = async (size, out, pad) => {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<body style="margin:0;background:${pad ? '#141518' : 'transparent'};display:grid;place-items:center;height:100vh"><img src="file://${root}/favicon.svg" style="width:${pad ? 62 : 100}%"></body>`);
  await p.waitForTimeout(200);
  await p.screenshot({ path: resolve(root, out), omitBackground: !pad });
  await p.close();
};
await icon(64, 'favicon.png', false);
await icon(180, 'img/apple-touch-icon.png', true);
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto('file://' + resolve(root, 'index.html'));
await p.addStyleTag({ content: `.top,.tools,.principles,.about,.foot{display:none}.hero{padding:34px 0 0}main{max-width:none;padding:0 34px}body{background:#111214}.laser{display:none}.studio-body{display:none}.hero h1{font-size:108px;max-width:none;margin-top:30px}.plate__face{height:562px}.plate__ink{clip-path:none!important;animation:none!important}` });
await p.waitForTimeout(500);
await p.screenshot({ path: resolve(root, 'img/og.png') });
await b.close();
console.log('ok');
