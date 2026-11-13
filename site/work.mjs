// Case studies (English only for now): one short page per app at /work/<slug>/.
// Facts and numbers come from each app's own test suites and notes; keep them in sync when they change.
export const WORK_INTRO = {
  title: 'Case studies · Hollowbit Studio',
  desc: 'How each Hollowbit app was planned, built and tested: the problem, the key decisions, and the numbers.',
  h1: 'Case studies',
  lead: 'How each app was planned, built and tested. The problem it solves, the decisions that shaped it, and the numbers behind it.',
  read: 'Read the case study',
  back: 'All case studies',
  sections: { problem: 'The problem', what: 'What it does', decisions: 'Key decisions', tested: 'How it was tested', next: 'What’s next' },
  meta: { platform: 'Platform', stack: 'Built with', released: 'First release', license: 'Licence' },
  links: { site: 'Website', source: 'Source code', download: 'Download' },
};

export const WORK = [
  {
    slug: 'fileshaper', v: 'fs', name: 'Fileshaper', site: 'https://fileshaper.app/', repo: 'hollowbit-dev/fileshaper',
    tagline: 'A free file toolbox that never uploads your files.',
    released: 'November 2026', platform: 'Mac and Windows', license: 'GPL-3.0',
    stack: 'Electron, FFmpeg, pdf-lib, PDF.js',
    stats: [['149 MB → 9.1 MB', 'A 40-second 4K clip, compressed to fit Discord’s 10 MB limit'], ['−88%', 'A PNG screenshot saved as a JPG that looks the same'], ['21', 'End-to-end checks that drive the real app']],
    problem: [
      'Everyday file jobs, like shrinking a video for Discord, opening an iPhone HEIC photo or signing a PDF, usually end up on upload websites. They come with queues, watermarks and paywalls, and the files are often private: ID scans, contracts, personal photos.',
      'Desktop alternatives exist, but they are either one-job tools or professional software with a learning curve.',
    ],
    what: 'Fileshaper puts the common video, image, PDF and audio jobs in one app that works offline. Compress to a size limit, trim, make GIFs, convert HEIC, resize, merge and split PDFs, sign and fill them, convert and normalise audio. The website also has browser versions of several tools for people who can’t install apps.',
    decisions: [
      ['Type the job, not the menu.', 'The home screen is a command field: type “compress for discord” and the right tool opens. Cmd/Ctrl+K reaches every tool from anywhere.'],
      ['Size targets instead of quality sliders.', 'People know the limit (8, 10, 25 MB), not a bitrate. Fileshaper uses two-pass encoding to land just under the number they pick.'],
      ['Originals are never changed.', 'Every result is saved as a new file next to the original, so nothing can be lost by accident.'],
      ['Browser tools that still upload nothing.', 'The website’s tools run on self-hosted ffmpeg.wasm, pdf-lib and PDF.js, so even the web version keeps files on the device.'],
      ['A name that says what it does.', 'The app launched as “Filesmith”, then was renamed once an older product with a similar name and pitch turned up. Every later name went through a stricter check: domains, GitHub, app stores and a web search.'],
    ],
    tested: [
      '21 Playwright end-to-end checks open the real app and run its tools on generated test media: videos, HEIC photos, PDFs and audio.',
      'Separate checks cover the browser tools, the animations, and screenshots of the website in all 6 languages.',
      'The compression numbers on this page come from those test files.',
    ],
    next: ['Signing the app with Apple and Microsoft certificates, so the first launch shows no warning.', 'Testing on more Windows PCs.', 'Translating the app itself, not just the website.'],
  },
  {
    slug: 'captionshaper', v: 'cs', name: 'Captionshaper', site: 'https://captionshaper.app/', repo: 'hollowbit-dev/captionshaper',
    tagline: 'Word-timed subtitles, written by a speech model on your own computer.',
    released: 'November 2026', platform: 'Mac (Apple Silicon) and Windows', license: 'GPL-3.0',
    stack: 'Electron, whisper.cpp, Silero VAD, FFmpeg with libass',
    stats: [['0.7%', 'Word error rate on the test clips'], ['≤ 0.11 s', 'How far word start times land from the real ones'], ['3.4 s', 'To transcribe a 38-second clip on Apple Silicon (37 s before GPU support was switched on)']],
    problem: [
      'Short vertical videos need captions, and the usual way to get them is a cloud editor or a subscription. The video has to be uploaded, and free tiers add watermarks or limits.',
      'Speech models that run locally are free and accurate, but they are command-line tools that produce plain text, not styled, word-timed captions.',
    ],
    what: 'Drop in a video and Captionshaper writes every word with its timing, offline. Fix any word, pick one of nine caption styles, and export SRT, VTT, ASS or an MP4 with the captions burned in.',
    decisions: [
      ['Mute the music before transcribing.', 'Speech models tend to invent words over music and silence. Captionshaper finds speech first with a separate voice detector, silences everything else, and drops any word outside speech.'],
      ['Its own caption layout engine.', 'Every word is measured and placed by the app, so the preview and the exported video match almost pixel for pixel, including word-by-word pop and highlight styles.'],
      ['Built for vertical video.', 'Captions stay inside a safe zone, and a phone view draws TikTok-style buttons over the video so nothing ends up hidden behind them.'],
      ['Show words while it works.', 'Audio is split at natural pauses into chunks of about 28 seconds, so words appear on screen as they are transcribed instead of all at the end.'],
      ['Download the model once, safely.', 'Speech models download with resume, retry and a SHA-256 check. After that, the app never needs the internet.'],
    ],
    tested: [
      '23 engine checks cover caption timing, line breaks and export formats.',
      '13 end-to-end checks drive the real app, plus download and packaged-app tests.',
      'An accuracy suite transcribes known speech clips and measures word errors, timing and words leaking into silence. Latest result: 0.7% word error rate, start times within 0.11 s, no leaks.',
    ],
    next: ['An Intel Mac build.', 'GPU speed-up on Windows.', 'Dragging captions on the timeline to retime them.'],
  },
  {
    slug: 'diskshaper', v: 'ds', name: 'Diskshaper', site: 'https://hollowbit.dev/diskshaper/', repo: 'hollowbit-dev/diskshaper',
    tagline: 'A storage cleaner that tells you what each thing is, and only ever moves it to the Trash.',
    released: 'November 2026', platform: 'Mac and Windows', license: 'MIT',
    stack: 'Electron, a read-only scanner in Node.js',
    stats: [['3', 'Groups people recognise: everyone, gaming, video editing'], ['0', 'Files deleted permanently: everything goes to the Trash or Recycle Bin'], ['14 GB', 'Found on the first real Mac it scanned, including 2.9 GB of empty CrossOver bottles']],
    problem: [
      'Drives fill up with things nobody chose to keep: shader caches, leftovers from uninstalled games, editing caches and old renders.',
      'The polished cleaners are paid (CleanMyMac costs about $40 a year), and the free ones show a long list of folder names without saying what is safe to remove.',
    ],
    what: 'Diskshaper scans the drive in seconds and sorts what it finds into plain groups, each labelled “Safe” or “Check first”. One click moves the safe items to the Trash, so everything can be put back. The website also has a duplicate photo finder that runs in the browser.',
    decisions: [
      ['Plain labels over clever ones.', '“Safe” means the app or game rebuilds it, or it can be downloaded again. “Check first” means only the owner knows, so those items are never ticked by default.'],
      ['The Trash, never delete.', 'Diskshaper only moves files to the Trash or Recycle Bin. Nothing is gone until the user empties it.'],
      ['Know which game a folder belongs to.', 'Steam, Epic, Heroic and CrossOver libraries are read directly, so leftovers from uninstalled games can be told apart from games that are still installed.'],
      ['A safety rule in the main process.', 'The app will only move paths from its most recent scan. Any other path is refused, even if the interface asks for it.'],
      ['Honest sizes.', 'Hard-linked files are counted once, and file ages use the modified date, because last-opened dates change whenever a file is read.'],
    ],
    tested: [
      'The test suite checks the interface in demo mode, the packaged app, and the safety rule that refuses paths outside the last scan.',
      'The browser photo finder is tested on exact duplicates (SHA-256) and look-alike photos (a 64-bit perceptual hash), including moving copies into a “Duplicates” folder.',
    ],
    next: ['Testing on more Windows PCs and on Intel Macs.', 'More game launchers and editing apps.'],
  },
  {
    slug: 'writeshaper', v: 'ws', name: 'Writeshaper', site: 'https://hollowbit.dev/writeshaper/', repo: 'hollowbit-dev/writeshaper',
    tagline: 'A private writing assistant that works in any app.',
    released: 'November 2026', platform: 'Mac and Windows', license: 'MIT',
    stack: 'Electron, llama.cpp, a quantised Qwen 3.5 4B model',
    stats: [['1.9 GB', 'Default model download, one time'], ['10 / 12', 'Accuracy test score for the default model (12 / 12 for the larger one)'], ['0 bytes', 'Of your writing sent anywhere']],
    problem: [
      'Grammar and tone assistants send every word you type to their servers, including work emails and private messages. The full versions cost about £10 a month.',
      'Local language models can do the same job, but they are hard to set up and don’t plug into the apps people actually write in.',
    ],
    what: 'Select text in any app and press a shortcut. A floating panel fixes the grammar or rewrites it clearer, shorter, friendlier or more professional, or translates it, and Replace pastes the result back. The Write tab underlines mistakes as you type and explains each fix.',
    decisions: [
      ['Quality decided the model size.', 'The goal was a download under 500 MB, but every model that small missed most mistakes in testing. The default is a 1.9 GB model that scored 10 of 12, with a 2.7 GB option that scored 12 of 12.'],
      ['Prove it before the download.', 'A 2 GB download from a new studio is a lot to ask. The website lets people try real answers from the app first, recorded on a laptop with no internet.'],
      ['Work where people already write.', 'A global shortcut and a floating panel mean it works in mail, chat and documents without plugins.'],
      ['Grammar and tone, not rewriting for you.', 'It is built for clearer emails and messages, not as a paraphraser. The prompts forbid adding facts, subject lines, sign-offs or placeholder names, and a clean-up step removes any that slip through.'],
      ['Fast on ordinary computers.', 'llama.cpp runs on the GPU with Metal on Macs and Vulkan on Windows, with a CPU fallback.'],
    ],
    tested: [
      'Engine and end-to-end tests run the real model on real text.',
      'An accuracy suite of 12 test passages scores each model, which is where the 10 / 12 and 12 / 12 come from.',
      'Download tests check pausing, resuming and the SHA-256 check, and a packaged-app test checks the installers.',
    ],
    next: ['Testing the global shortcut on more Macs and on Windows.', 'Translating the website into the other five languages.'],
  },
  {
    slug: 'startshaper', v: 'ss', name: 'Startshaper', site: 'https://hollowbit.dev/startshaper/', repo: 'hollowbit-dev/startshaper',
    tagline: 'Why is my PC slow? Every app that starts by itself, explained in plain words, with one switch each.',
    released: 'November 2026', platform: 'Mac and Windows', license: 'MIT',
    stack: 'Electron, PowerShell on Windows, launchctl and sfltool on macOS',
    stats: [['3', 'Plain groups: Safe to turn off, Your call, Leave these on'], ['0', 'Registry tweaks, deleted entries or stopped services'], ['10', 'Apps found starting by themselves on the first real Mac it checked']],
    problem: [
      'Most slow computers are slow because of apps that start by themselves: game launchers, updaters, chat and music apps that open at login and stay running.',
      'The paid fixers sell this as a subscription (CCleaner Pro is about $45 a year), and the free ones are expert tweak lists that can break things if you don’t know what each switch does.',
    ],
    what: 'Startshaper lists everything that starts by itself, explains each item in one line, and sorts it into Safe to turn off, Your call, or Leave these on. On Windows it reads the startup timing log, so it can say “Your PC takes 94 s to start. These 6 apps add 41 s.” Right now shows what is using memory, and Changes lets you turn everything back on.',
    decisions: [
      ['Use the system’s own switch.', 'On Windows, turning an item off writes the same StartupApproved setting as Task Manager’s Startup tab; on a Mac it uses launchctl disable, like Login Items. Nothing is deleted, so turning it back on restores it exactly.'],
      ['One row per app, not per file.', 'Google’s updater alone installs three background items on a Mac. They are grouped by app, developer and bundle ID, so a person sees one “Google updater” row.'],
      ['Seconds, not scores.', 'Windows already records which apps slowed each startup. Startshaper shows those seconds instead of an invented “impact” score.'],
      ['No admin by default.', 'Everything a normal user can change is a switch. Items that need an admin password open Task Manager or Login Items instead of asking for elevation.'],
    ],
    tested: [
      'The Windows reader is tested with made-up PowerShell output: startup entries, disabled flags, boot events and process grouping.',
      'Interface tests click through the demo, and a separate run checks the real Mac read-only. The on/off switch was tested as a full round trip on a real launch agent.',
      'Animations are measured under a 4x CPU slowdown.',
    ],
    next: ['Testing on more Windows PCs.', 'An admin mode for system-wide items.'],
  },
];
