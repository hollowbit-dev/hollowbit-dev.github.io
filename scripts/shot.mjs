// Screenshots the site for checking: node scripts/shot.mjs
// Uses the Playwright copy installed in ../Fileshaper.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(resolve(process.env.HOME, 'Desktop/Fileshaper/package.json'));
const { chromium } = require('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, '.impeccable/review');
mkdirSync(out, { recursive: true });
const url = 'file://' + resolve(root, 'index.html');

const browser = await chromium.launch({ channel: 'chrome' });
for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: name === 'mobile' ? 2 : 1 });
  await page.goto(url);
  await page.waitForTimeout(400);
  // first viewport mid-etch and settled
  await page.screenshot({ path: `${out}/${name}-fold.png` });
  // settle all motion: etch every plate, anodise products
  await page.evaluate(() => {
    document.querySelectorAll('[data-plate]').forEach((p) => { p.classList.remove('etch-wait'); p.classList.add('is-etching'); p.dataset.etched = '1'; });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/${name}-fold-settled.png` });
  await page.evaluate(() => document.querySelectorAll('[data-anodise]').forEach((p) => { p.classList.add('is-anodised'); p.closest('.product').classList.add('is-lit'); }));
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  await page.close();
}
// mid-laser frame for the hero
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url);
await page.waitForTimeout(650);
await page.screenshot({ path: `${out}/laser.png` });
// bare state of a product plate mid-dip
await page.evaluate(() => document.getElementById('tools').scrollIntoView());
await page.waitForTimeout(1600);
await page.mouse.move(400, 400);
await page.waitForTimeout(450);
await page.screenshot({ path: `${out}/dip.png` });
await browser.close();
console.log('ok');
