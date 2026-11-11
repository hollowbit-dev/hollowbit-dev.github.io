// Builds the static pages: node site/build.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://hollowbit.dev';

const GH_PATH = 'M8 .2a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.23 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 .2Z';

const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="logo" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm9 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/></symbol>
  <symbol id="arrow" viewBox="0 0 16 16"><path d="M3.5 8h9m0 0L8.5 4m4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="out" viewBox="0 0 16 16"><path d="M5 11 11 5m0 0H6m5 0v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="check" viewBox="0 0 16 16"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="gh" viewBox="0 0 16 16"><path fill="currentColor" d="${GH_PATH}"/></symbol>
  <symbol id="cup" viewBox="0 0 16 16"><path d="M2.5 5.5h8v4a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-4Zm8 1h1a1.75 1.75 0 0 1 0 3.5h-1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 2.5v1.2M7.5 2.5v1.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></symbol>
</svg>`;

const NAV = [
  ['/', 'Home', 'home'],
  ['/fileshaper/', 'Fileshaper', 'fileshaper'],
  ['/captionshaper/', 'Captionshaper', 'captionshaper'],
  ['/about/', 'About', 'about'],
];

function page({ path, key, title, desc, body, cls = '' }) {
  const nav = NAV.map(([href, label, k]) =>
    `<a href="${href}"${k === key ? ' aria-current="page"' : ''}>${k === key ? '<span class="nav-pill"></span>' : ''}<span class="nav-label">${label}</span></a>`).join('');
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
<link rel="preload" href="/assets/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/style.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="${cls}">
<a class="skip" href="#main">Skip to content</a>
${sprite}
<header class="nav">
  <a class="brand" href="/" aria-label="Hollowbit home"><svg class="logo"><use href="#logo"/></svg><span>Hollowbit</span></a>
  <nav class="nav-links" aria-label="Main">${nav}</nav>
  <a class="nav-gh" href="https://github.com/hollowbit-dev" aria-label="Hollowbit on GitHub"><svg><use href="#gh"/></svg></a>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <div class="foot-in">
    <a class="brand" href="/" aria-label="Hollowbit home"><svg class="logo"><use href="#logo"/></svg><span>Hollowbit</span></a>
    <p class="foot-note">Free tools that never upload your files. No cookies or analytics on this site.</p>
    <nav aria-label="Footer">
      <a href="/fileshaper/">Fileshaper</a>
      <a href="/captionshaper/">Captionshaper</a>
      <a href="/about/">About</a>
      <a href="https://github.com/hollowbit-dev">GitHub</a>
      <a href="https://ko-fi.com/hollowbit">Ko-fi</a>
    </nav>
  </div>
  <p class="foot-copy">© 2026 Elvis Zygmanta</p>
</footer>
<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

/* ---------- demos (built in HTML, illustrative) ---------- */
const fsDemo = `<div class="demo demo-fs" id="demo-fs" role="tabpanel" aria-labelledby="tab-fs">
  <p class="sr-only">Animated demo: Fileshaper compresses a 214 MB video to 9.6 MB, on the computer.</p>
  <div class="win" aria-hidden="true">
    <aside class="fs-side">
      <div class="tl"><i></i><i></i><i></i></div>
      <div class="fs-brand"><img src="/assets/img/fileshaper-icon.png" alt=""><div><b>Fileshaper</b><small>by Hollowbit</small></div></div>
      <div class="fs-search">Search actions <kbd>⌘K</kbd></div>
      <div class="fs-nav">
        <span class="on">Home</span><em>Tools</em>
        <span>Video <small>2</small></span><span>Images <small>4</small></span><span>PDF</span><span>Audio <small>1</small></span>
      </div>
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
        <div class="fs-done"><svg><use href="#check"/></svg><span><b>214 MB → 9.6 MB</b> · fits Discord's 10 MB limit</span></div>
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
  return `<div class="stage${only ? ' stage-single' : ''}" data-stage>
    ${tabs}
    <div class="stage-frame"><div class="stage-scale">${demos}</div></div>
  </div>`;
}

/* ---------- pages ---------- */
const home = page({
  path: '/', key: 'home',
  title: 'Hollowbit: free tools that never upload your files',
  desc: 'Hollowbit is a small software studio by Elvis Zygmanta. Free, open-source apps for Windows and Mac that run entirely on your own computer.',
  body: `
<section class="hero">
  <h1 class="hero-title" data-words>Free tools that never upload your files.</h1>
  <p class="hero-sub in-1">Small, polished apps for Windows and Mac that do one job well, entirely on your own computer. Free and open source.</p>
  <div class="hero-cta in-2">
    <a class="btn btn-primary" href="/fileshaper/">Explore the tools <svg><use href="#arrow"/></svg></a>
    <a class="btn btn-ghost" href="/about/">About Hollowbit</a>
  </div>
  <div class="in-3">${stage()}</div>
</section>

<section class="tiles" aria-label="Tools">
  <a class="tile" href="/fileshaper/" style="--c: var(--fs)">
    <div class="tile-top">
      <img class="vt-icon-fs" src="/assets/img/fileshaper-icon.png" width="48" height="48" alt="">
      <span class="tile-go"><svg><use href="#arrow"/></svg></span>
    </div>
    <h2>Fileshaper</h2>
    <p>Compress videos for Discord, convert iPhone photos, merge and sign PDFs. One toolbox, fully offline.</p>
    <div class="tile-shot"><img src="/assets/img/fileshaper-app.webp" width="1200" height="760" alt="" loading="lazy"></div>
  </a>
  <a class="tile" href="/captionshaper/" style="--c: var(--cs)">
    <div class="tile-top">
      <img class="vt-icon-cs" src="/assets/img/captionshaper-icon.png" width="48" height="48" alt="">
      <span class="tile-go"><svg><use href="#arrow"/></svg></span>
    </div>
    <h2>Captionshaper</h2>
    <p>Word-timed subtitles for any video, written by a speech model on your own computer. SRT, VTT or burned in.</p>
    <div class="tile-shot"><img src="/assets/img/captionshaper-app.webp" width="1600" height="1018" alt="" loading="lazy"></div>
  </a>
</section>`,
});

function productPage(p) {
  return page({
    path: `/${p.slug}/`, key: p.slug, cls: `p-${p.slug}`,
    title: `${p.name}: ${p.title} · Hollowbit`,
    desc: p.desc,
    body: `
<section class="phero" style="--c: var(--${p.var})">
  <img class="phero-icon vt-icon-${p.var}" src="/assets/img/${p.slug}-icon.png" width="88" height="88" alt="">
  <h1 class="phero-title" data-words>${p.line}</h1>
  <p class="phero-sub in-1">${p.lede}</p>
  <div class="hero-cta in-2">
    <a class="btn btn-color" href="${p.site}">Download at ${p.domain} <svg><use href="#out"/></svg></a>
    <a class="btn btn-ghost" href="${p.repo}"><svg><use href="#gh"/></svg> Source code</a>
  </div>
  <p class="phero-meta in-2">${p.meta}</p>
  <div class="in-3">${stage(p.var)}</div>
</section>

<section class="feats-sec" style="--c: var(--${p.var})">
  <h2 class="sec-title reveal">${p.featsTitle}</h2>
  <div class="feat-grid">
    ${p.feats.map(([h, t]) => `<div class="feat reveal"><h3>${h}</h3><p>${t}</p></div>`).join('\n    ')}
  </div>
</section>

<section class="shot-sec">
  <figure class="big-shot" data-tilt>
    <img src="/assets/img/${p.slug}-app.webp" width="${p.w}" height="${p.h}" loading="lazy" alt="${p.alt}">
  </figure>
</section>

<section class="next" style="--c: var(--${p.var})">
  <div class="next-card reveal">
    <h2>${p.close}</h2>
    <p>Free for Windows and Mac. No account, no watermark, nothing uploaded.</p>
    <a class="btn btn-color" href="${p.site}">Get ${p.name} <svg><use href="#out"/></svg></a>
  </div>
  <a class="next-link" href="/${p.next}/"><small>Next</small><span>${p.nextName} <svg><use href="#arrow"/></svg></span></a>
</section>`,
  });
}

const fileshaper = productPage({
  slug: 'fileshaper', var: 'fs', name: 'Fileshaper', domain: 'fileshaper.app',
  site: 'https://fileshaper.app/', repo: 'https://github.com/hollowbit-dev/fileshaper',
  title: 'fix any file, privately',
  desc: 'Fileshaper is a free, offline file toolbox for Windows and Mac. Compress videos for Discord, convert iPhone photos, merge and sign PDFs. Nothing is uploaded.',
  line: 'Fix any file. Nothing leaves your computer.',
  lede: 'Type what you want to do. Fileshaper compresses, converts, trims, merges and signs your files right on your machine, with no upload site in sight.',
  meta: 'v1.2.0 · Windows and macOS, plus tools in your browser · GPL-3.0',
  featsTitle: 'One app instead of a dozen upload sites.',
  feats: [
    ['Video', 'Compress to an exact size, so a clip lands just under Discord’s 10 MB. Trim, mute, convert, make GIFs, pull out the audio.'],
    ['Images', 'Turn iPhone HEIC photos into JPGs, resize and compress whole folders, or combine images into a PDF.'],
    ['PDF', 'Merge, split, reorder and compress PDFs. Draw or type a signature and fill in forms.'],
    ['Audio', 'Convert between formats, trim, and even out the volume of recordings.'],
  ],
  w: 1200, h: 760, alt: 'Fileshaper’s home screen: a command field with suggestions and a list of recently shrunk files.',
  close: 'Stop uploading your files to sketchy websites.',
  next: 'captionshaper', nextName: 'Captionshaper',
});

const captionshaper = productPage({
  slug: 'captionshaper', var: 'cs', name: 'Captionshaper', domain: 'captionshaper.app',
  site: 'https://captionshaper.app/', repo: 'https://github.com/hollowbit-dev/captionshaper',
  title: 'free offline auto subtitles',
  desc: 'Captionshaper writes accurate, word-timed captions for any video on your own computer. Export SRT, VTT or burn in TikTok-style captions. Free and open source.',
  line: 'Captions that keep up with you.',
  lede: 'Drop in a video and get every word with its timing, transcribed by a speech model running on your own computer. Fix anything, pick a style, export.',
  meta: 'v1.1.0 · macOS and Windows · GPL-3.0',
  featsTitle: 'From raw video to captioned in a minute.',
  feats: [
    ['Word-timed', 'Whisper runs locally and times every word to the voice. A one-minute clip takes about ten seconds on an M-series Mac.'],
    ['Accurate', '0.7% word errors on our test clips. Music and silence are skipped, so captions don’t appear when nobody is talking.'],
    ['Styled', 'Nine looks, from clean subtitles to TikTok-style word pop. What you see in the preview is what gets burned in.'],
    ['Yours', 'Export SRT or VTT for YouTube and editors, or a finished video with the captions burned in. No watermark.'],
  ],
  w: 1600, h: 1018, alt: 'Captionshaper’s editor: a vertical video with a bold caption, a list of word-timed captions and a waveform timeline.',
  close: 'Captions without the subscription.',
  next: 'fileshaper', nextName: 'Fileshaper',
});

const about = page({
  path: '/about/', key: 'about',
  title: 'About · Hollowbit',
  desc: 'Hollowbit is Elvis Zygmanta’s studio for small, free tools that run on your own computer. No ads, no accounts, no tracking, open source.',
  body: `
<section class="ahero">
  <svg class="ahero-logo"><use href="#logo"/></svg>
  <h1 class="ahero-title" data-words>Hi, I’m Elvis.</h1>
  <div class="ahero-body in-1">
    <p>I’m Elvis Zygmanta, based in Thailand. Hollowbit is my studio for small, free tools that treat the people using them with respect.</p>
    <p>It started with an annoyance. Shrinking a video for Discord or opening an iPhone photo on Windows meant uploading it somewhere, waiting in a queue and paying to remove a watermark, for jobs a normal computer can do in seconds. So each Hollowbit app takes one of those websites and does the job offline, for free.</p>
    <p>Every app ships with installers for Windows and Mac, its own website, and automated tests that drive the real app before each release.</p>
  </div>
</section>

<section class="rules-sec" aria-labelledby="rules-h">
  <h2 id="rules-h" class="sec-title reveal">What Hollowbit sticks to</h2>
  <ol class="rules">
    <li><span class="rule-big">No uploads.</span><span class="rule-note">Files are opened, changed and saved on your computer. Everything works with the Wi-Fi off.</span></li>
    <li><span class="rule-big">No ads.</span><span class="rule-note">Not in the apps, not on the websites.</span></li>
    <li><span class="rule-big">No accounts.</span><span class="rule-note">You shouldn’t have to sign up to convert a file.</span></li>
    <li><span class="rule-big">No tracking.</span><span class="rule-note">No analytics and no cookies, including on this site.</span></li>
    <li><span class="rule-big">No watermarks.</span><span class="rule-note">No trial and no “pro” tier. The free version is the whole thing.</span></li>
    <li><span class="rule-big">Open source.</span><span class="rule-note">Every line is on GitHub under the GPL.</span></li>
  </ol>
</section>

<section class="links-sec">
  <a class="link-card reveal" href="https://github.com/hollowbit-dev"><svg class="lc-icon"><use href="#gh"/></svg><span><b>GitHub</b><small>Code, releases and issues</small></span><svg class="go"><use href="#out"/></svg></a>
  <a class="link-card reveal" href="https://ko-fi.com/hollowbit"><svg class="lc-icon"><use href="#cup"/></svg><span><b>Ko-fi</b><small>Buy me a coffee if a tool saved you time</small></span><svg class="go"><use href="#out"/></svg></a>
</section>`,
});

const notFound = page({
  path: null, key: '',
  title: 'Page not found · Hollowbit',
  desc: 'This page does not exist.',
  body: `
<section class="ahero nf">
  <p class="nf-code in-1">404</p>
  <h1 class="ahero-title" data-words>This page doesn’t exist.</h1>
  <div class="hero-cta in-2"><a class="btn btn-primary" href="/">Back home <svg><use href="#arrow"/></svg></a></div>
</section>`,
});

const out = { 'index.html': home, 'fileshaper/index.html': fileshaper, 'captionshaper/index.html': captionshaper, 'about/index.html': about, '404.html': notFound };
// Root-relative links become relative, so pages also work opened straight from the folder.
// 404.html keeps absolute paths: GitHub Pages serves it at any depth.
const relink = (html, f) => {
  if (f === '404.html') return html;
  const up = '../'.repeat(f.split('/').length - 1);
  return html
    .replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_, a, p) => `${a}="${up}${p === '' ? (up ? '' : './') : p}"`)
    .replace(/url\("\/assets/g, `url("${up}assets`);
};
for (const [f, raw] of Object.entries(out)) {
  const html = relink(raw, f);
  const p = resolve(root, f);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, html);
}
writeFileSync(resolve(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['/', '/fileshaper/', '/captionshaper/', '/about/'].map((u) => `  <url><loc>${ORIGIN}${u}</loc><lastmod>2026-11-11</lastmod></url>`).join('\n')}
</urlset>
`);
console.log('built', Object.keys(out).join(', '));
