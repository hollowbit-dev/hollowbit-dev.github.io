// Screenshots every page (desktop + mobile) via a local server: node scripts/shot.mjs [outdir]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const require = createRequire(resolve(process.env.HOME, 'Desktop/Fileshaper/package.json'));
const { chromium } = require('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.argv[2] || resolve(root, '.shots'));
mkdirSync(out, { recursive: true });
const srv = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const b = await chromium.launch({ channel: 'chrome' });
const pages = { home: '/', fileshaper: '/fileshaper/', captionshaper: '/captionshaper/', about: '/about/', '404': '/404.html' };
for (const [vp, w, h] of [['d', 1440, 900], ['m', 390, 844]]) {
  for (const [name, path] of Object.entries(pages)) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: vp === 'm' ? 2 : 1 });
    await p.goto('http://127.0.0.1:8765' + path);
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `${out}/${name}-${vp}-fold.png` });
    // scroll through so reveals and scroll effects settle
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 400) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(60); }
    await p.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in')); document.querySelectorAll('.rules li').forEach((e) => e.classList.add('lit')); document.querySelectorAll('[data-tilt]').forEach((e) => { e.style.setProperty('--rx', '0deg'); e.style.setProperty('--sc', '1'); }); scrollTo(0, 0); });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}/${name}-${vp}.png`, fullPage: true });
    await p.close();
  }
}
// demo mid-states
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:8765/');
await p.waitForTimeout(3500);
await p.screenshot({ path: `${out}/demo-fs-mid.png` });
await p.click('#tab-cs');
await p.waitForTimeout(3200);
await p.screenshot({ path: `${out}/demo-cs-mid.png` });
await b.close();
srv.kill();
console.log('ok', out);
