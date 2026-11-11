// Builds the static pages in 6 languages: node site/build.mjs
// Reads the latest release of each app from GitHub so download buttons always point at real files.
// English lives at /, other languages at /es/, /fr/, /de/, /ru/, /zh/.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://hollowbit.dev';
const CODES = ['en', 'es', 'fr', 'de', 'ru', 'zh'];
const LANGS = await Promise.all(CODES.map(async (c) => (await import(`./locales/${c}.mjs`)).default));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => o[k] ?? '');

/* ---------- products (language-neutral facts) ---------- */
const P = {
  fileshaper: {
    slug: 'fileshaper', name: 'Fileshaper', v: 'fs', domain: 'fileshaper.app', page: true,
    site: 'https://fileshaper.app/', repo: 'hollowbit-dev/fileshaper',
    imgs: [['fileshaper-video.webp', 1200, 760], ['fileshaper-images.webp', 1200, 760], ['fileshaper-pdf-sign.webp', 1200, 760]],
    fallback: { tag: 'v1.2.0', assets: ['Fileshaper-1.2.0-mac-arm64.dmg', 'Fileshaper-1.2.0-mac-x64.dmg', 'Fileshaper-Setup-1.2.0-win-x64.exe'] },
  },
  captionshaper: {
    slug: 'captionshaper', name: 'Captionshaper', v: 'cs', domain: 'captionshaper.app', page: true,
    site: 'https://captionshaper.app/', repo: 'hollowbit-dev/captionshaper',
    imgs: [['captionshaper-app-working.webp', 1440, 792], ['captionshaper-app-style.webp', 1600, 1018], ['captionshaper-app.webp', 1600, 1018]],
    fallback: { tag: 'v1.1.0', assets: ['Captionshaper-1.1.0-mac-arm64.dmg', 'Captionshaper-Setup-1.1.0-win-x64.exe'] },
  },
  // Diskshaper's own website lives on this domain at /diskshaper/, so it has no separate studio page.
  diskshaper: {
    slug: 'diskshaper', name: 'Diskshaper', v: 'ds', domain: 'hollowbit.dev/diskshaper', page: false,
    site: 'https://hollowbit.dev/diskshaper/', repo: 'hollowbit-dev/diskshaper',
    fallback: { tag: 'v1.0.0', assets: ['Diskshaper-1.0.0-mac-arm64.dmg', 'Diskshaper-1.0.0-mac-x64.dmg', 'Diskshaper-Setup-1.0.0-win-x64.exe'] },
  },
  // Writeshaper's website also lives on this domain, at /writeshaper/.
  writeshaper: {
    slug: 'writeshaper', name: 'Writeshaper', v: 'ws', domain: 'hollowbit.dev/writeshaper', page: false,
    site: 'https://hollowbit.dev/writeshaper/', repo: 'hollowbit-dev/writeshaper',
    fallback: { tag: 'v1.0.0', assets: ['Writeshaper-1.0.0-mac-arm64.dmg', 'Writeshaper-1.0.0-mac-x64.dmg', 'Writeshaper-Setup-1.0.0-win-x64.exe'] },
  },
};
const ORDER = ['fileshaper', 'captionshaper', 'diskshaper', 'writeshaper'];
// Screenshot sizes for the home page cards.
const SHOT = { fileshaper: [1600, 1018], captionshaper: [1600, 1018], diskshaper: [1600, 1025], writeshaper: [1600, 1085] };

for (const p of Object.values(P)) {
  let rel = p.fallback;
  try {
    const r = await fetch(`https://api.github.com/repos/${p.repo}/releases/latest`, { headers: { 'User-Agent': 'hollowbit-site-build' } });
    if (r.ok) { const j = await r.json(); rel = { tag: j.tag_name, assets: j.assets.map((a) => a.name), date: j.published_at }; }
  } catch { /* offline: use fallback */ }
  const dl = (name) => `https://github.com/${p.repo}/releases/latest/download/${name}`;
  const find = (re) => rel.assets.find((a) => re.test(a));
  p.version = rel.tag.replace(/^v/, '');
  p.date = rel.date || '';
  p.mac = find(/mac-arm64\.dmg$/) && dl(find(/mac-arm64\.dmg$/));
  p.macIntel = find(/mac-x64\.dmg$/) && dl(find(/mac-x64\.dmg$/));
  p.win = find(/win-x64\.exe$/) && dl(find(/win-x64\.exe$/));
  p.releases = `https://github.com/${p.repo}/releases`;
  p.issues = `https://github.com/${p.repo}/issues/new`;
  p.source = `https://github.com/${p.repo}`;
  p.plat = p.mac && p.win ? 'both' : p.mac ? 'mac' : 'win';
}
// Each product site has the same languages, at /<lang>/ (English at the root).
const siteIn = (p, lang) => p.site + (lang === 'en' ? '' : `${lang}/`);
const changelog = (p, lang) => `${siteIn(p, lang)}changelog.html`;
const FS = P.fileshaper, CS = P.captionshaper, DS = P.diskshaper, WS = P.writeshaper;

/* ---------- icons ---------- */
const GH = 'M8 .2a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.23 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 .2Z';
const S = (d) => `fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="${d}"`;
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="logo" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm9 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/></symbol>
  <symbol id="arrow" viewBox="0 0 16 16"><path ${S('M3.5 8h9m0 0L8.5 4m4 4-4 4')}/></symbol>
  <symbol id="out" viewBox="0 0 16 16"><path ${S('M5 11 11 5m0 0H6m5 0v5')}/></symbol>
  <symbol id="down" viewBox="0 0 16 16"><path ${S('M8 2.5v8m0 0 3.5-3.5M8 10.5 4.5 7M3 13.5h10')}/></symbol>
  <symbol id="check" viewBox="0 0 16 16"><path ${S('m3.5 8.5 3 3 6-7')}/></symbol>
  <symbol id="copy" viewBox="0 0 16 16"><path ${S('M5.5 5.5V3.75c0-.69.56-1.25 1.25-1.25h5.5c.69 0 1.25.56 1.25 1.25v5.5c0 .69-.56 1.25-1.25 1.25H10.5M3.75 5.5h5.5c.69 0 1.25.56 1.25 1.25v5.5c0 .69-.56 1.25-1.25 1.25h-5.5c-.69 0-1.25-.56-1.25-1.25v-5.5c0-.69.56-1.25 1.25-1.25Z')}/></symbol>
  <symbol id="mail" viewBox="0 0 16 16"><path ${S('M2.5 4.5h11v7.5h-11zM2.5 4.75 8 9l5.5-4.25')}/></symbol>
  <symbol id="bug" viewBox="0 0 16 16"><path ${S('M5.5 5.5a2.5 2.5 0 0 1 5 0M4.5 6.5h7v3.5a3.5 3.5 0 0 1-7 0V6.5ZM2.5 8.5h2m7 0h2M3 5l1.5 1.5M13 5l-1.5 1.5M3 13l1.6-1.4M13 13l-1.6-1.4M8 6.5v7')}/></symbol>
  <symbol id="spark" viewBox="0 0 16 16"><path ${S('M8 2v3m0 6v3m6-6h-3M5 8H2m10.2-4.2-2.1 2.1M5.9 10.1l-2.1 2.1m8.4 0-2.1-2.1M5.9 5.9 3.8 3.8')}/></symbol>
  <symbol id="heart" viewBox="0 0 16 16"><path fill="currentColor" d="M8 14s-5.5-3.3-5.5-7.3A3.2 3.2 0 0 1 8 4.5a3.2 3.2 0 0 1 5.5 2.2C13.5 10.7 8 14 8 14Z"/></symbol>
  <symbol id="star" viewBox="0 0 16 16"><path ${S('m8 2 1.8 3.8 4.2.5-3.1 2.9.8 4.1L8 11.3l-3.7 2 .8-4.1L2 6.3l4.2-.5L8 2Z')}/></symbol>
  <symbol id="share" viewBox="0 0 16 16"><path ${S('M8 10V2.5m0 0L5 5.5m3-3 3 3M3.5 8.5v4a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-4')}/></symbol>
  <symbol id="cup" viewBox="0 0 16 16"><path ${S('M2.5 5.5h8v4a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-4Zm8 1h1a1.75 1.75 0 0 1 0 3.5h-1M5 2.5v1.2m2.5-1.2v1.2')}/></symbol>
  <symbol id="globe" viewBox="0 0 16 16"><path ${S('M8 1.75a6.25 6.25 0 1 0 0 12.5A6.25 6.25 0 0 0 8 1.75ZM1.75 8h12.5M8 1.75c1.7 1.7 2.5 3.8 2.5 6.25S9.7 12.55 8 14.25C6.3 12.55 5.5 10.45 5.5 8S6.3 3.45 8 1.75Z')}/></symbol>
  <symbol id="gh" viewBox="0 0 16 16"><path fill="currentColor" d="${GH}"/></symbol>
  <symbol id="apple" viewBox="0 0 16 16"><path fill="currentColor" d="M11.24 8.5c-.02-1.63 1.33-2.41 1.39-2.45-.76-1.11-1.94-1.26-2.36-1.28-1-.1-1.96.59-2.47.59-.51 0-1.29-.58-2.12-.56-1.09.02-2.1.64-2.66 1.61-1.14 1.97-.29 4.89.82 6.49.54.78 1.19 1.66 2.03 1.63.82-.03 1.13-.53 2.12-.53.99 0 1.27.53 2.13.51.88-.01 1.44-.8 1.98-1.58.62-.9.88-1.78.89-1.83-.02-.01-1.71-.66-1.73-2.6Zm-1.62-4.8c.45-.55.76-1.31.67-2.07-.65.03-1.44.43-1.91.98-.42.48-.79 1.26-.69 2 .73.06 1.47-.37 1.93-.91Z"/></symbol>
  <symbol id="windows" viewBox="0 0 16 16"><path fill="currentColor" d="M1.5 3.2 6.8 2.5v5H1.5V3.2Zm6.1-.8 6.9-.9v6H7.6V2.4ZM1.5 8.3h5.3v5.2l-5.3-.7V8.3Zm6.1 0h6.9v6.2l-6.9-.9V8.3Z"/></symbol>
  <symbol id="i-upload" viewBox="0 0 32 32"><path ${S('M16 21V9m0 0-5 5m5-5 5 5M6 26h20M4 4l24 24')}/></symbol>
  <symbol id="i-ads" viewBox="0 0 32 32"><path ${S('M5 8h22v16H5zM11 19l2.5-7 2.5 7m-4.2-2h3.4M19 12h2.5a3.5 3.5 0 0 1 0 7H19v-7ZM4 4l24 24')}/></symbol>
  <symbol id="i-account" viewBox="0 0 32 32"><path ${S('M16 16a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 11a9 9 0 0 1 18 0M4 4l24 24')}/></symbol>
  <symbol id="i-track" viewBox="0 0 32 32"><path ${S('M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16Zm13 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 4l24 24')}/></symbol>
  <symbol id="i-wifi" viewBox="0 0 32 32"><path ${S('M5 13a16 16 0 0 1 22 0M9 17.5a10 10 0 0 1 14 0M13 22a4.5 4.5 0 0 1 6 0M16 26h.01M4 4l24 24')}/></symbol>
  <symbol id="i-code" viewBox="0 0 32 32"><path ${S('m11 10-6 6 6 6m10-12 6 6-6 6M18.5 7l-5 18')}/></symbol>
</svg>`;
const ic = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;


// Stylesheet version, so browsers fetch the new CSS after every change.
const CSSV = (await import('node:crypto')).createHash('md5').update(readFileSync(resolve(root, 'site/main.css'), 'utf8') + readFileSync(resolve(root, 'site/demo.css'), 'utf8')).digest('hex').slice(0, 8);
/* ---------- socials ---------- */
const SOCIALS = [
  ['X', 'https://x.com/hollowbitstudio', '<path fill="currentColor" d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/>'],
  ['YouTube', 'https://www.youtube.com/@hollowbitstudio', '<path fill="currentColor" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z"/>'],
  ['TikTok', 'https://www.tiktok.com/@hollowbitstudio', '<path fill="currentColor" d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9.1a6.3 6.3 0 1 0 5.4 6.3V8.6a8 8 0 0 0 4.6 1.5V6.7a4.6 4.6 0 0 1-4.6-4.7Z"/>'],
  ['Instagram', 'https://www.instagram.com/hollowbitstudio', '<path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2Zm0 4.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Zm5.3-9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z"/>'],
  ['Reddit', 'https://www.reddit.com/user/hollowbitstudio', '<path fill="currentColor" d="M22 12.1a2.2 2.2 0 0 0-3.7-1.6 10.8 10.8 0 0 0-5.8-1.8l1-4.6 3.2.7a1.6 1.6 0 1 0 .2-1l-3.6-.8a.5.5 0 0 0-.6.4l-1.1 5.3a10.8 10.8 0 0 0-5.9 1.8A2.2 2.2 0 1 0 3.3 14a4.3 4.3 0 0 0 0 .7c0 3.4 3.9 6.1 8.7 6.1s8.7-2.7 8.7-6.1a4.3 4.3 0 0 0 0-.7 2.2 2.2 0 0 0 1.3-1.9ZM7 13.7a1.6 1.6 0 1 1 1.6 1.6A1.6 1.6 0 0 1 7 13.7Zm9 4.2a5.8 5.8 0 0 1-4 1.2 5.8 5.8 0 0 1-4-1.2.4.4 0 0 1 .6-.6 5 5 0 0 0 3.4 1 5 5 0 0 0 3.4-1 .4.4 0 1 1 .6.6Zm-.4-2.6a1.6 1.6 0 1 1 1.6-1.6 1.6 1.6 0 0 1-1.6 1.6Z"/>'],
  ['GitHub', 'https://github.com/hollowbit-dev', `<path fill="currentColor" transform="scale(1.5)" d="${GH}"/>`],
];
const socials = (cls = '') => `<div class="socials ${cls}">${SOCIALS.map(([n, u, d]) => `<a href="${u}" aria-label="${n}" title="${n}" rel="me noopener"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${d}</svg></a>`).join('')}</div>`;
/* ---------- shell ---------- */
// Paths are written root-absolute for the page's language (/es/about/), then made relative at write time.
const pre = (L) => (L.lang === 'en' ? '' : `/${L.lang}`);
const navItems = (L) => [
  [`${pre(L)}/fileshaper/`, 'Fileshaper', 'fileshaper'], [`${pre(L)}/captionshaper/`, 'Captionshaper', 'captionshaper'], [siteIn(DS, L.lang), 'Diskshaper', 'diskshaper'], [siteIn(WS, L.lang), 'Writeshaper', 'writeshaper'],
  [`${pre(L)}/download/`, L.nav.download, 'download'], [`${pre(L)}/about/`, L.nav.about, 'about'], [`${pre(L)}/contact/`, L.nav.contact, 'contact'], [`${pre(L)}/donate/`, L.nav.donate, 'donate'],
];

function page(L, { path, key = '', title, desc, body, cls = '' }) {
  const t = L;
  const NAV = navItems(L);
  const nav = NAV.map(([h, l, k]) => `<a href="${h}"${k === key ? ' aria-current="page"' : ''}>${k === key ? '<span class="nav-pill"></span>' : ''}<span class="nav-label">${esc(l)}</span></a>`).join('');
  const sheet = [[`${pre(L)}/`, t.nav.home, 'home'], ...NAV].map(([h, l, k], i) => `<a href="${h}" style="--i:${i}"${k === key ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('');
  const url = (code) => `${ORIGIN}${code === 'en' ? '' : `/${code}`}${path}`;
  const alt = path ? `${LANGS.map((l) => `<link rel="alternate" hreflang="${l.html}" href="${url(l.lang)}">`).join('\n')}\n<link rel="alternate" hreflang="x-default" href="${url('en')}">` : '';
  const langMenu = `<details class="lang"><summary aria-label="${esc(t.nav.language)}">${ic('globe')}<span>${L.lang.toUpperCase()}</span></summary><div class="lang-menu">${LANGS.map((l) => `<a href="${l.lang === 'en' ? '' : `/${l.lang}`}${path ?? '/'}" hreflang="${l.html}" lang="${l.html}" data-set-lang="${l.lang}"${l.lang === L.lang ? ' aria-current="true"' : ''}>${l.name}</a>`).join('')}</div></details>`;
  return `<!doctype html>
<html lang="${L.html}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${path ? `<link rel="canonical" href="${url(L.lang)}">\n${alt}` : '<meta name="robots" content="noindex">'}
<meta name="theme-color" content="#0b0a10">
<meta property="og:type" content="website">
${path ? `<meta property="og:url" content="${url(L.lang)}">` : ''}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:locale" content="${L.html.replace('-', '_')}">
<meta property="og:image" content="${ORIGIN}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/style.css?v=${CSSV}">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Hollowbit Studio","alternateName":"Hollowbit","url":"https://hollowbit.dev/","logo":"https://hollowbit.dev/favicon.png","founder":{"@type":"Person","name":"Elvis Zygmanta"},"email":"hollowbitstudio@gmail.com","sameAs":["https://github.com/hollowbit-dev","https://ko-fi.com/hollowbit","https://x.com/hollowbitstudio","https://www.youtube.com/@hollowbitstudio","https://www.tiktok.com/@hollowbitstudio","https://www.instagram.com/hollowbitstudio","https://www.reddit.com/user/hollowbitstudio","https://fileshaper.app","https://captionshaper.app","https://hollowbit.dev/diskshaper/","https://hollowbit.dev/writeshaper/"]}</script>
<script>(function(d,u){d.classList.add('js');d.dataset.os=/Windows/.test(u)?'win':/Macintosh/.test(u)?'mac':'other'})(document.documentElement,navigator.userAgent);window.HB=${JSON.stringify({ lang: L.lang, langs: CODES, copied: t.contact.copied, osNote: t.download.note })}</script>
</head>
<body class="${cls}">
<div class="wash" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<a class="skip" href="#main">${esc(t.nav.skip)}</a>
${sprite}
<header class="nav" data-nav>
  <div class="nav-in">
    <a class="brand" href="${pre(L)}/" aria-label="Hollowbit">${ic('logo', 'logo')}<span>Hollowbit</span></a>
    <nav class="nav-links" aria-label="${esc(t.nav.main)}">${nav}</nav>
    <div class="nav-end">
      ${langMenu}
      <a class="btn btn-primary btn-sm nav-dl" href="${pre(L)}/download/">${ic('down')}${esc(t.nav.download)}</a>
      <button class="nav-menu" type="button" aria-expanded="false" aria-controls="sheet" aria-label="${esc(t.nav.menu)}"><span></span><span></span></button>
    </div>
  </div>
  <div class="sheet" id="sheet"><nav aria-label="${esc(t.nav.mobile)}">${sheet}</nav></div>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="brand" href="${pre(L)}/" aria-label="Hollowbit">${ic('logo', 'logo')}<span>Hollowbit</span></a>
        <p>${esc(t.footer.about)}</p>
        <a class="foot-mail" data-email-link href="${pre(L)}/contact/">${ic('mail')}<span data-email>${esc(t.footer.contact)}</span></a>
        ${socials()}
      </div>
      <nav aria-label="${esc(t.footer.products)}"><h2>${esc(t.footer.products)}</h2><a href="${pre(L)}/fileshaper/">Fileshaper</a><a href="${pre(L)}/captionshaper/">Captionshaper</a><a href="${siteIn(DS, L.lang)}">Diskshaper</a><a href="${siteIn(WS, L.lang)}">Writeshaper</a><a href="${pre(L)}/download/">${esc(t.nav.download)}</a></nav>
      <nav aria-label="${esc(t.footer.studio)}"><h2>${esc(t.footer.studio)}</h2><a href="${pre(L)}/about/">${esc(t.nav.about)}</a><a href="${pre(L)}/contact/">${esc(t.nav.contact)}</a><a href="${pre(L)}/donate/">${esc(t.nav.donate)}</a><a href="${pre(L)}/privacy/">${esc(t.footer.privacy)}</a></nav>
      <nav aria-label="${esc(t.footer.elsewhere)}"><h2>${esc(t.footer.elsewhere)}</h2><a href="https://github.com/hollowbit-dev">GitHub</a><a href="https://ko-fi.com/hollowbit">Ko-fi</a><a href="${siteIn(FS, L.lang)}">fileshaper.app</a><a href="${siteIn(CS, L.lang)}">captionshaper.app</a></nav>
    </div>
    <div class="foot-bottom"><span>© 2026 Hollowbit Studio · Elvis Zygmanta</span><span>${esc(t.footer.note)}</span></div>
  </div>
  <div class="foot-word" aria-hidden="true"><span>Hollowbit</span></div>
</footer>
<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

/* ---------- pieces ---------- */
const plats = (L, p) => L.product.plats[p.plat];
const dlButtons = (L, p, { dark = false, site = false } = {}) => {
  const cls = dark ? 'btn-dark' : 'btn-primary';
  const b = [];
  if (p.mac) b.push(`<a class="btn ${cls} btn-lg dl-btn" data-os-btn="mac" href="${p.mac}">${ic('apple')}<span>${esc(L.common.dlMac)}</span></a>`);
  if (p.win) b.push(`<a class="btn ${cls} btn-lg dl-btn" data-os-btn="win" href="${p.win}">${ic('windows')}<span>${esc(L.common.dlWin)}</span></a>`);
  if (site) b.push(`<a class="btn btn-ghost btn-lg site-btn" href="${siteIn(p, L.lang)}">${esc(fill(L.common.visit, { domain: p.domain }))} ${ic('out')}</a>`);
  return `<div class="dl-row">${b.join('')}</div>`;
};

const fsDemo = (L) => `<div class="demo demo-fs" id="demo-fs" role="tabpanel" aria-labelledby="tab-fs">
  <p class="sr-only">${esc(L.home.srFs)}</p>
  <div class="win" aria-hidden="true">
    <aside class="fs-side">
      <div class="tl"><i></i><i></i><i></i></div>
      <div class="fs-brand"><img src="/assets/img/fileshaper-icon.png" alt=""><div><b>Fileshaper</b><small>by Hollowbit Studio</small></div></div>
      <div class="fs-search">Search actions <kbd>⌘K</kbd></div>
      <div class="fs-nav"><span class="on">Home</span><em>Tools</em><span>Video <small>2</small></span><span>Images <small>4</small></span><span>PDF</span><span>Audio <small>1</small></span></div>
      <div class="fs-offline"><i></i>Offline. Nothing is uploaded.</div>
    </aside>
    <div class="fs-main">
      <div class="fs-q">What do you want to do?</div>
      <div class="fs-field"><svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="m10.5 10.5 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg><span class="fs-typed"></span><span class="caret"></span><span class="fs-ph">Compress a video, convert a photo, sign a PDF…</span></div>
      <ul class="fs-list">
        <li data-k="compress video for discord"><b>Compress a video for Discord</b><span>under 10 MB</span><em>Video</em></li>
        <li data-k="convert iphone photos to jpg"><b>Convert iPhone photos to JPG</b><span>HEIC to JPG</span><em>Images</em></li>
        <li data-k="sign a pdf"><b>Sign a PDF</b><span>draw or type a signature</span><em>PDF</em></li>
        <li data-k="merge pdfs"><b>Merge PDFs</b><span>combine files</span><em>PDF</em></li>
        <li data-k="make a gif from a video"><b>Make a GIF from a video</b><span>2–6 seconds</span><em>Video</em></li>
      </ul>
      <div class="fs-job">
        <div class="fs-file"><span class="ext">MP4</span><div><b>beach-day.mp4</b><small class="fs-status">Encoding, pass 1 of 2</small></div><span class="fs-size">214 MB</span></div>
        <div class="fs-bar"><i></i></div>
        <div class="fs-done">${ic('check')}<span><b>214 MB → 9.6 MB</b> · fits Discord's 10 MB limit</span></div>
      </div>
      <div class="fs-recent">
        <em>Recent</em>
        <div class="fs-r"><span class="ext">MP3</span><div><b>Voice memo 12-normalized.mp3</b><small>1.1 MB → 704 KB · −40%</small></div><span>just now</span></div>
        <div class="fs-r"><span class="ext">JPG</span><div><b>IMG_4822.jpg</b><small>HEIC → JPG · 103 KB</small></div><span>2 min ago</span></div>
        <div class="fs-r"><span class="ext">PDF</span><div><b>Lease-signed.pdf</b><small>Signed · 3 pages</small></div><span>today</span></div>
      </div>
    </div>
  </div>
</div>`;

const csDemo = (L) => `<div class="demo demo-cs" id="demo-cs" role="tabpanel" aria-labelledby="tab-cs">
  <p class="sr-only">${esc(L.home.srCs)}</p>
  <div class="win" aria-hidden="true">
    <div class="cs-top"><div class="tl"><i></i><i></i><i></i></div><b>beach-day.mp4</b><span>0:38 · English</span><span class="cs-grow"></span><span class="cs-saved">Saved</span><span class="cs-export">Export</span></div>
    <div class="cs-body">
      <div class="cs-player"><div class="cs-phone"><div class="cs-video"></div><div class="cs-cap"></div><div class="cs-ui"><i></i><i></i><i></i></div></div></div>
      <div class="cs-side"><div class="cs-tabs"><span class="on">Captions</span><span>Style</span></div><div class="cs-list"></div></div>
    </div>
    <div class="cs-timeline"><span class="cs-play"></span><span class="cs-time">0:12 / 0:38</span><div class="cs-wave"><i class="cs-head"></i></div></div>
  </div>
</div>`;

// Diskshaper demo: categories land, the bar fills, safe ones are moved to the Trash.
const DS_CATS = [['g', 'Shader caches', 7.6, 1], ['c', 'Video editing caches', 37.1, 1], ['g', 'Steam leftovers', 6.1, 1], ['e', 'App caches', 5.2, 1], ['e', 'Old installers', 4.0, 1], ['e', 'Duplicate photos', 2.4, 0], ['g', 'Games you stopped playing', 41.2, 0]];
const dsDemo = (L) => `<div class="demo demo-ds" id="demo-ds" role="tabpanel" aria-labelledby="tab-ds">
  <p class="sr-only">${esc(L.home.srDs)}</p>
  <div class="win" aria-hidden="true">
    <div class="ds-top"><div class="tl"><i></i><i></i><i></i></div><span class="ds-brand"><img src="/assets/img/diskshaper-icon.png" alt="">Diskshaper</span><span class="ds-tabs"><b>Overview</b><span>Everyone</span><span>Gaming</span><span>Video editing</span></span></div>
    <div class="ds-body">
      <div class="ds-head"><div><small>Found</small><div class="ds-big"><span class="ds-found">0</span><em>GB</em></div></div><div class="ds-side"><small>Safe to clean</small><b class="ds-safe">0 GB</b></div></div>
      <div class="ds-bar">${DS_CATS.map(([g, , gb, s], i) => `<i class="ds-${g}${s ? ' s' : ''}" style="--w:${gb}" data-i="${i}"></i>`).join('')}</div>
      <div class="ds-rows">${DS_CATS.map(([g, n, gb, s], i) => `<div class="ds-row" data-i="${i}" data-gb="${gb}"><b class="ds-${g}"></b><span>${n}</span><em class="${s ? 'ok' : 'ck'}">${s ? 'Safe' : 'Check first'}</em><strong>0 GB</strong></div>`).join('')}</div>
      <div class="ds-dock"><span><b class="ds-sel">0 GB</b> selected</span><span class="ds-btn">Move to Trash</span></div>
      <div class="ds-done"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-15"/></svg><b>60 GB</b><span>moved to the Trash</span></div>
    </div>
  </div>
</div>`;

// Writeshaper demo: a sentence in a mail window is selected, the panel opens and fixes it, Replace pastes it back.
const wsDemo = (L) => `<div class="demo demo-ws" id="demo-ws" role="tabpanel" aria-labelledby="tab-ws">
  <p class="sr-only">${esc(L.home.srWs)}</p>
  <div class="win" aria-hidden="true">
    <div class="ws-top"><div class="tl"><i></i><i></i><i></i></div><span>New message</span></div>
    <div class="ws-meta"><div><b>To</b>sarah.lee@company.com</div><div><b>Subject</b>Report</div></div>
    <div class="ws-text"><span class="ws-line"></span></div>
    <div class="ws-keys"><span>⌥</span><span>Space</span></div>
    <div class="ws-panel">
      <div class="ws-glow"></div>
      <div class="ws-card">
        <div class="ws-ph"><img src="/assets/img/writeshaper-icon.png" alt=""><b>Writeshaper</b><span class="ws-st">Fixing…</span><span class="ws-esc">esc</span></div>
        <div class="ws-out"></div>
        <div class="ws-modes"><span class="on">Fix</span><span>Clearer</span><span>Shorter</span><span>Friendlier</span><span>Professional</span><span>Translate</span></div>
        <div class="ws-foot"><span class="ws-count"></span><span class="ws-copy">Copy</span><span class="ws-rep">Replace ↵</span></div>
      </div>
    </div>
  </div>
</div>`;

function stage(L, only) {
  const tab = (id, p) => `<button class="tab" role="tab" aria-selected="${id === 'fs'}" aria-controls="demo-${id}" id="tab-${id}" style="--c: var(--${id})"><img src="/assets/img/${p.slug}-icon.png" alt="" width="20" height="20"><span class="tab-name">${p.name}</span><span class="tab-bar"><i></i></span></button>`;
  const tabs = only ? '' : `<div class="stage-tabs" role="tablist" aria-label="${esc(L.home.demos)}">${tab('fs', FS)}${tab('cs', CS)}${tab('ds', DS)}${tab('ws', WS)}</div>`;
  const demos = only === 'fs' ? fsDemo(L) : only === 'cs' ? csDemo(L) : fsDemo(L) + csDemo(L) + dsDemo(L) + wsDemo(L);
  return `<div class="stage${only ? ' stage-single' : ''}" data-stage>${tabs}<div class="stage-frame"><div class="stage-scale">${demos}</div></div></div>`;
}

const ticker = (L) => {
  const items = (p) => L.products[p.slug].tasks.map((t) => `<span style="--c: var(--${p.v})"><i></i>${esc(t)}</span>`).join('');
  const a = items(FS) + items(WS) + items(DS) + items(CS);
  const b = items(CS) + items(DS) + items(FS) + items(WS);
  return `<div class="ticker" aria-hidden="true"><div class="ticker-track">${a}${a}</div><div class="ticker-track rev">${b}${b}</div></div>`;
};
const PR_ICONS = ['i-upload', 'i-wifi', 'i-ads', 'i-account', 'i-track', 'i-code'];

/* ---------- pages ---------- */
const home = (L) => page(L, {
  path: '/', key: 'home', title: L.home.title, desc: L.home.desc,
  body: `
<section class="hero wrap">
  <a class="hero-badge in-0" href="${siteIn(WS, L.lang)}"><span class="dot"></span>${esc(fill(L.home.badge, { v: WS.version }))}<svg aria-hidden="true"><use href="#arrow"/></svg></a>
  <h1 class="hero-title" data-words data-hl="${esc(L.home.hl)}">${esc(L.home.h1)}</h1>
  <p class="hero-sub in-1">${esc(L.home.sub)}</p>
  <div class="hero-cta in-2">
    <a class="btn btn-primary btn-lg" href="${pre(L)}/download/">${ic('down')}${esc(L.home.cta)}</a>
    <a class="btn btn-ghost btn-lg" href="#tools">${esc(L.home.see)}</a>
  </div>
  <div class="in-3">${stage(L)}</div>
</section>

${ticker(L)}

<section class="wrap sec" id="tools">
  <div class="sec-head">
    <h2 class="h2" data-words="scroll">${esc(L.home.toolsH)}</h2>
    <p class="reveal">${esc(L.home.toolsP)}</p>
  </div>
  <div class="cards">
    ${ORDER.map((k, i) => { const p = P[k], c = L.products[k]; return `<article class="pcard pcard-${p.v} reveal" style="--d:${i * 90}ms" data-tilt-card>
      <div class="pcard-in">
        <img class="pcard-icon vt-icon-${p.v}" src="/assets/img/${p.slug}-icon.png" width="56" height="56" alt="">
        <h3>${p.name}${c.newTag ? ` <span class="pcard-new">${esc(c.newTag)}</span>` : ''}</h3>
        <p>${esc(c.blurb)}</p>
        <div class="pcard-cta">
          <a class="btn btn-dark" href="${p.page ? `${pre(L)}/${p.slug}/` : siteIn(p, L.lang)}">${esc(L.common.learn)} ${ic('arrow')}</a>
          <a class="btn btn-line" href="${pre(L)}/download/#${p.slug}">${ic('down')}${esc(L.common.download)}</a>
          ${p.page ? `<a class="btn btn-line" href="${siteIn(p, L.lang)}">${esc(L.common.website)} ${ic('out')}</a>` : ''}
        </div>
        <small class="pcard-meta">v${p.version} · ${esc(plats(L, p))} · ${esc(fill(L.common.official, { domain: p.domain }))}</small>
      </div>
      <div class="pcard-shot"><img src="/assets/img/${p.slug}-app.webp" width="${SHOT[k][0]}" height="${SHOT[k][1]}" alt="" loading="lazy"></div>
    </article>`; }).join('\n    ')}
  </div>
</section>

<section class="wrap sec">
  <div>
    <div class="sec-head">
      <h2 class="h2" data-words="scroll">${esc(L.home.freeH)}</h2>
      <p class="reveal">${esc(L.home.freeP)}</p>
    </div>
    <div class="princ">
      ${L.principles.map(([h, t], n) => `<div class="pr reveal" style="--d:${n * 70}ms; --c: var(--k${n})"><span class="pr-tile">${ic(PR_ICONS[n], 'pr-icon')}</span><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="wrap sec">
  <div class="cta-box reveal">
    <div class="cta-icons">${ORDER.map((k) => `<img src="/assets/img/${k}-icon.png" alt="" width="72" height="72">`).join('')}</div>
    <h2 class="h2" data-words="scroll">${esc(L.home.ctaH)}</h2>
    <p>${esc(L.home.ctaP)}</p>
    <div class="hero-cta"><a class="btn btn-primary btn-lg" href="${pre(L)}/download/">${ic('down')}${esc(L.home.ctaGo)}</a><a class="btn btn-ghost btn-lg" href="${pre(L)}/about/">${esc(L.home.ctaWho)}</a></div>
  </div>
</section>`,
});

function productPage(L, p, next) {
  const c = L.products[p.slug], n = L.products[next.slug];
  return page(L, {
    path: `/${p.slug}/`, key: p.slug, cls: `p-${p.v}`,
    title: `${p.name}: ${c.kind} ${L.product.titleSuffix}`,
    desc: fill(L.product.desc, { blurb: c.blurb, plats: plats(L, p) }),
    body: `
<section class="phero wrap" style="--c: var(--${p.v})">
  <img class="phero-icon vt-icon-${p.v}" src="/assets/img/${p.slug}-icon.png" width="96" height="96" alt="">
  <p class="phero-name in-0">${p.name}</p>
  <h1 class="phero-title" data-words>${esc(c.line)}</h1>
  <p class="phero-sub in-1">${esc(c.lede)}</p>
  <div class="in-2">${dlButtons(L, p, { site: true })}</div>
  <p class="phero-meta in-2">${esc(L.common.version)} ${p.version} · ${esc(L.common.free)} · <a href="${p.source}">${esc(L.common.source)}</a> · <a href="${changelog(p, L.lang)}">${esc(L.common.whatsNew)}</a></p>
  <div class="in-3 phero-stage">${stage(L, p.v)}</div>
</section>

<section class="wrap sec rows" style="--c: var(--${p.v})">
  ${c.rows.map(([h, t, alt], i) => { const [img, w, ht] = p.imgs[i]; return `<div class="row${i % 2 ? ' row-flip' : ''}">
    <div class="row-copy"><h2 class="h3" data-words="scroll">${esc(h)}</h2><p class="reveal">${esc(t)}</p></div>
    <figure class="row-shot" data-wipe><img src="/assets/img/${img}" width="${w}" height="${ht}" loading="lazy" alt="${esc(alt)}"></figure>
  </div>`; }).join('\n  ')}
</section>

<section class="band-color" style="--c: var(--${p.v})">
  <div class="wrap band-in">
    <div class="band-copy">
      <img src="/assets/img/${p.slug}-icon.png" width="64" height="64" alt="">
      <h2 class="h2" data-words="scroll">${esc(c.close)}</h2>
      <p class="reveal">${esc(fill(L.product.bandP, { plats: plats(L, p) }))}</p>
    </div>
    <div class="band-dl reveal">
      ${dlButtons(L, p, { dark: true })}
      <div class="band-links"><a href="${pre(L)}/download/#${p.slug}">${esc(L.product.allDl)}</a><a href="${changelog(p, L.lang)}">${esc(L.common.whatsNew)}</a><a href="${siteIn(p, L.lang)}">${p.domain}</a></div>
    </div>
  </div>
</section>

<section class="wrap next-sec">
  <a class="next reveal" href="${next.page ? `${pre(L)}/${next.slug}/` : siteIn(next, L.lang)}" style="--c: var(--${next.v})">
    <img src="/assets/img/${next.slug}-icon.png" alt="" width="56" height="56">
    <span><small>${esc(L.product.also)}</small><b>${next.name}</b><em>${esc(n.blurb)}</em></span>
    <span class="next-go">${ic('arrow')}</span>
  </a>
</section>`,
  });
}

const steps = (arr) => `<ol>${arr.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`;
const download = (L) => {
  const d = L.download;
  const date = (p) => (p.date ? new Date(p.date).toLocaleDateString(L.locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '');
  return page(L, {
    path: '/download/', key: 'download', title: d.title, desc: d.desc,
    body: `
<section class="dhero wrap">
  <h1 class="h1" data-words>${esc(d.h1)}</h1>
  <p class="phero-sub in-1">${esc(d.sub)}<span class="os-note" data-os-note></span></p>
</section>
<section class="wrap dl-list">
  ${ORDER.map((k, i) => { const p = P[k], c = L.products[k]; return `<article class="dl-card in-${Math.min(i + 2, 3)}" id="${p.slug}" style="--c: var(--${p.v})">
    <header class="dl-head">
      <img src="/assets/img/${p.slug}-icon.png" width="64" height="64" alt="">
      <div><h2>${p.name}</h2><p>${esc(c.blurb)}</p></div>
      <span class="dl-ver">v${p.version}${date(p) ? `<small>${date(p)}</small>` : ''}</span>
    </header>
    <div class="dl-plats">
      ${p.mac ? `<div class="plat" data-plat="mac">
        <div class="plat-h">${ic('apple')}<b>Mac</b><span class="rec">${esc(d.yours)}</span></div>
        <p>${esc(c.req.mac)}</p>
        <a class="btn btn-primary dl-btn" href="${p.mac}">${ic('down')}${esc(d.appleSilicon)}</a>
        ${p.macIntel ? `<a class="plat-alt" href="${p.macIntel}">${esc(d.intel)}</a>` : `<span class="plat-alt muted">${esc(d.siliconOnly)}</span>`}
      </div>` : ''}
      ${p.win ? `<div class="plat" data-plat="win">
        <div class="plat-h">${ic('windows')}<b>Windows</b><span class="rec">${esc(d.yours)}</span></div>
        <p>${esc(c.req.win)}</p>
        <a class="btn btn-primary dl-btn" href="${p.win}">${ic('down')}${esc(d.winBtn)}</a>
        <span class="plat-alt muted">${esc(d.winNote)}</span>
      </div>` : ''}
    </div>
    <details class="help">
      <summary>${esc(d.first)}<span class="chev" aria-hidden="true"></span></summary>
      <div class="help-in">
        <p>${esc(fill(d.unsigned, { app: p.name }))}</p>
        <div class="help-cols"><div><h3>${ic('apple')}Mac</h3>${steps(c.firstMac)}</div><div><h3>${ic('windows')}Windows</h3>${steps(c.firstWin)}</div></div>
        <ul class="help-req">${c.req.extra.map((r) => `<li>${ic('check')}${esc(r)}</li>`).join('')}</ul>
      </div>
    </details>
    <footer class="dl-foot"><a href="${changelog(p, L.lang)}">${esc(d.notes)} ${ic('out')}</a><a href="${p.releases}">${esc(d.older)} ${ic('out')}</a><a href="${p.source}">${esc(L.common.source)} ${ic('out')}</a><a href="${siteIn(p, L.lang)}">${p.domain} ${ic('out')}</a></footer>
  </article>`; }).join('\n  ')}
</section>`,
  });
};

const about = (L) => {
  const a = L.about;
  return page(L, {
    path: '/about/', key: 'about', title: a.title, desc: a.desc,
    body: `
<section class="ahero wrap-narrow">
  <span class="ahero-logo">${ic('logo')}</span>
  <h1 class="h1" data-words>${esc(a.h1)}</h1>
  <div class="ahero-body in-1">
    <p class="lead">${esc(a.lead)}</p>
    <p>${esc(a.p1)}</p>
    <p>${esc(a.p2)}</p>
  </div>
</section>

<section class="wrap-narrow sec">
  <h2 class="h2" data-words="scroll">${esc(a.rulesH)}</h2>
  <ol class="rules">
    ${a.rules.map(([b, n]) => `<li><span class="rule-big">${esc(b)}</span><span class="rule-note">${esc(n)}</span></li>`).join('\n    ')}
  </ol>
</section>

<section class="wrap sec">
  <div>
    <div class="sec-head"><h2 class="h2" data-words="scroll">${esc(a.appsH)}</h2><p class="reveal">${esc(a.appsP)}</p></div>
    <div class="mini-list">
      ${ORDER.map((k, i) => { const p = P[k]; return `<a class="mini reveal" style="--d:${i * 90}ms" href="${p.page ? `${pre(L)}/${p.slug}/` : siteIn(p, L.lang)}"><img src="/assets/img/${p.slug}-icon.png" width="52" height="52" alt=""><span><b>${p.name}</b><small>${esc(L.products[k].blurb)}</small></span><em>v${p.version}</em>${ic('arrow', 'go')}</a>`; }).join('')}
    </div>
  </div>
</section>

<section class="wrap-narrow sec links-sec">
  <a class="link-card reveal" href="${pre(L)}/contact/">${ic('mail', 'lc-icon')}<span><b>${esc(a.touch)}</b><small>${esc(a.touchP)}</small></span>${ic('arrow', 'go')}</a>
  <a class="link-card reveal" style="--d:90ms" href="${pre(L)}/donate/">${ic('heart', 'lc-icon')}<span><b>${esc(a.donate)}</b><small>${esc(a.donateP)}</small></span>${ic('arrow', 'go')}</a>
</section>`,
  });
};

const contact = (L) => {
  const c = L.contact;
  return page(L, {
    path: '/contact/', key: 'contact', title: c.title, desc: c.desc,
    body: `
<section class="dhero wrap">
  <h1 class="h1" data-words>${esc(c.h1)}</h1>
  <p class="phero-sub in-1">${esc(c.sub)}</p>
</section>
<section class="wrap contact">
  <div class="mail-card in-2">
    <span class="mc-icon">${ic('mail')}</span>
    <div class="mc-text"><small>${esc(c.email)}</small><a class="mc-addr" data-email-link href="${pre(L)}/contact/"><span data-email>hollowbitstudio [at] gmail.com</span></a></div>
    <div class="mc-actions">
      <button class="btn btn-ghost" type="button" data-copy-email>${ic('copy')}<span>${esc(c.copy)}</span></button>
      <a class="btn btn-primary" data-email-link href="${pre(L)}/contact/">${esc(c.write)} ${ic('arrow')}</a>
    </div>
  </div>
  <div class="social-card reveal"><h2>${esc(L.footer.elsewhere)}</h2><span>@hollowbitstudio</span>${socials('big')}</div>
  <div class="ways">
    <div class="way reveal">
      <span class="way-tile" style="--c: var(--k3)">${ic('bug', 'way-icon')}</span>
      <h2>${esc(c.bugH)}</h2>
      <p>${esc(c.bugP)}</p>
      <div class="way-links">${ORDER.map((k) => `<a href="${P[k].issues}">${esc(fill(c.bugLink, { app: P[k].name }))} ${ic('out')}</a>`).join('')}</div>
    </div>
    <div class="way reveal" style="--d:90ms">
      <span class="way-tile" style="--c: var(--k4)">${ic('spark', 'way-icon')}</span>
      <h2>${esc(c.ideaH)}</h2>
      <p>${esc(c.ideaP)}</p>
      <div class="way-links"><a href="https://github.com/hollowbit-dev">github.com/hollowbit-dev ${ic('out')}</a></div>
    </div>
    <div class="way reveal" style="--d:180ms">
      <span class="way-tile" style="--c: var(--k5)">${ic('cup', 'way-icon')}</span>
      <h2>${esc(c.supH)}</h2>
      <p>${esc(c.supP)}</p>
      <div class="way-links"><a href="${pre(L)}/donate/">${esc(c.supLink)} ${ic('arrow')}</a></div>
    </div>
  </div>
</section>`,
  });
};

const donate = (L) => {
  const d = L.donate;
  const goIcons = [['apple', 'blue'], ['logo', 'violet'], ['spark', 'yellow']];
  return page(L, {
    path: '/donate/', key: 'donate', title: d.title, desc: d.desc,
    body: `
<section class="dhero wrap">
  <span class="heart-badge in-0">${ic('heart')}</span>
  <h1 class="h1" data-words>${esc(d.h1)}</h1>
  <p class="phero-sub in-1">${esc(d.sub)}</p>
</section>

<section class="wrap donate">
  <div class="kofi-card in-2">
    <div class="kofi-copy">
      <span class="kofi-icon">${ic('cup')}</span>
      <h2>${esc(d.coffee)}</h2>
      <p>${esc(d.coffeeP)}</p>
    </div>
    <div class="kofi-amounts">${['$3', '$5', '$10', d.any].map((a) => `<a href="https://ko-fi.com/hollowbit">${esc(a)}</a>`).join('')}</div>
    <a class="btn btn-primary btn-lg" href="https://ko-fi.com/hollowbit">${ic('heart')}${esc(d.kofi)}</a>
    <small class="kofi-note">${esc(d.nothing)}</small>
  </div>

  <div class="sec-head donate-head">
    <h2 class="h2" data-words="scroll">${esc(d.whereH)}</h2>
    <p class="reveal">${esc(d.whereP)}</p>
  </div>
  <div class="goes">
    ${d.goes.map(([h, p], i) => `<div class="go-card reveal" style="--d:${i * 90}ms; --c: var(--${goIcons[i][1]})"><span class="go-tile">${ic(goIcons[i][0])}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('\n    ')}
  </div>

  <div class="sec-head donate-head">
    <h2 class="h2" data-words="scroll">${esc(d.freeH)}</h2>
    <p class="reveal">${esc(d.freeP)}</p>
  </div>
  <div class="free-help">
    <a class="link-card reveal" href="https://github.com/hollowbit-dev">${ic('star', 'lc-icon')}<span><b>${esc(d.star)}</b><small>${esc(d.starP)}</small></span>${ic('out', 'go')}</a>
    <a class="link-card reveal" style="--d:70ms" href="${pre(L)}/contact/">${ic('bug', 'lc-icon')}<span><b>${esc(d.report)}</b><small>${esc(d.reportP)}</small></span>${ic('arrow', 'go')}</a>
    <a class="link-card reveal" style="--d:140ms" href="${pre(L)}/">${ic('share', 'lc-icon')}<span><b>${esc(d.tell)}</b><small>${esc(d.tellP)}</small></span>${ic('arrow', 'go')}</a>
  </div>
</section>`,
  });
};

const privacy = (L) => {
  const p = L.privacy;
  return page(L, {
    path: '/privacy/', key: '', title: p.title, desc: p.desc,
    body: `
<section class="wrap-narrow doc">
  <h1 class="h1" data-words>${esc(p.h1)}</h1>
  <p class="lead in-1">${esc(p.lead)}</p>
  <div class="in-2">
    <h2>${esc(p.siteH)}</h2>
    <p>${esc(p.siteP).replace('{link}', `<a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">${esc(p.siteLink)}</a>`)}</p>
    <h2>${esc(p.appsH)}</h2>
    <p>${esc(p.appsP)}</p>
    <p>${esc(p.appsP2)}</p>
    <h2>${esc(p.dlH)}</h2>
    <p>${esc(p.dlP)}</p>
    <h2>${esc(p.mailH)}</h2>
    <p>${esc(p.mailP)}</p>
    <h2>${esc(p.qH)}</h2>
    <p>${esc(p.qP).replace('{link}', `<a href="${pre(L)}/contact/">${esc(p.qLink)}</a>`)}</p>
    <p class="muted">${esc(p.updated)}</p>
  </div>
</section>`,
  });
};

const notFound = (L) => page(L, {
  path: null, title: L.nf.title, desc: L.nf.desc,
  body: `
<section class="dhero wrap nf">
  <p class="nf-code in-0">404</p>
  <h1 class="h1" data-words>${esc(L.nf.h1)}</h1>
  <div class="hero-cta in-2"><a class="btn btn-primary btn-lg" href="/">${esc(L.nf.home)} ${ic('arrow')}</a><a class="btn btn-ghost btn-lg" href="/download/">${esc(L.nf.downloads)}</a></div>
</section>`,
});

/* ---------- write ---------- */
const out = {};
for (const L of LANGS) {
  const d = L.lang === 'en' ? '' : `${L.lang}/`;
  Object.assign(out, {
    [`${d}index.html`]: home(L),
    [`${d}fileshaper/index.html`]: productPage(L, FS, CS),
    [`${d}captionshaper/index.html`]: productPage(L, CS, DS),
    [`${d}download/index.html`]: download(L),
    [`${d}about/index.html`]: about(L),
    [`${d}contact/index.html`]: contact(L),
    [`${d}donate/index.html`]: donate(L),
    [`${d}privacy/index.html`]: privacy(L),
  });
}
out['404.html'] = notFound(LANGS[0]);
// Root-relative links become relative, so pages also work opened straight from the folder.
// 404.html keeps absolute paths: GitHub Pages serves it at any depth.
const relink = (html, f) => {
  if (f === '404.html') return html;
  const up = '../'.repeat(f.split('/').length - 1);
  return html.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_, a, p) => `${a}="${up}${p === '' ? (up ? '' : './') : p}"`);
};
for (const [f, raw] of Object.entries(out)) {
  const p = resolve(root, f);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, relink(raw, f));
}
writeFileSync(resolve(root, 'assets/style.css'), readFileSync(resolve(root, 'site/main.css'), 'utf8') + '\n' + readFileSync(resolve(root, 'site/demo.css'), 'utf8'));
const paths = ['/', '/fileshaper/', '/captionshaper/', '/download/', '/about/', '/contact/', '/donate/', '/privacy/'];
const u = (code, p) => `${ORIGIN}${code === 'en' ? '' : `/${code}`}${p}`;
writeFileSync(resolve(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths.flatMap((p) => LANGS.map((L) => `  <url><loc>${u(L.lang, p)}</loc><lastmod>2026-11-11</lastmod>${LANGS.map((a) => `<xhtml:link rel="alternate" hreflang="${a.html}" href="${u(a.lang, p)}"/>`).join('')}</url>`)).join('\n')}
</urlset>
`);
console.log('built', Object.keys(out).length, 'pages in', LANGS.length, 'languages | fileshaper', FS.version, '| captionshaper', CS.version, '| diskshaper', DS.version);
