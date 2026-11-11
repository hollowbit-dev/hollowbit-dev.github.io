// Builds the static pages: node site/build.mjs
// Reads the latest release of each app from GitHub so download buttons always point at real files.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://hollowbit.dev';

/* ---------- products ---------- */
const P = {
  fileshaper: {
    slug: 'fileshaper', name: 'Fileshaper', v: 'fs', domain: 'fileshaper.app',
    site: 'https://fileshaper.app/', repo: 'hollowbit-dev/fileshaper', kind: 'free offline file toolbox',
    blurb: 'Compress videos for Discord, convert iPhone photos, merge and sign PDFs. One toolbox, fully offline.',
    line: 'Fix any file. Nothing leaves your computer.',
    lede: 'Type what you want to do. Fileshaper compresses, converts, trims, merges and signs your files right on your machine. No upload sites, no queues, no watermarks.',
    tasks: ['Compress video for Discord', 'HEIC to JPG', 'Sign a PDF', 'Merge PDFs', 'Make a GIF', 'Extract audio', 'Resize images', 'Normalize audio', 'Split a PDF', 'Trim a video'],
    req: { mac: 'macOS 12 Monterey or newer', win: 'Windows 10 or 11, 64-bit', extra: ['About 350 MB once installed', '4 GB of memory or more', 'Internet only for the optional update check'] },
    rows: [
      ['Video, sized to fit.', 'Pick 8, 10, 25 MB or your own limit and Fileshaper lands just under it with two-pass encoding. Trim, mute, convert, make GIFs, pull out the audio.', 'fileshaper-video.webp', 1200, 760, 'Fileshaper’s video screen compressing two clips to under 10 MB.'],
      ['iPhone photos that open everywhere.', 'Turn HEIC into JPG or PNG, resize and compress whole folders, or combine images into one PDF.', 'fileshaper-images.webp', 1200, 760, 'Fileshaper’s images screen converting HEIC photos.'],
      ['PDFs without the paywall.', 'Merge, split, reorder and compress. Draw or type a signature, place it, done.', 'fileshaper-pdf-sign.webp', 1200, 760, 'Fileshaper placing a signature on a PDF page.'],
    ],
    close: 'Stop uploading your files to sketchy websites.',
    fallback: { tag: 'v1.2.0', assets: ['Fileshaper-1.2.0-mac-arm64.dmg', 'Fileshaper-1.2.0-mac-x64.dmg', 'Fileshaper-Setup-1.2.0-win-x64.exe'] },
    firstMac: ['Open the .dmg and drag Fileshaper into Applications.', 'Right-click Fileshaper in Applications and choose Open.', 'Click Open. If macOS still blocks it, go to System Settings, Privacy & Security, and click Open Anyway.'],
    firstWin: ['Run the installer you downloaded.', 'If you see “Windows protected your PC”, click More info.', 'Click Run anyway. You only do this once.'],
  },
  captionshaper: {
    slug: 'captionshaper', name: 'Captionshaper', v: 'cs', domain: 'captionshaper.app',
    site: 'https://captionshaper.app/', repo: 'hollowbit-dev/captionshaper', kind: 'free offline auto subtitles',
    blurb: 'Word-timed subtitles for any video, written by a speech model on your own computer. SRT, VTT or burned in.',
    line: 'Captions that keep up with you.',
    lede: 'Drop in a video and get every word with its timing, transcribed by a speech model running on your own computer. Fix anything, pick a style, export.',
    tasks: ['Auto subtitles', 'Word-timed captions', 'TikTok word pop', 'Export SRT', 'Export VTT', 'Burn in captions', 'Fix any word', 'Vertical video safe zone', 'Works offline', 'Waveform timeline'],
    req: { mac: 'Apple Silicon (M1 or newer), macOS 12 or later', win: 'Windows 10 or 11, 64-bit', extra: ['Speech models download once, then everything runs offline', 'Windows may ask to install the Microsoft Visual C++ runtime'] },
    rows: [
      ['Every word, on time.', 'Whisper runs on your computer and times each word to the voice. Music and silence are skipped, and a one-minute clip takes about ten seconds on an M-series Mac.', 'captionshaper-app-working.webp', 1440, 792, 'Captionshaper transcribing a video, with words appearing live.'],
      ['Styles people actually use.', 'Nine looks, from clean subtitles to TikTok-style word pop. What you see in the preview is exactly what gets burned in.', 'captionshaper-app-style.webp', 1600, 1018, 'Captionshaper’s style panel with nine caption presets.'],
      ['Fix it, then ship it.', 'Edit any word on the timeline, then export SRT or VTT for YouTube and editors, or a finished video with captions burned in. No watermark.', 'captionshaper-app.webp', 1600, 1018, 'Captionshaper’s editor with a caption list and waveform timeline.'],
    ],
    close: 'Captions without the subscription.',
    fallback: { tag: 'v1.0.1', assets: ['Captionshaper-1.0.1-mac-arm64.dmg', 'Captionshaper-Setup-1.0.1-win-x64.exe'] },
    firstMac: ['Open the .dmg and drag Captionshaper to Applications.', 'Right-click Captionshaper and choose Open, then click Open.', 'If macOS still blocks it, go to System Settings, Privacy & Security, and click Open Anyway.'],
    firstWin: ['Run the installer. If SmartScreen appears, click More info, then Run anyway.', 'If Windows asks to install the Microsoft Visual C++ runtime, say yes. The speech engine needs it.'],
  },
};

for (const p of Object.values(P)) {
  let rel = p.fallback;
  try {
    const r = await fetch(`https://api.github.com/repos/${p.repo}/releases/latest`, { headers: { 'User-Agent': 'hollowbit-site-build' } });
    if (r.ok) { const j = await r.json(); rel = { tag: j.tag_name, assets: j.assets.map((a) => a.name), date: j.published_at }; }
  } catch { /* offline: use fallback */ }
  const dl = (name) => `https://github.com/${p.repo}/releases/latest/download/${name}`;
  const find = (re) => rel.assets.find((a) => re.test(a));
  p.version = rel.tag.replace(/^v/, '');
  p.date = rel.date ? new Date(rel.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  p.mac = find(/mac-arm64\.dmg$/) && dl(find(/mac-arm64\.dmg$/));
  p.macIntel = find(/mac-x64\.dmg$/) && dl(find(/mac-x64\.dmg$/));
  p.win = find(/win-x64\.exe$/) && dl(find(/win-x64\.exe$/));
  p.releases = `https://github.com/${p.repo}/releases`;
  p.changelog = `${p.site}changelog.html`;
  p.faq = `${p.site}faq.html`;
  p.issues = `https://github.com/${p.repo}/issues/new`;
  p.source = `https://github.com/${p.repo}`;
  p.plats = p.mac && p.win ? 'Mac and Windows' : p.mac ? 'Mac' : 'Windows';
}
const FS = P.fileshaper, CS = P.captionshaper;

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

/* ---------- shell ---------- */
const NAV = [['/fileshaper/', 'Fileshaper', 'fileshaper'], ['/captionshaper/', 'Captionshaper', 'captionshaper'], ['/download/', 'Download', 'download'], ['/about/', 'About', 'about'], ['/contact/', 'Contact', 'contact'], ['/donate/', 'Donate', 'donate']];

function page({ path, key = '', title, desc, body, cls = '' }) {
  const nav = NAV.map(([h, l, k]) => `<a href="${h}"${k === key ? ' aria-current="page"' : ''}>${k === key ? '<span class="nav-pill"></span>' : ''}<span class="nav-label">${l}</span></a>`).join('');
  const sheet = [['/', 'Home', 'home'], ...NAV].map(([h, l, k], i) => `<a href="${h}" style="--i:${i}"${k === key ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
${path ? `<link rel="canonical" href="${ORIGIN}${path}">` : '<meta name="robots" content="noindex">'}
<meta name="theme-color" content="#08080a">
<meta property="og:type" content="website">
${path ? `<meta property="og:url" content="${ORIGIN}${path}">` : ''}
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${ORIGIN}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/style.css">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Hollowbit Studio","alternateName":"Hollowbit","url":"https://hollowbit.dev/","logo":"https://hollowbit.dev/favicon.png","founder":{"@type":"Person","name":"Elvis Zygmanta"},"email":"ezygmanta@gmail.com","sameAs":["https://github.com/hollowbit-dev","https://ko-fi.com/hollowbit","https://fileshaper.app","https://captionshaper.app"]}</script>
<script>(function(d,u){d.classList.add('js');d.dataset.os=/Windows/.test(u)?'win':/Macintosh/.test(u)?'mac':'other'})(document.documentElement,navigator.userAgent)</script>
</head>
<body class="${cls}">
<a class="skip" href="#main">Skip to content</a>
${sprite}
<header class="nav" data-nav>
  <div class="nav-in">
    <a class="brand" href="/" aria-label="Hollowbit home">${ic('logo', 'logo')}<span>Hollowbit</span></a>
    <nav class="nav-links" aria-label="Main">${nav}</nav>
    <div class="nav-end">
      <a class="btn btn-primary btn-sm nav-dl" href="/download/">${ic('down')}Download</a>
      <button class="nav-menu" type="button" aria-expanded="false" aria-controls="sheet" aria-label="Open menu"><span></span><span></span></button>
    </div>
  </div>
  <div class="sheet" id="sheet"><nav aria-label="Mobile">${sheet}</nav></div>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="brand" href="/" aria-label="Hollowbit home">${ic('logo', 'logo')}<span>Hollowbit</span></a>
        <p>Hollowbit Studio makes free tools that never upload your files. Made by Elvis Zygmanta in Thailand.</p>
        <a class="foot-mail" data-email-link href="/contact/">${ic('mail')}<span data-email>Contact</span></a>
      </div>
      <nav aria-label="Products"><h2>Products</h2><a href="/fileshaper/">Fileshaper</a><a href="/captionshaper/">Captionshaper</a><a href="/download/">Download</a></nav>
      <nav aria-label="Studio"><h2>Studio</h2><a href="/about/">About</a><a href="/contact/">Contact</a><a href="/donate/">Donate</a><a href="/privacy/">Privacy</a></nav>
      <nav aria-label="Elsewhere"><h2>Elsewhere</h2><a href="https://github.com/hollowbit-dev">GitHub</a><a href="https://ko-fi.com/hollowbit">Ko-fi</a><a href="${FS.site}">fileshaper.app</a><a href="${CS.site}">captionshaper.app</a></nav>
    </div>
    <div class="foot-bottom"><span>© 2026 Hollowbit Studio · Elvis Zygmanta</span><span>No cookies, no analytics, nothing loaded from anyone else.</span></div>
  </div>
  <div class="foot-word" aria-hidden="true"><span>Hollowbit</span></div>
</footer>
<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

/* ---------- pieces ---------- */
const dlButtons = (p, { dark = false, site = false } = {}) => {
  const cls = dark ? 'btn-dark' : 'btn-primary';
  const b = [];
  if (p.mac) b.push(`<a class="btn ${cls} btn-lg dl-btn" data-os-btn="mac" href="${p.mac}">${ic('apple')}<span>Download for Mac</span></a>`);
  if (p.win) b.push(`<a class="btn ${cls} btn-lg dl-btn" data-os-btn="win" href="${p.win}">${ic('windows')}<span>Download for Windows</span></a>`);
  if (site) b.push(`<a class="btn btn-ghost btn-lg site-btn" href="${p.site}">Visit ${p.domain} ${ic('out')}</a>`);
  return `<div class="dl-row">${b.join('')}</div>`;
};

const fsDemo = `<div class="demo demo-fs" id="demo-fs" role="tabpanel" aria-labelledby="tab-fs">
  <p class="sr-only">Animated demo: Fileshaper compresses a 214 MB video to 9.6 MB, on the computer.</p>
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

const csDemo = `<div class="demo demo-cs" id="demo-cs" role="tabpanel" aria-labelledby="tab-cs">
  <p class="sr-only">Animated demo: Captionshaper writes word-timed captions onto a video, offline.</p>
  <div class="win" aria-hidden="true">
    <div class="cs-top"><div class="tl"><i></i><i></i><i></i></div><b>beach-day.mp4</b><span>0:38 · English</span><span class="cs-grow"></span><span class="cs-saved">Saved</span><span class="cs-export">Export</span></div>
    <div class="cs-body">
      <div class="cs-player"><div class="cs-phone"><div class="cs-video"></div><div class="cs-cap"></div><div class="cs-ui"><i></i><i></i><i></i></div></div></div>
      <div class="cs-side"><div class="cs-tabs"><span class="on">Captions</span><span>Style</span></div><div class="cs-list"></div></div>
    </div>
    <div class="cs-timeline"><span class="cs-play"></span><span class="cs-time">0:12 / 0:38</span><div class="cs-wave"><i class="cs-head"></i></div></div>
  </div>
</div>`;

function stage(only) {
  const tabs = only ? '' : `<div class="stage-tabs" role="tablist" aria-label="Product demos">
      <button class="tab" role="tab" aria-selected="true" aria-controls="demo-fs" id="tab-fs" style="--c: var(--fs)"><img src="/assets/img/fileshaper-icon.png" alt="" width="20" height="20">Fileshaper<span class="tab-bar"><i></i></span></button>
      <button class="tab" role="tab" aria-selected="false" aria-controls="demo-cs" id="tab-cs" style="--c: var(--cs)"><img src="/assets/img/captionshaper-icon.png" alt="" width="20" height="20">Captionshaper<span class="tab-bar"><i></i></span></button>
    </div>`;
  const demos = only === 'fs' ? fsDemo : only === 'cs' ? csDemo : fsDemo + csDemo;
  return `<div class="stage${only ? ' stage-single' : ''}" data-stage>${tabs}<div class="stage-frame"><div class="stage-scale">${demos}</div></div></div>`;
}

const ticker = () => {
  const items = (p) => p.tasks.map((t) => `<span style="--c: var(--${p.v})"><i></i>${t}</span>`).join('');
  const a = items(FS) + items(CS);
  const b = items(CS) + items(FS);
  return `<div class="ticker" aria-hidden="true"><div class="ticker-track">${a}${a}</div><div class="ticker-track rev">${b}${b}</div></div>`;
};

const PRINCIPLES = [
  ['i-upload', 'No uploads', 'Files are opened, changed and saved on your own computer.'],
  ['i-wifi', 'Works offline', 'Turn the Wi-Fi off. Everything still works.'],
  ['i-ads', 'No ads', 'Not in the apps, not on the websites.'],
  ['i-account', 'No accounts', 'You shouldn’t have to sign up to convert a file.'],
  ['i-track', 'No tracking', 'No analytics and no cookies, including on this site.'],
  ['i-code', 'Open source', 'Every line is on GitHub under the GPL.'],
];

/* ---------- pages ---------- */
const home = page({
  path: '/', key: 'home',
  title: 'Hollowbit Studio: free tools that never upload your files',
  desc: 'Hollowbit Studio is a small software studio by Elvis Zygmanta. Free, open-source apps for Windows and Mac that run entirely on your own computer.',
  body: `
<section class="hero wrap">
  <a class="hero-badge in-0" href="/download/"><span class="dot"></span>Fileshaper ${FS.version} and Captionshaper ${CS.version} are out<svg aria-hidden="true"><use href="#arrow"/></svg></a>
  <h1 class="hero-title" data-words data-hl="never upload">Free tools that never upload your files.</h1>
  <p class="hero-sub in-1">Small, polished apps for Windows and Mac that do one job well, entirely on your own computer. No ads, no accounts, no watermarks.</p>
  <div class="hero-cta in-2">
    <a class="btn btn-primary btn-lg" href="/download/">${ic('down')}Download the apps</a>
    <a class="btn btn-ghost btn-lg" href="#tools">See what they do</a>
  </div>
  <div class="in-3">${stage()}</div>
</section>

${ticker()}

<section class="wrap sec" id="tools">
  <div class="sec-head">
    <h2 class="h2" data-words="scroll">Two apps. Both free, for good.</h2>
    <p class="reveal">Each one replaces a website that wants you to upload your files, wait in a queue and pay to remove a watermark.</p>
  </div>
  <div class="cards">
    ${[FS, CS].map((p, i) => `<article class="pcard pcard-${p.v} reveal" style="--d:${i * 90}ms" data-tilt-card>
      <div class="pcard-in">
        <img class="pcard-icon vt-icon-${p.v}" src="/assets/img/${p.slug}-icon.png" width="56" height="56" alt="">
        <h3>${p.name}</h3>
        <p>${p.blurb}</p>
        <div class="pcard-cta">
          <a class="btn btn-dark" href="/${p.slug}/">Learn more ${ic('arrow')}</a>
          <a class="btn btn-line" href="/download/#${p.slug}">${ic('down')}Download</a>
          <a class="btn btn-line" href="${p.site}">Website ${ic('out')}</a>
        </div>
        <small class="pcard-meta">v${p.version} · ${p.plats} · Official site: ${p.domain}</small>
      </div>
      <div class="pcard-shot"><img src="/assets/img/${p.slug}-app.webp" width="1600" height="1018" alt="" loading="lazy"></div>
    </article>`).join('\n    ')}
  </div>
</section>

<section class="wrap sec">
  <div>
    <div class="sec-head">
      <h2 class="h2" data-words="scroll">Free means free.</h2>
      <p class="reveal">No trial, no “pro” tier, no data harvested on the side. These rules apply to every Hollowbit app and this website.</p>
    </div>
    <div class="princ">
      ${PRINCIPLES.map(([i, h, t], n) => `<div class="pr reveal" style="--d:${n * 70}ms; --c: var(--k${n})"><span class="pr-tile">${ic(i, 'pr-icon')}</span><h3>${h}</h3><p>${t}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="wrap sec">
  <div class="cta-box reveal">
    <div class="cta-icons"><img src="/assets/img/fileshaper-icon.png" alt="" width="72" height="72"><img src="/assets/img/captionshaper-icon.png" alt="" width="72" height="72"></div>
    <h2 class="h2" data-words="scroll">Get both apps. Pay nothing.</h2>
    <p>Installers for Mac and Windows, straight from GitHub.</p>
    <div class="hero-cta"><a class="btn btn-primary btn-lg" href="/download/">${ic('down')}Go to downloads</a><a class="btn btn-ghost btn-lg" href="/about/">Who makes these?</a></div>
  </div>
</section>`,
});

function productPage(p, next) {
  return page({
    path: `/${p.slug}/`, key: p.slug, cls: `p-${p.v}`,
    title: `${p.name}: ${p.kind} · Hollowbit Studio`,
    desc: `${p.blurb} Free for ${p.plats}, nothing uploaded.`,
    body: `
<section class="phero wrap" style="--c: var(--${p.v})">
  <img class="phero-icon vt-icon-${p.v}" src="/assets/img/${p.slug}-icon.png" width="96" height="96" alt="">
  <p class="phero-name in-0">${p.name}</p>
  <h1 class="phero-title" data-words>${p.line}</h1>
  <p class="phero-sub in-1">${p.lede}</p>
  <div class="in-2">${dlButtons(p, { site: true })}</div>
  <p class="phero-meta in-2">Version ${p.version} · Free · <a href="${p.source}">Source code</a> · <a href="${p.changelog}">What's new</a></p>
  <div class="in-3 phero-stage">${stage(p.v)}</div>
</section>

<section class="wrap sec rows" style="--c: var(--${p.v})">
  ${p.rows.map(([h, t, img, w, ht, alt], i) => `<div class="row${i % 2 ? ' row-flip' : ''}">
    <div class="row-copy"><h2 class="h3" data-words="scroll">${h}</h2><p class="reveal">${t}</p></div>
    <figure class="row-shot" data-wipe><img src="/assets/img/${img}" width="${w}" height="${ht}" loading="lazy" alt="${alt}"></figure>
  </div>`).join('\n  ')}
</section>

<section class="band-color" style="--c: var(--${p.v})">
  <div class="wrap band-in">
    <div class="band-copy">
      <img src="/assets/img/${p.slug}-icon.png" width="64" height="64" alt="">
      <h2 class="h2" data-words="scroll">${p.close}</h2>
      <p class="reveal">Free for ${p.plats}. No account, no watermark, nothing uploaded.</p>
    </div>
    <div class="band-dl reveal">
      ${dlButtons(p, { dark: true })}
      <div class="band-links"><a href="/download/#${p.slug}">All downloads and setup help</a><a href="${p.changelog}">What's new</a><a href="${p.site}">${p.domain}</a></div>
    </div>
  </div>
</section>

<section class="wrap next-sec">
  <a class="next reveal" href="/${next.slug}/" style="--c: var(--${next.v})">
    <img src="/assets/img/${next.slug}-icon.png" alt="" width="56" height="56">
    <span><small>Also from Hollowbit Studio</small><b>${next.name}</b><em>${next.blurb}</em></span>
    <span class="next-go">${ic('arrow')}</span>
  </a>
</section>`,
  });
}

const steps = (arr) => `<ol>${arr.map((s) => `<li>${s}</li>`).join('')}</ol>`;
const download = page({
  path: '/download/', key: 'download',
  title: 'Download · Hollowbit Studio',
  desc: 'Download Fileshaper and Captionshaper for Mac and Windows. Free, no account, nothing uploaded.',
  body: `
<section class="dhero wrap">
  <h1 class="h1" data-words>Download.</h1>
  <p class="phero-sub in-1">Free, with no account. Pick an app and your computer.<span class="os-note" data-os-note></span></p>
</section>
<section class="wrap dl-list">
  ${[FS, CS].map((p, i) => `<article class="dl-card in-${i + 2}" id="${p.slug}" style="--c: var(--${p.v})">
    <header class="dl-head">
      <img src="/assets/img/${p.slug}-icon.png" width="64" height="64" alt="">
      <div><h2>${p.name}</h2><p>${p.blurb}</p></div>
      <span class="dl-ver">v${p.version}${p.date ? `<small>${p.date}</small>` : ''}</span>
    </header>
    <div class="dl-plats">
      ${p.mac ? `<div class="plat" data-plat="mac">
        <div class="plat-h">${ic('apple')}<b>Mac</b><span class="rec">Your computer</span></div>
        <p>${p.req.mac}</p>
        <a class="btn btn-primary dl-btn" href="${p.mac}">${ic('down')}Download for Apple Silicon</a>
        ${p.macIntel ? `<a class="plat-alt" href="${p.macIntel}">Intel Mac? Get this one instead</a>` : '<span class="plat-alt muted">Apple Silicon only for now</span>'}
      </div>` : ''}
      ${p.win ? `<div class="plat" data-plat="win">
        <div class="plat-h">${ic('windows')}<b>Windows</b><span class="rec">Your computer</span></div>
        <p>${p.req.win}</p>
        <a class="btn btn-primary dl-btn" href="${p.win}">${ic('down')}Download for Windows</a>
        <span class="plat-alt muted">64-bit installer (.exe)</span>
      </div>` : ''}
    </div>
    <details class="help">
      <summary>Opening it for the first time<span class="chev" aria-hidden="true"></span></summary>
      <div class="help-in">
        <p>${p.name} isn’t signed with a paid Apple or Microsoft certificate yet, so your computer asks once. It’s safe, and every line of code is public.</p>
        <div class="help-cols"><div><h3>${ic('apple')}Mac</h3>${steps(p.firstMac)}</div><div><h3>${ic('windows')}Windows</h3>${steps(p.firstWin)}</div></div>
        <ul class="help-req">${p.req.extra.map((r) => `<li>${ic('check')}${r}</li>`).join('')}</ul>
      </div>
    </details>
    <footer class="dl-foot"><a href="${p.changelog}">Release notes ${ic('out')}</a><a href="${p.releases}">Older versions ${ic('out')}</a><a href="${p.source}">Source code ${ic('out')}</a><a href="${p.site}">${p.domain} ${ic('out')}</a></footer>
  </article>`).join('\n  ')}
</section>`,
});

const about = page({
  path: '/about/', key: 'about',
  title: 'About · Hollowbit Studio',
  desc: 'Hollowbit Studio is Elvis Zygmanta’s studio for small, free tools that run on your own computer. No ads, no accounts, no tracking, open source.',
  body: `
<section class="ahero wrap-narrow">
  <span class="ahero-logo">${ic('logo')}</span>
  <h1 class="h1" data-words>Hi, I’m Elvis.</h1>
  <div class="ahero-body in-1">
    <p class="lead">I’m Elvis Zygmanta, based in Thailand. Hollowbit is my studio for small, free tools that treat the people using them with respect.</p>
    <p>It started with an annoyance. Shrinking a video for Discord or opening an iPhone photo on Windows meant uploading it somewhere, waiting in a queue and paying to remove a watermark, for jobs a normal computer can do in seconds.</p>
    <p>So each Hollowbit app takes one of those websites and does the job offline, for free, and tries to be as polished as anything you’d pay for. Every app ships with installers for Windows and Mac, its own website, and automated tests that drive the real app before each release.</p>
  </div>
</section>

<section class="wrap-narrow sec">
  <h2 class="h2" data-words="scroll">What Hollowbit sticks to</h2>
  <ol class="rules">
    <li><span class="rule-big">No uploads.</span><span class="rule-note">Files are opened, changed and saved on your computer. Everything works with the Wi-Fi off.</span></li>
    <li><span class="rule-big">No ads.</span><span class="rule-note">Not in the apps, not on the websites.</span></li>
    <li><span class="rule-big">No accounts.</span><span class="rule-note">You shouldn’t have to sign up to convert a file.</span></li>
    <li><span class="rule-big">No tracking.</span><span class="rule-note">No analytics and no cookies, including on this site.</span></li>
    <li><span class="rule-big">No watermarks.</span><span class="rule-note">No trial and no “pro” tier. The free version is the whole thing.</span></li>
    <li><span class="rule-big">Open source.</span><span class="rule-note">Every line is on GitHub under the GPL.</span></li>
  </ol>
</section>

<section class="wrap sec">
  <div>
    <div class="sec-head"><h2 class="h2" data-words="scroll">The apps so far</h2><p class="reveal">Two released, both free, both open source.</p></div>
    <div class="mini-list">
      ${[FS, CS].map((p, i) => `<a class="mini reveal" style="--d:${i * 90}ms" href="/${p.slug}/"><img src="/assets/img/${p.slug}-icon.png" width="52" height="52" alt=""><span><b>${p.name}</b><small>${p.blurb}</small></span><em>v${p.version}</em>${ic('arrow', 'go')}</a>`).join('')}
    </div>
  </div>
</section>

<section class="wrap-narrow sec links-sec">
  <a class="link-card reveal" href="/contact/">${ic('mail', 'lc-icon')}<span><b>Get in touch</b><small>Email, bug reports and ideas</small></span>${ic('arrow', 'go')}</a>
  <a class="link-card reveal" style="--d:90ms" href="/donate/">${ic('heart', 'lc-icon')}<span><b>Donate</b><small>Help keep the apps free</small></span>${ic('arrow', 'go')}</a>
</section>`,
});

const contact = page({
  path: '/contact/', key: 'contact',
  title: 'Contact · Hollowbit Studio',
  desc: 'Get in touch with Hollowbit Studio: email, bug reports and feature ideas for Fileshaper and Captionshaper.',
  body: `
<section class="dhero wrap">
  <h1 class="h1" data-words>Get in touch.</h1>
  <p class="phero-sub in-1">Questions, bugs, ideas or just a hello. I read every message.</p>
</section>
<section class="wrap contact">
  <div class="mail-card in-2">
    <span class="mc-icon">${ic('mail')}</span>
    <div class="mc-text"><small>Email</small><a class="mc-addr" data-email-link href="/contact/"><span data-email>ezygmanta [at] gmail.com</span></a></div>
    <div class="mc-actions">
      <button class="btn btn-ghost" type="button" data-copy-email>${ic('copy')}<span>Copy address</span></button>
      <a class="btn btn-primary" data-email-link href="/contact/">Write an email ${ic('arrow')}</a>
    </div>
  </div>
  <div class="ways">
    <div class="way reveal">
      <span class="way-tile" style="--c: var(--k3)">${ic('bug', 'way-icon')}</span>
      <h2>Found a bug?</h2>
      <p>Open an issue on GitHub so it can be tracked and fixed. Mention your system and what you clicked.</p>
      <div class="way-links"><a href="${FS.issues}">Report a Fileshaper bug ${ic('out')}</a><a href="${CS.issues}">Report a Captionshaper bug ${ic('out')}</a></div>
    </div>
    <div class="way reveal" style="--d:90ms">
      <span class="way-tile" style="--c: var(--k4)">${ic('spark', 'way-icon')}</span>
      <h2>Have an idea?</h2>
      <p>Feature requests are welcome on GitHub, or by email if you’d rather not make an account.</p>
      <div class="way-links"><a href="https://github.com/hollowbit-dev">github.com/hollowbit-dev ${ic('out')}</a></div>
    </div>
    <div class="way reveal" style="--d:180ms">
      <span class="way-tile" style="--c: var(--k5)">${ic('cup', 'way-icon')}</span>
      <h2>Want to support it?</h2>
      <p>The apps stay free either way. If one saved you time, a coffee helps keep them going.</p>
      <div class="way-links"><a href="/donate/">Ways to support ${ic('arrow')}</a></div>
    </div>
  </div>
</section>`,
});

const donate = page({
  path: '/donate/', key: 'donate',
  title: 'Donate · Hollowbit Studio',
  desc: 'Support Hollowbit Studio. Donations keep Fileshaper and Captionshaper free, with no ads, no accounts and no paid tier.',
  body: `
<section class="dhero wrap">
  <span class="heart-badge in-0">${ic('heart')}</span>
  <h1 class="h1" data-words>Keep the tools free.</h1>
  <p class="phero-sub in-1">Hollowbit apps have no ads, no subscriptions and no paid tier, and they never will. If one saved you time or money, a donation helps keep it that way.</p>
</section>

<section class="wrap donate">
  <div class="kofi-card in-2">
    <div class="kofi-copy">
      <span class="kofi-icon">${ic('cup')}</span>
      <h2>Buy me a coffee</h2>
      <p>Donate any amount on Ko-fi, once or monthly. No account needed.</p>
    </div>
    <div class="kofi-amounts">${['$3', '$5', '$10', 'Any amount'].map((a) => `<a href="https://ko-fi.com/hollowbit">${a}</a>`).join('')}</div>
    <a class="btn btn-primary btn-lg" href="https://ko-fi.com/hollowbit">${ic('heart')}Donate on Ko-fi</a>
    <small class="kofi-note">Nothing unlocks. You get the same apps either way, and a thank-you.</small>
  </div>

  <div class="sec-head donate-head">
    <h2 class="h2" data-words="scroll">Where donations go</h2>
    <p class="reveal">Hollowbit is one person. The apps cost real money to ship properly.</p>
  </div>
  <div class="goes">
    <div class="go-card reveal" style="--c: var(--blue)"><span class="go-tile">${ic('apple')}</span><h3>Signing the apps</h3><p>An Apple developer account and a Windows code-signing certificate, so the “unidentified developer” warnings go away.</p></div>
    <div class="go-card reveal" style="--d:90ms; --c: var(--violet)"><span class="go-tile">${ic('logo')}</span><h3>Domains and hosting</h3><p>hollowbit.dev, fileshaper.app and captionshaper.app renew every year.</p></div>
    <div class="go-card reveal" style="--d:180ms; --c: var(--yellow)"><span class="go-tile">${ic('spark')}</span><h3>New tools</h3><p>Time to build the next free app and keep the current ones up to date.</p></div>
  </div>

  <div class="sec-head donate-head">
    <h2 class="h2" data-words="scroll">Free ways to help</h2>
    <p class="reveal">Money isn’t the only thing that helps.</p>
  </div>
  <div class="free-help">
    <a class="link-card reveal" href="https://github.com/hollowbit-dev">${ic('star', 'lc-icon')}<span><b>Star the repos on GitHub</b><small>It helps other people find the apps</small></span>${ic('out', 'go')}</a>
    <a class="link-card reveal" style="--d:70ms" href="/contact/">${ic('bug', 'lc-icon')}<span><b>Report a bug or idea</b><small>Every report makes the apps better</small></span>${ic('arrow', 'go')}</a>
    <a class="link-card reveal" style="--d:140ms" href="/">${ic('share', 'lc-icon')}<span><b>Tell a friend</b><small>Share hollowbit.dev with someone who uploads files to sketchy sites</small></span>${ic('arrow', 'go')}</a>
  </div>
</section>`,
});

const privacy = page({
  path: '/privacy/', key: '',
  title: 'Privacy · Hollowbit Studio',
  desc: 'Hollowbit Studio’s privacy policy: no cookies, no analytics, and apps that never upload your files.',
  body: `
<section class="wrap-narrow doc">
  <h1 class="h1" data-words>Privacy.</h1>
  <p class="lead in-1">Short version: Hollowbit doesn’t collect anything about you.</p>
  <div class="in-2">
    <h2>This website</h2>
    <p>hollowbit.dev sets no cookies, runs no analytics and loads nothing from other companies. Fonts and images are served from this site. It’s hosted on GitHub Pages, and GitHub may keep standard server logs (such as IP addresses) for security, as described in <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub’s privacy statement</a>.</p>
    <h2>The apps</h2>
    <p>Fileshaper and Captionshaper process your files on your own computer. Your files are never uploaded. Neither app has accounts, ads or analytics.</p>
    <p>The apps only go online for things you can see: Fileshaper can check GitHub for a new version, and Captionshaper downloads its speech models the first time you pick one. After that, both work with the internet off.</p>
    <h2>Downloads</h2>
    <p>Installers are served by GitHub Releases, under GitHub’s own privacy statement.</p>
    <h2>Email</h2>
    <p>If you email me, I use your address only to reply. Nobody gets added to a mailing list.</p>
    <h2>Questions</h2>
    <p>Anything unclear? <a href="/contact/">Get in touch</a>.</p>
    <p class="muted">Last updated 11 November 2026.</p>
  </div>
</section>`,
});

const notFound = page({
  path: null,
  title: 'Page not found · Hollowbit Studio',
  desc: 'This page does not exist.',
  body: `
<section class="dhero wrap nf">
  <p class="nf-code in-0">404</p>
  <h1 class="h1" data-words>This page doesn’t exist.</h1>
  <div class="hero-cta in-2"><a class="btn btn-primary btn-lg" href="/">Back home ${ic('arrow')}</a><a class="btn btn-ghost btn-lg" href="/download/">Downloads</a></div>
</section>`,
});

/* ---------- write ---------- */
const out = {
  'index.html': home,
  'fileshaper/index.html': productPage(FS, CS),
  'captionshaper/index.html': productPage(CS, FS),
  'download/index.html': download,
  'about/index.html': about,
  'contact/index.html': contact,
  'donate/index.html': donate,
  'privacy/index.html': privacy,
  '404.html': notFound,
};
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
const urls = ['/', '/fileshaper/', '/captionshaper/', '/download/', '/about/', '/contact/', '/donate/', '/privacy/'];
writeFileSync(resolve(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${ORIGIN}${u}</loc><lastmod>2026-11-11</lastmod></url>`).join('\n')}
</urlset>
`);
console.log('built', Object.keys(out).length, 'pages | fileshaper', FS.version, '| captionshaper', CS.version);
