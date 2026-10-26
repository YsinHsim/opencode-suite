#!/usr/bin/env node
/**
 * Generates the five pages from shared chrome.
 *
 * Why a generator: the nav, footer and <head> were duplicated across five
 * files and drifted every time the design changed. One source means a theme
 * or nav change lands everywhere at once.
 *
 * Usage:  node build-pages.mjs
 * Output: index.html, privacy.html, terms.html, support.html, data-access.html
 */
import { writeFileSync } from 'node:fs'

const SITE = 'https://opencode-suite.vercel.app'
const PORTFOLIO = 'https://yasinhassim.vercel.app/'

/* ---------------------------------------------------------------- head */

function head({ title, description, path }) {
  // Live URLs are clean (/privacy, not /privacy.html) — canonical must match.
  const canonicalPath = path.replace(/\.html$/, '')
  const url = `${SITE}${canonicalPath}`
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="theme-color" content="#fdf9f6" />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="opencode suite" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${SITE}/og-image.png" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="preload" href="/fonts/outfit-800-latin.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/plus-jakarta-sans-400-latin.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/fonts.css" />
<link rel="stylesheet" href="/style.css" />
<script>
  // Apply the stored theme before first paint to prevent a flash of the
  // wrong theme. Kept inline and tiny on purpose.
  (function () {
    try {
      var t = null;
      // ?theme=light|dark override — used for screenshots and testing.
      var q = new URLSearchParams(location.search).get('theme');
      if (q === 'light' || q === 'dark') t = q;
      if (!t) t = localStorage.getItem('opencode-theme');
      if (t !== 'light' && t !== 'dark') {
        t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', t);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })();
</script>
</head>`
}

/* ---------------------------------------------------------------- chrome */

/* ---------------------------------------------------------------- repos
   One entry per repo in the suite. Add repo #4 here and every count,
   card, footer link and install step updates itself.
*/
const REPOS = [
  {
    name: 'opencode-bootstrap',
    url: 'https://github.com/YsinHsim/opencode-bootstrap',
    step: 'Base',
    pill: 'Public',
    accent: { raw: 'var(--mint)', main: 'var(--mint-d)' },
    tagline: 'One-command setup for the whole environment on a new machine.',
    points: [
      'Two paths: the author&rsquo;s reference config, or <code>--interview</code> — a config generated from your answers',
      'Interview asks your provider (OpenAI, Anthropic, Ollama, any custom endpoint), keys, MCP servers, tone and language',
      'Nothing you decline is written. No placeholder sections, no surprises',
      'Installs OpenCode CLI and GitHub CLI if missing; backs up the live config before touching it',
    ],
    foot: 'macOS · Linux · Termux',
    term: {
      comment: 'base: your provider, your keys, your rules',
      cmds: [
        'git clone https://github.com/YsinHsim/opencode-bootstrap.git',
        'cd opencode-bootstrap &amp;&amp; ./install.sh --interview',
      ],
    },
  },
  {
    name: 'opencode-aztra',
    url: 'https://github.com/YsinHsim/opencode-aztra',
    step: 'Company',
    pill: 'Public',
    accent: { raw: 'var(--butter)', main: 'var(--butter-d)' },
    tagline: 'Connects OpenCode to Aztra as a remote MCP server.',
    points: [
      'Projects, issues and sprints',
      'Time logs, goals and workload',
      'Wiki pages for decisions and handoffs',
      'Prompts once for a workspace API key',
    ],
    foot: 'Key → <code>aztra.key</code>',
    term: {
      comment: 'company: prompts for your Aztra key',
      cmds: [
        'git clone https://github.com/YsinHsim/opencode-aztra.git',
        'cd ../opencode-aztra &amp;&amp; ./install.sh',
      ],
    },
  },
  {
    name: 'opencode-google',
    url: 'https://github.com/YsinHsim/opencode-google',
    step: 'Google',
    pill: 'Public',
    accent: { raw: 'var(--sky)', main: 'var(--sky-d)' },
    tagline: 'Local MCP server for your Google account. 22 tools, seven scopes.',
    points: [
      'Calendar: read, find free slots, create, move',
      'Gmail search and thread reading — read-only',
      'Docs, Sheets and Drive uploads inside one folder',
      'Tasks and Contacts',
    ],
    foot: 'Runs on your Mac',
    term: {
      comment: 'google: browser OAuth, then create the Drive folder',
      cmds: [
        'git clone https://github.com/YsinHsim/opencode-google.git',
        'cd ../opencode-google &amp;&amp; ./install.sh',
        'source .venv/bin/activate &amp;&amp; python auth.py',
        'python setup_check.py --setup',
        'python setup_check.py --selftest',
      ],
      tail: '<span class="c-ok">Granted scopes</span>\n  <span class="c-ok">[PASS]</span> Calendar (read/write)\n  <span class="c-ok">[PASS]</span> Gmail (read only)\n  <span class="c-ok">[PASS]</span> Drive (app-created files)\n  <span class="c-dim">… 4 more</span>',
    },
  },
]

const repoCount = REPOS.length
const pad2 = (n) => String(n).padStart(2, '0')

function repoCards() {
  return REPOS.map((r, i) => `      <a class="card" style="--accent-raw: ${r.accent.raw}; --accent: ${r.accent.main}" href="${r.url}" data-reveal>
        <div class="card-step"><span>${pad2(i + 1)} · ${r.step}</span><span class="pill">${r.pill}</span></div>
        <h3>${r.name}</h3>
        <p>${r.tagline}</p>
        <ul class="card-list">
${r.points.map((pt) => `          <li>${pt}</li>`).join('\n')}
        </ul>
        <div class="card-foot"><span>${r.foot}</span><span class="arrow" aria-hidden="true">→</span></div>
      </a>`).join('\n')
}

function repoFooterLinks() {
  return REPOS.map((r) => `        <li><a href="${r.url}">${r.name}</a></li>`).join('\n')
}

/* Install terminal: one comment block + commands per repo, plus optional tail output. */
function installTerm() {
  const blocks = REPOS.map((r, i) => {
    const lines = [`<span class="c-dim"># ${pad2(i + 1)} — ${r.term.comment}</span>`]
    for (const c of r.term.cmds) {
      lines.push(`<span class="c-prompt">$</span> <span class="c-cmd">${c}</span>`)
    }
    if (r.term.tail) lines.push('', r.term.tail)
    return lines.join('\n')
  })
  return blocks.join('\n\n')
}

/* ---------------------------------------------------------------- chrome */

const starSVG = `<svg class="brand-star" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 1.6l2.3 6.4 6.4 2.3-6.4 2.3-2.3 6.4-2.3-6.4L3.3 10.3l6.4-2.3z"/><path d="M19.2 15.4l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" opacity=".55"/></svg>`

const sunSVG = `<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`
const moonSVG = `<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>`
const menuSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`

function nav(current) {
  const links = [
    ['/#repos', 'Repos', 'repos'],
    ['/#safety', 'Safety', 'safety'],
    ['/privacy.html', 'Privacy', 'privacy'],
    ['/data-access.html', 'Data', 'data-access'],
    ['/terms.html', 'Terms', 'terms'],
  ]
  const items = links
    .map(([href, label, key]) =>
      `      <a href="${href}"${key === current ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('\n')

  return `<nav class="nav">
  <div class="nav-inner">
    <a class="brand" href="/">${starSVG}opencode<span class="dim">-suite</span></a>
    <div class="nav-links" id="nav-links">
${items}
      <a class="btn btn-primary" href="https://github.com/YsinHsim/opencode-google">GitHub</a>
    </div>
    <button class="theme-toggle" type="button" aria-label="Switch theme" title="Switch theme">
      ${sunSVG}${moonSVG}
    </button>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Toggle menu">
      ${menuSVG}
    </button>
  </div>
</nav>`
}

function footer() {
  return `<footer class="foot">
  <div class="foot-grid">
    <div>
      <a class="brand" href="/" style="margin-bottom:.9rem">${starSVG}opencode<span class="dim">-suite</span></a>
      <p style="color:var(--muted);font-size:.87rem;max-width:32ch">
        Single-purpose installers for OpenCode. Local MCP servers, narrow scopes,
        secrets that never leave your machine.
      </p>
    </div>
    <div>
      <h4>Repos</h4>
      <ul class="foot-links">
${repoFooterLinks()}
      </ul>
    </div>
    <div>
      <h4>Google app</h4>
      <ul class="foot-links">
        <li><a href="/privacy.html">Privacy policy</a></li>
        <li><a href="/terms.html">Terms of service</a></li>
        <li><a href="/support.html">Support</a></li>
        <li><a href="/data-access.html">Data access</a></li>
      </ul>
    </div>
    <div>
      <h4>Elsewhere</h4>
      <ul class="foot-links">
        <li><a href="https://github.com/YsinHsim">GitHub</a></li>
        <li><a href="${PORTFOLIO}">Portfolio</a></li>
      </ul>
    </div>
  </div>
  <div class="foot-bottom">
    <span>© 2026 Yasin Hassim · Kota Kinabalu, Malaysia</span>
    <span class="mono">✦ no cookies · no trackers · no accounts</span>
  </div>
</footer>`
}

function page({ title, description, path, current, body, jsonld }) {
  const structured = jsonld
    ? `\n<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n</script>`
    : ''
  return `${head({ title, description, path })}
${structured}
<body>
<div class="atmosphere" aria-hidden="true"></div>
<div class="page-glow" aria-hidden="true"></div>

${nav(current)}

${body}

${footer()}

<script src="/main.js" defer></script>
</body>
</html>
`
}

/* ---------------------------------------------------------------- favicon */

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ff8fb1"/><stop offset="1" stop-color="#c3a7f7"/>
  </linearGradient></defs>
  <rect width="32" height="32" rx="8" fill="#16121c"/>
  <path d="M16 5l2.9 8.1L27 16l-8.1 2.9L16 27l-2.9-8.1L5 16l8.1-2.9z" fill="url(#g)"/>
</svg>
`

/* ================================================================ PAGES */

const indexBody = `<header class="hero">
  <div class="wrap">
    <p class="eyebrow">${repoCount} repos · one machine · zero cloud</p>
    <h1 class="hero-h1">
      <span class="line">Your agent,</span>
      <span class="line indent">finally knows</span>
      <span class="line"><span class="mark">your work.</span> <span class="kana">✦ しごと</span></span>
    </h1>
    <p class="lede">
      OpenCode is sharp but blind. It can't see your tickets, your inbox, or your calendar.
      These installers fix that with local MCP servers — each owning exactly one secret and
      one config entry, so you can add, update or remove them independently.
    </p>
    <p class="lede" style="margin-top:.9rem;font-size:.95em">
      New here? Start with the base installer's <code>--interview</code> mode: it asks a
      handful of questions and writes a config for <strong>your</strong> provider — OpenAI,
      Anthropic, Ollama, or any OpenAI-compatible endpoint. Then add Google or Aztra only
      if you want them.
    </p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#install">Install the suite →</a>
      <a class="btn btn-ghost" href="#repos">See what each one does</a>
    </div>
    <div class="hero-meta">
      <span><b>0</b> cloud servers</span>
      <span><b>0</b> subscriptions</span>
      <span><b>${repoCount}</b> repos</span>
      <span>macOS · Linux · Termux</span>
    </div>
  </div>
</header>

<div class="wrap">
  <div class="stats" data-reveal>
    <div class="stat">
      <span class="stat-n">22</span>
      <span class="stat-l">Google MCP tools</span>
    </div>
    <div class="stat">
      <span class="stat-n">7</span>
      <span class="stat-l">Google scopes</span>
    </div>
    <div class="stat">
      <span class="stat-n">0600</span>
      <span class="stat-l">Key file mode</span>
    </div>
    <div class="stat">
      <span class="stat-n">RM 0</span>
      <span class="stat-l">Google API charge</span>
    </div>
  </div>
</div>

<section>
  <div class="wrap split">
    <div data-reveal>
      <p class="eyebrow">The gap</p>
      <h2>A great agent with<br /><span class="mark mark-amber">no context.</span></h2>
    </div>
    <div data-reveal>
      <p class="lede">
        You open OpenCode, ask it to book a slot, and it asks which calendar. Ask it about a
        client email and you paste it in by hand. Every session starts from zero because the
        agent can't reach the systems where your actual work lives.
      </p>
      <p style="margin-top:1.15rem;color:var(--muted)">
        The usual fix is a hosted integration that wants your whole Google account and a
        monthly fee. This suite takes the other route: small servers on your own machine,
        talking directly to the APIs, holding the narrowest scopes that still do the job.
      </p>
    </div>
  </div>
</section>

<hr class="rule" />

<section id="repos">
  <div class="wrap">
    <div data-reveal>
      <p class="eyebrow">Single-purpose installers · ${repoCount} and counting</p>
      <h2>Install in<br />this order.</h2>
      <p class="lede" style="margin-top:1.25rem">
        Step one is not optional. Run it with <code>--interview</code> unless you want the
        author's reference config. Every step after it is independent — skip any of them
        and the rest still works.
      </p>
    </div>

    <div class="cards">
${repoCards()}
    </div>
  </div>
</section>

<hr class="rule" />

<section id="safety">
  <div class="wrap">
    <div data-reveal>
      <p class="eyebrow">Why this doesn't need blind trust</p>
      <h2>Every action is<br /><span class="mark mark-mint">a class.</span></h2>
      <p class="lede" style="margin-top:1.25rem">
        The safety model is enforced in code, not by asking the model nicely. A destructive
        action cannot execute on its first call even if the prompt says it should.
      </p>
    </div>

    <div class="classes">
      <div class="class-card r" data-reveal>
        <span class="class-tag">✦ Class R</span>
        <h3>Do it, then report</h3>
        <p>Creating is additive. If it goes wrong you delete the result yourself. All reads are Class R by definition.</p>
      </div>
      <div class="class-card c" data-reveal>
        <span class="class-tag">✦ Class C</span>
        <h3>Preview, then wait</h3>
        <p>The first call does nothing. It returns a field-by-field before/after and a one-time token bound to that exact payload. Change a value and the token is refused.</p>
      </div>
      <div class="class-card x" data-reveal>
        <span class="class-tag">✦ Class X</span>
        <h3>No tool exists</h3>
        <p>No send-mail. No permanent delete. No changing sharing or ownership. If you ask, it explains the manual path in the UI instead.</p>
      </div>
    </div>

    <div class="features">
      <div class="feature" data-reveal>
        <span class="feature-n">01</span>
        <h3>Drive is fenced</h3>
        <p>Uploads land only in one <code>opencode/</code> folder. The <code>drive.file</code> scope means Google itself limits access to files the app created. A path outside the fence is refused in code.</p>
      </div>
      <div class="feature" data-reveal>
        <span class="feature-n">02</span>
        <h3>Narrow scopes, on purpose</h3>
        <p>Gmail is <code>readonly</code>. Draft creation needs <code>gmail.compose</code> and is deliberately not requested. YouTube was excluded because <code>search.list</code> costs 100 units against a 10,000/day quota.</p>
      </div>
      <div class="feature" data-reveal>
        <span class="feature-n">03</span>
        <h3>Secrets stay off the repo</h3>
        <p>Keys are read at runtime through <code>{file:…}</code> references, so <code>opencode.json</code> is safe to commit, sync or share. Nothing secret is written into a config file.</p>
      </div>
      <div class="feature" data-reveal>
        <span class="feature-n">04</span>
        <h3>Write provenance</h3>
        <p>Files the agent creates carry an <code>[OpenCode]</code> title prefix. Anything without it is treated as your own work: readable, but never rewritten.</p>
      </div>
    </div>
  </div>
</section>

<hr class="rule" />

<section id="install">
  <div class="wrap split">
    <div data-reveal>
      <p class="eyebrow">Install</p>
      <h2>One clone<br />per repo.</h2>
      <p class="lede" style="margin-top:1.25rem">
        Each installer detects your platform, backs up the live config before touching it,
        and only writes under <code>~/.config/opencode</code> and the repo directory.
      </p>
      <div class="callout">
        <strong>Before you start:</strong> git, python3, and a Google account. The Google
        Cloud Console setup is a one-time ten minute step with no billing account and no
        credit card.
      </div>
    </div>

    <div data-reveal>
      <div class="term">
        <div class="term-bar">
          <span class="term-dot"></span><span class="term-dot"></span><span class="term-dot"></span>
          <span class="term-title">zsh — install</span>
          <button class="btn btn-ghost" data-copy="#cmd-install" style="margin-left:auto;padding:.25rem .7rem;font-size:.68rem">Copy</button>
        </div>
        <div class="term-body">
<pre id="cmd-install">${installTerm()}</pre>
        </div>
      </div>
    </div>
  </div>
</section>

<hr class="rule" />

<section>
  <div class="wrap">
    <div data-reveal>
      <p class="eyebrow">In practice</p>
      <h2>Things you can<br />just ask.</h2>
    </div>
    <div class="features">
      <div class="feature" data-reveal>
        <span class="feature-n">→</span>
        <h3>&ldquo;What's on my calendar this week?&rdquo;</h3>
        <p>Reads the window you name. Silence is the correct answer when nothing is on.</p>
      </div>
      <div class="feature" data-reveal>
        <span class="feature-n">→</span>
        <h3>&ldquo;Find me a 90 minute free slot on Thursday&rdquo;</h3>
        <p>Gaps inside working hours, Mon–Fri, defaulting to Asia/Kuala_Lumpur.</p>
      </div>
      <div class="feature" data-reveal>
        <span class="feature-n">→</span>
        <h3>&ldquo;Move the HSSB call to Friday 3pm&rdquo;</h3>
        <p>Class C. You see the before/after, say yes, and only then does it move.</p>
      </div>
      <div class="feature" data-reveal>
        <span class="feature-n">→</span>
        <h3>&ldquo;Any unread email from clients in the last 2 days?&rdquo;</h3>
        <p>Gmail syntax, capped results. One thread at a time, not the whole mailbox.</p>
      </div>
      <div class="feature" data-reveal>
        <span class="feature-n">→</span>
        <h3>&ldquo;Make a CR for the sales order monitor and upload it&rdquo;</h3>
        <p>Creates the Doc inside <code>opencode/</code> and hands you the link. Moving it out afterwards is expected.</p>
      </div>
    </div>
  </div>
</section>

<hr class="rule" />

<section>
  <div class="wrap split">
    <div data-reveal>
      <p class="eyebrow">Who runs this</p>
      <h2>Built on one<br /><span class="mark mark-sky">real desk.</span></h2>
    </div>
    <div data-reveal>
      <p class="lede">
        The opencode suite is a toolset by <strong>Yasin Hassim</strong>, a software
        developer and system analyst in Kota Kinabalu, Sabah, Malaysia — written for his
        own desk first, and made public so anyone can run the same setup.
      </p>
      <p style="margin-top:1.15rem;color:var(--muted)">
        It started as a way to stop re-pasting context into every session: tickets in one
        system, schedule and inbox in another, and an agent that could see neither. Each
        installer is small, does one thing, and owns exactly one secret — so the whole
        thing stays auditable in an afternoon.
      </p>
      <p style="margin-top:1.15rem;color:var(--muted)">
        The repos are public and readable. There is no account to create and no data sent
        to a server operated by this project, because no such server exists.
      </p>
      <div class="hero-actions">
        <a class="btn btn-ghost" href="${PORTFOLIO}">Portfolio →</a>
        <a class="btn btn-ghost" href="https://github.com/YsinHsim">GitHub</a>
        <a class="btn btn-ghost" href="/privacy.html">Privacy policy</a>
      </div>
    </div>
  </div>
</section>`

/* ------------------------------------------------------------ privacy */

const privacyBody = `<header class="page-head">
  <div class="wrap">
    <p class="eyebrow">opencode-google · Google API Services</p>
    <h1>Privacy policy</h1>
    <p class="lede">
      This policy covers <strong>opencode-google</strong>, the local MCP server distributed at
      <a href="https://github.com/YsinHsim/opencode-google" style="color:var(--accent)">github.com/YsinHsim/opencode-google</a>,
      and the other installers in the opencode suite.
    </p>
    <p class="updated" style="margin-top:1.25rem">Last updated: 25 October 2026</p>
  </div>
</header>

<main>
  <div class="wrap">
    <div class="legal" style="padding-block:clamp(1.5rem,4vw,3rem)">

      <h2>The short version</h2>
      <p>
        opencode-google is software you run on your own computer. It is not a hosted service.
        Your Google data goes from your machine to Google's APIs and back. It is never sent to
        a server operated by this project, because no such server exists. There is no account
        to register and no backend that receives your data.
      </p>

      <div class="callout">
        <strong>There is no &ldquo;opencode suite&rdquo; cloud.</strong> The repository, this website, and
        the installer are the only things published. All Google API traffic originates from
        the user's own device and terminates at Google.
      </div>

      <h2>What data is accessed</h2>
      <p>
        When you run <code>auth.py</code>, you grant an OAuth client that you created in your
        own Google Cloud project access to the following scopes. Each one is the narrowest that
        still supports the feature described.
      </p>

      <div class="table-scroll">
        <table>
          <thead>
            <tr><th>Scope</th><th>Data reached</th><th>Why it is needed</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>calendar.events</code></td>
              <td>Event titles, times, attendees, locations, descriptions</td>
              <td>Read your schedule, find free slots, create events, and move or delete an event after you approve a preview</td>
            </tr>
            <tr>
              <td><code>gmail.readonly</code></td>
              <td>Message and thread contents, headers, labels</td>
              <td>Search your mailbox and read a thread you asked about. The server has no ability to send, compose, or modify mail</td>
            </tr>
            <tr>
              <td><code>drive.file</code></td>
              <td>Only files this app created</td>
              <td>Upload generated files and list what the app itself put there. Google restricts this scope to app-created files; the rest of your Drive is not reachable</td>
            </tr>
            <tr>
              <td><code>documents</code></td>
              <td>Docs the app creates or opens</td>
              <td>Create and append to documents in the app folder, and read them back</td>
            </tr>
            <tr>
              <td><code>spreadsheets</code></td>
              <td>Sheets the app creates or opens</td>
              <td>Create spreadsheets, read ranges, append rows</td>
            </tr>
            <tr>
              <td><code>tasks</code></td>
              <td>Task titles, notes, due dates</td>
              <td>List tasks, create tasks, mark them complete</td>
            </tr>
            <tr>
              <td><code>contacts.readonly</code></td>
              <td>Contact names, emails, phone numbers</td>
              <td>Look up a person by name so an event can be addressed correctly. Read-only</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>How data is used</h2>
      <p>
        Google user data is used for exactly one purpose: answering the request you made in
        your own OpenCode session, on your own machine. For example, resolving &ldquo;move the HSSB
        call to Friday 3pm&rdquo; by reading the event you named and writing back the new time.
      </p>
      <p>Google user data is <strong>not</strong> used to:</p>
      <ul>
        <li>Train or improve any machine learning model operated by this project;</li>
        <li>Build a profile, advertise, retarget, or determine credit-worthiness;</li>
        <li>Produce analytics about you or your organisation;</li>
        <li>Provide any feature you did not ask for in that session.</li>
      </ul>

      <h2>How data is stored</h2>
      <p>
        Two credential files are written to your machine, both outside the repository and both
        with file mode <code>0600</code> (owner read/write only):
      </p>
      <ul>
        <li><code>~/.config/opencode/google/client_secret.json</code> — the OAuth client you created;</li>
        <li><code>~/.config/opencode/google/token.json</code> — the refresh token issued after you consent.</li>
      </ul>
      <p>
        Both paths are gitignored. No Google user data is written to disk by this server beyond
        whatever Google's own client libraries cache in the access token. Content you ask it to
        read is held in memory for the duration of the request and is not persisted by the
        server.
      </p>
      <p>
        Files the app creates in Google Drive, Docs or Sheets are stored in your Google account,
        inside a folder named <code>opencode</code>, under your normal Google terms. Delete them
        whenever you like; the app loses access as soon as you move them out of that folder.
      </p>

      <h2>How data is shared</h2>
      <p>
        It is not. The project operates no server that could receive your data. Your machine
        talks directly to Google's API endpoints over TLS.
      </p>
      <p>
        There is one nuance worth stating plainly: the code in your OpenCode session is executed
        by the model provider <strong>you</strong> configured. If an MCP tool result is included
        in the conversation that provider sees, that content reaches that provider under its own
        terms. Choosing your provider, and what you ask the agent to read, is the control you
        hold there. This server does not send anything to a model provider itself.
      </p>

      <h2>Google API Services User Data Policy</h2>
      <p>
        opencode-google's use and transfer of information received from Google APIs adheres to
        the <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API
        Services User Data Policy</a>, including the Limited Use requirements. Specifically:
      </p>
      <ul>
        <li>Data is used only to provide the user-facing feature the user requested.</li>
        <li>Data is not transferred to third parties except as necessary to provide that feature, for security purposes, or to comply with law.</li>
        <li>Data is not used for advertising, and is not sold.</li>
        <li>No human reads your Google data. The project has no access to it; only you do.</li>
        <li>Narrow scopes are requested. Gmail is read-only; the Drive scope is limited to app-created files.</li>
      </ul>

      <h2>Your control</h2>
      <ul>
        <li><strong>Revoke access</strong> at <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>. This takes effect immediately and no reinstallation is needed.</li>
        <li><strong>Delete the token</strong> by removing <code>~/.config/opencode/google/token.json</code>.</li>
        <li><strong>Delete the client</strong> by removing the OAuth client in your own Google Cloud project. You created it; it belongs to you.</li>
        <li><strong>Read the code</strong>. The repository is public; the scope list is in <code>lib/google_clients.py</code> and the full operating rules are in <code>SOP.md</code>.</li>
      </ul>

      <h2>Children</h2>
      <p>
        opencode-google is a developer tool intended for adults. It is not directed at children
        under 13 and does not knowingly process their data.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        Any change to how Google user data is handled will appear on this page with a new
        &ldquo;last updated&rdquo; date, and in the repository's commit history. Because the software runs
        locally, you can always read the exact version you are running.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy or about Google data handling: use the contact form at
        <a href="${PORTFOLIO}">yasinhassim.vercel.app</a>.
        For support, see <a href="/support.html">Support</a>. For the rules of use, see
        <a href="/terms.html">Terms of service</a>. The email address registered with Google
        as the app's support and developer contact is the one on file in the Google Cloud
        project; it is not published here.
      </p>

    </div>
  </div>
</main>`

/* -------------------------------------------------------------- terms */

const termsBody = `<header class="page-head">
  <div class="wrap">
    <p class="eyebrow">opencode suite</p>
    <h1>Terms of service</h1>
    <p class="lede">
      Plain terms for personal software. These cover the opencode-suite installers and the
      opencode-google MCP server.
    </p>
    <p class="updated" style="margin-top:1.25rem">Last updated: 25 October 2026</p>
  </div>
</header>

<main>
  <div class="wrap">
    <div class="legal" style="padding-block:clamp(1.5rem,4vw,3rem)">

      <h2>1. What these terms cover</h2>
      <p>
        These terms govern your use of the software at
        <a href="https://github.com/YsinHsim/opencode-google">github.com/YsinHsim/opencode-google</a>,
        <a href="https://github.com/YsinHsim/opencode-aztra">github.com/YsinHsim/opencode-aztra</a>,
        and the opencode-bootstrap repository, together with this website. &ldquo;The software&rdquo; means
        the installers and the local MCP server.
      </p>
      <p>
        By installing or using the software you accept these terms. If you do not accept them,
        do not install it.
      </p>

      <h2>2. Your own Google Cloud project</h2>
      <p>
        The opencode-google server does not ship with any credentials. You create an OAuth client
        in <strong>your own</strong> Google Cloud project and authorise it with your own account.
        Consequently:
      </p>
      <ul>
        <li>You are the developer of record for that OAuth client, under your own agreement with Google.</li>
        <li>The project operator has no access to your Google account, your credentials, or your data.</li>
        <li>Compliance with Google's API terms is your responsibility when you create the client.</li>
        <li>Any Google Cloud quota, billing or policy consequence lands on your account, not on the project operator.</li>
      </ul>

      <h2>3. Your responsibilities</h2>
      <p>You agree to:</p>
      <ul>
        <li>Keep <code>client_secret.json</code> and <code>token.json</code> private and at mode 0600.</li>
        <li>Never commit credentials to any repository, public or private.</li>
        <li>Review what an AI agent proposes before you approve a destructive action. The preview exists for that reason, not as a formality.</li>
        <li>Comply with any policy that applies to your workplace, including where company data is involved.</li>
        <li>Not use the software to access a Google account you are not authorised to access.</li>
      </ul>

      <h2>4. No warranty</h2>
      <p>
        The software is provided <strong>&ldquo;as is&rdquo;</strong>, without warranty of any kind, express
        or implied, including but not limited to warranties of merchantability, fitness for a
        particular purpose, and non-infringement.
      </p>
      <p>
        Specifically, and without limiting the above: no guarantee is made that the software is
        free of defects, that it will perform a requested Google action correctly, that a
        preview will always reflect the final state, or that Google will not change an API in a
        way that breaks it.
      </p>

      <h2>5. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, the project operator is not liable for any
        indirect, incidental, special, consequential, or punitive damages, or for any loss of
        data, profits, revenue, or goodwill, arising from your use of the software. This includes
        damages arising from a Google action that was executed, from a token that expired, or
        from a credential that was disclosed.
      </p>
      <p>
        Because the software is distributed free of charge, the total aggregate liability of the
        project operator is limited to the amount you paid for it, which is zero.
      </p>

      <h2>6. No support obligation</h2>
      <p>
        Support is provided on a best-effort, voluntary basis through the channels listed on the
        <a href="/support.html">Support page</a>. There is no service level agreement and no
        guarantee of a response time or of a fix.
      </p>

      <h2>7. Availability and changes</h2>
      <p>
        The software may be changed, renamed, deprecated, or have a repository made private at
        any time and without notice. There is no commitment to backward compatibility between
        versions.
      </p>

      <h2>8. Third-party services</h2>
      <p>
        The software interoperates with Google APIs, Aztra, OpenCode, GitHub, and whichever model
        provider you configure. Those services are governed by their own terms, which you accept
        separately. The project operator is not responsible for their availability, pricing, or
        conduct.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        The opencode-google and opencode-aztra repositories are published publicly for you to
        read, run, and adapt for personal use. &ldquo;OpenCode&rdquo; and &ldquo;Google&rdquo; are the property of their
        respective owners. This project is not affiliated with, endorsed by, or sponsored by
        Google LLC or by the OpenCode project.
      </p>

      <h2>10. Termination</h2>
      <p>
        You may stop using the software at any time by removing it and deleting the credential
        files. Revoking the OAuth client at
        <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>
        ends Google-side access immediately.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the laws of Malaysia, without regard to conflict-of-law
        provisions. Nothing here removes a right you have under mandatory consumer law in your
        own jurisdiction.
      </p>

      <h2>12. Contact</h2>
      <p>
        Use the contact form at <a href="${PORTFOLIO}">yasinhassim.vercel.app</a>.
      </p>

    </div>
  </div>
</main>`

/* ------------------------------------------------------------ support */

const supportBody = `<header class="page-head">
  <div class="wrap">
    <p class="eyebrow">Support</p>
    <h1>Something broken?</h1>
    <p class="lede">
      opencode-google and opencode-aztra are supported on a best-effort basis by one person
      in Kota Kinabalu. Most problems have a known cause listed below.
    </p>
  </div>
</header>

<main>
  <div class="wrap">

    <section style="padding-block:clamp(1.5rem,4vw,2.75rem)">
      <div class="classes">
        <div class="class-card r">
          <span class="class-tag">✦ Fastest</span>
          <h3>Portfolio</h3>
          <p>
            <a href="${PORTFOLIO}">yasinhassim.vercel.app</a><br />
            Use the contact form there. Include your OS, the exact error text, and what you ran.
            Usually answered within a few days.
          </p>
        </div>
        <div class="class-card c">
          <span class="class-tag">✦ Public</span>
          <h3>GitHub issue</h3>
          <p>
            <a href="https://github.com/YsinHsim/opencode-google/issues">opencode-google issues</a><br />
            Best for reproducible bugs. Never paste tokens, <code>client_secret.json</code>, or
            email contents into an issue.
          </p>
        </div>
        <div class="class-card x">
          <span class="class-tag">✦ Read first</span>
          <h3>The README</h3>
          <p>
            <a href="https://github.com/YsinHsim/opencode-google#troubleshooting">Troubleshooting table</a><br />
            Covers nearly every install and auth failure with the exact fix.
          </p>
        </div>
      </div>
    </section>

    <section style="padding-block:clamp(1.5rem,4vw,2.75rem)">
      <div>
        <p class="eyebrow">Known causes</p>
        <h2 style="font-size:clamp(1.4rem,3vw,2.1rem)">Before you write in</h2>
        <div class="table-scroll">
          <table>
            <thead>
              <tr><th>Symptom</th><th>Cause</th><th>Fix</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Login fails after sign-in, blank or 403 page</td>
                <td>Your Gmail is not in the consent screen's <strong>Test users</strong> list</td>
                <td>Google Cloud Console → OAuth consent screen → add the account</td>
              </tr>
              <tr>
                <td>Tokens die after exactly 7 days</td>
                <td>The consent screen is still in <strong>Testing</strong></td>
                <td>Publish the app, or re-run <code>python auth.py</code> weekly</td>
              </tr>
              <tr>
                <td><code>Missing OAuth client file</code></td>
                <td><code>client_secret.json</code> not placed</td>
                <td>Move it to <code>~/.config/opencode/google/</code> and <code>chmod 600</code></td>
              </tr>
              <tr>
                <td><code>this does not look like a Desktop app client</code></td>
                <td>A <em>Web application</em> client was created</td>
                <td>Recreate the OAuth client as <strong>Desktop app</strong></td>
              </tr>
              <tr>
                <td><code>redirect_uri_mismatch</code></td>
                <td>Same cause as above</td>
                <td>Recreate as <strong>Desktop app</strong></td>
              </tr>
              <tr>
                <td><code>Not authorized for X</code></td>
                <td>A scope was not ticked at consent</td>
                <td>Delete <code>token.json</code>, re-run <code>auth.py</code>, tick all scopes</td>
              </tr>
              <tr>
                <td><code>Refused: … not inside the app folder</code></td>
                <td>Target points at a normal Drive folder</td>
                <td>Uploads go to <code>opencode/</code> only. Move files afterwards in Drive</td>
              </tr>
              <tr>
                <td>Server missing in OpenCode</td>
                <td>OpenCode not restarted, or config not patched</td>
                <td>Restart OpenCode; check the <code>mcp</code> block for <code>opencode-google</code></td>
              </tr>
              <tr>
                <td><code>invalid_grant</code> after re-auth</td>
                <td>An old token is still present</td>
                <td>Delete <code>token.json</code>, then <code>python auth.py</code></td>
              </tr>
              <tr>
                <td>Publish app blocked, demands Branding fields</td>
                <td>Branding page incomplete</td>
                <td>Fill app name, support email, developer email. Homepage and logo are optional</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="callout" style="margin-top:1.75rem">
        <strong>Never send secrets.</strong> Do not paste <code>token.json</code>,
        <code>client_secret.json</code>, your Aztra key, or the contents of an email thread into
        a support email or a public issue. A refresh token is equivalent to your password for
        the scopes granted. If one leaks, revoke it immediately at
        <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>.
      </div>
    </section>

    <section style="padding-block:clamp(1.5rem,4vw,2.75rem)">
      <div class="split">
        <div>
          <p class="eyebrow">Scope of support</p>
          <h2 style="font-size:clamp(1.4rem,3vw,2.1rem)">What I can help with</h2>
        </div>
        <div>
          <p class="lede">In scope:</p>
          <ul style="color:var(--muted);padding-left:1.05rem;margin-bottom:1.35rem">
            <li>Installer failures on macOS, Linux, or Termux</li>
            <li>OAuth errors in <code>auth.py</code> and <code>setup_check.py</code></li>
            <li>Tool behaviour that contradicts <code>SOP.md</code></li>
            <li>Bugs in the MCP server itself</li>
          </ul>
          <p class="lede">Out of scope:</p>
          <ul style="color:var(--muted);padding-left:1.05rem">
            <li>Your Google Cloud project's billing or quota</li>
            <li>Google's verification and CASA assessment process</li>
            <li>Debugging your own OpenCode configuration or model provider</li>
            <li>Recovering a credential you have lost or leaked</li>
          </ul>
        </div>
      </div>
    </section>

  </div>
</main>`

/* -------------------------------------------------------- data-access */

const dataAccessBody = `<header class="page-head">
  <div class="wrap">
    <p class="eyebrow">Scope justification · opencode-google</p>
    <h1>Data access</h1>
    <p class="lede">
      Every Google scope this app requests, what it reaches, and why the narrower option does
      not work. If you are reading this to evaluate the app, this page plus
      <a href="https://github.com/YsinHsim/opencode-google/blob/main/lib/google_clients.py" style="color:var(--accent)">lib/google_clients.py</a>
      is the complete picture.
    </p>
  </div>
</header>

<main>
  <div class="wrap">
    <div class="legal" style="padding-block:clamp(1.5rem,4vw,3rem)">

      <h2>Architecture in one paragraph</h2>
      <p>
        opencode-google is a stdio MCP server. OpenCode launches it as a child process on the
        user's machine. It holds no listening socket, serves no HTTP endpoint, and contacts
        nothing except Google's own API hosts. There is no backend, no database, and no
        telemetry. The only persistent state is an OAuth refresh token stored locally at
        <code>~/.config/opencode/google/token.json</code> with mode 0600.
      </p>

      <h2>Scopes requested</h2>

      <h3><code>calendar.events</code> — sensitive</h3>
      <p>
        <strong>Use:</strong> read events in a window, compute free slots inside working hours,
        create events, and update or delete an event after a preview is approved.
      </p>
      <p>
        <strong>Why not narrower:</strong> <code>calendar.readonly</code> would cover reads but
        not creating or moving events, which is the primary use. <code>calendar.events</code> is
        already narrower than full <code>calendar</code>, which would add calendar-level settings
        and ACLs the app never touches. Deletes never happen on a first call: the Class C guard
        requires a second call carrying a one-time token bound to the exact payload.
      </p>

      <h3><code>gmail.readonly</code> — restricted</h3>
      <p>
        <strong>Use:</strong> search the mailbox with standard Gmail syntax (for example
        <code>is:unread newer_than:2d</code>) and read a single thread the user named, with
        trimmed plain-text bodies.
      </p>
      <p>
        <strong>Why not narrower:</strong> there is no scope that permits search and thread
        reading without granting read access to mail. <code>gmail.metadata</code> returns headers
        only and cannot answer &ldquo;what did the client ask for&rdquo;, which is the entire purpose.
      </p>
      <p>
        <strong>Why not read-write:</strong> <code>gmail.modify</code> and
        <code>gmail.compose</code> were deliberately not requested. There is no code path in this
        server that can send, reply, label, archive, or draft mail. The tool list has no send
        tool at all — see the Class X section of
        <a href="https://github.com/YsinHsim/opencode-google/blob/main/SOP.md">SOP.md</a>.
      </p>

      <h3><code>drive.file</code> — recommended, non-restricted</h3>
      <p>
        <strong>Use:</strong> upload generated files, and list what the app itself created.
      </p>
      <p>
        <strong>Why this is the narrow one:</strong> <code>drive.file</code> grants access only
        to files this app created or that the user explicitly opened with it. Google enforces
        that boundary. The app cannot see, read, or list the rest of your Drive even if it tried.
        On top of Google's boundary, every path is additionally checked against a single
        <code>opencode</code> folder in code, so a request outside that folder is refused before
        the API call is made.
      </p>

      <h3><code>documents</code> — sensitive</h3>
      <p>
        <strong>Use:</strong> create a Doc inside the app folder, append text to it, and read a
        Doc's plain text back. Used for change requests and generated reports.
      </p>
      <p>
        <strong>Why not narrower:</strong> <code>documents.readonly</code> cannot create the
        document. Creation is the feature.
      </p>

      <h3><code>spreadsheets</code> — sensitive</h3>
      <p>
        <strong>Use:</strong> create a spreadsheet with a header row, read an A1 range, append
        rows, and overwrite a range after an approved preview.
      </p>
      <p>
        <strong>Why not narrower:</strong> <code>spreadsheets.readonly</code> cannot create or
        append. Overwrites are Class C and preview current cell contents before anything is
        written.
      </p>

      <h3><code>tasks</code> — sensitive</h3>
      <p>
        <strong>Use:</strong> list tasks, create a task with a due date, and mark a task
        complete. Completion is trivially reversible and is Class R.
      </p>
      <p>
        <strong>Why not narrower:</strong> <code>tasks.readonly</code> cannot create or complete,
        which removes the entire reason to connect Tasks.
      </p>

      <h3><code>contacts.readonly</code> — sensitive</h3>
      <p>
        <strong>Use:</strong> resolve a person's email address by name so an event's attendee
        list is correct.
      </p>
      <p>
        <strong>Why read-only:</strong> the app never creates or edits contacts. The scope is
        already the narrowest available for lookup.
      </p>

      <h2>Scopes deliberately not requested</h2>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Scope</th><th>Why not</th></tr></thead>
          <tbody>
            <tr><td><code>gmail.modify</code></td><td>The app has no reason to change mail. Read-only is sufficient and safer.</td></tr>
            <tr><td><code>gmail.compose</code></td><td>Draft creation was excluded on purpose so no code path can send as the user.</td></tr>
            <tr><td><code>gmail.send</code></td><td>Never requested. There is no send tool.</td></tr>
            <tr><td><code>drive</code> (full)</td><td><code>drive.file</code> covers every file the app needs and keeps the rest of the Drive invisible.</td></tr>
            <tr><td><code>calendar</code> (full)</td><td>Event access is enough; calendar settings and ACLs are not needed.</td></tr>
            <tr><td><code>contacts</code> (write)</td><td>Contacts are read for lookup only.</td></tr>
            <tr><td>YouTube Data API</td><td>Excluded from the project entirely. <code>search.list</code> costs 100 units against a 10,000/day quota, which is a real per-call limit.</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Where the data goes</h2>
      <p>Three destinations, and no others:</p>
      <ul>
        <li><strong>Google's API endpoints</strong>, over TLS, from the user's own machine.</li>
        <li><strong>The local OpenCode session</strong>, in memory, for the duration of the request.</li>
        <li><strong>Nowhere else.</strong> No analytics, no logging service, no third-party backend.</li>
      </ul>
      <p>
        One honest caveat: tool results are returned into the OpenCode conversation, which is
        processed by whichever model provider the user configured. That is the same channel as
        anything else the user types or reads. Choosing the provider is the user's decision,
        made outside this app.
      </p>

      <h2>Human access</h2>
      <p>
        No human reads your Google data through this project, because the project has no copy
        of it. Nobody operating this app can retrieve your email, calendar, or files. There is
        no admin panel, no support tool, and no log to inspect.
      </p>

      <h2>Retention and deletion</h2>
      <ul>
        <li>The server persists no Google content beyond the refresh token.</li>
        <li>Delete <code>~/.config/opencode/google/token.json</code> to remove the token from disk.</li>
        <li>Revoke at <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a> to end access immediately.</li>
        <li>Files the app created remain in your Drive under a folder named <code>opencode</code>; delete or move them in the Drive UI.</li>
      </ul>

      <div class="callout">
        <strong>Verify it yourself.</strong> The repository is public. <code>lib/google_clients.py</code>
        lists the scopes; <code>server.py</code> lists all 22 tools; <code>lib/confirm.py</code>
        implements the preview-token guard; <code>SOP.md</code> states the rules the code enforces.
        Tests run without network access:
        <code>.venv/bin/python tests/test_confirm_guard.py</code>.
      </div>

      <h2>Limited Use compliance</h2>
      <p>
        opencode-google's use of information received from Google APIs adheres to the
        <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API
        Services User Data Policy</a>, including the Limited Use requirements. See the
        <a href="/privacy.html">privacy policy</a> for the full disclosure.
      </p>

    </div>
  </div>
</main>`

/* ================================================================ WRITE */

const pages = [
  {
    file: 'index.html',
    title: 'opencode suite — your machine, your keys, your rules',
    description:
      'A set of single-purpose installers that give OpenCode memory of your real work: company tickets in Aztra and your Google Calendar, Gmail, Drive, Docs, Sheets and Tasks. Runs locally. No servers, no subscription.',
    path: '/',
    current: 'home',
    body: indexBody,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'opencode suite',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'macOS, Linux, Android (Termux)',
        url: `${SITE}/`,
        description:
          'A set of single-purpose installers that give OpenCode memory of your real work: company tickets in Aztra and your Google Calendar, Gmail, Drive, Docs, Sheets and Tasks. Runs locally. No servers, no subscription.',
        author: { '@id': `${SITE}/#yasin` },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `${SITE}/#yasin`,
        name: 'Yasin Hassim',
        url: 'https://yasinhassim.vercel.app/',
        jobTitle: 'Software developer and system analyst',
        address: { '@type': 'PostalAddress', addressLocality: 'Kota Kinabalu', addressRegion: 'Sabah', addressCountry: 'MY' },
      },
    ],
  },
  {
    file: 'privacy.html',
    title: 'Privacy policy — opencode suite',
    description:
      'How opencode-google accesses, uses, stores and shares Google user data. It runs on your machine. No data reaches a server operated by this project.',
    path: '/privacy.html',
    current: 'privacy',
    body: privacyBody,
  },
  {
    file: 'terms.html',
    title: 'Terms of service — opencode suite',
    description:
      'Terms for using the opencode-suite installers and the opencode-google MCP server. Plain terms for personal software.',
    path: '/terms.html',
    current: 'terms',
    body: termsBody,
  },
  {
    file: 'support.html',
    title: 'Support — opencode suite',
    description:
      'Get help with opencode-google and the opencode suite. Contact routes, known issues, and the fixes that actually work.',
    path: '/support.html',
    current: 'support',
    body: supportBody,
  },
  {
    file: 'data-access.html',
    title: 'Data access — opencode suite',
    description:
      'Every Google scope opencode-google requests, why the narrower option does not work, and where the data goes. Written for scope justification and for anyone reading the code.',
    path: '/data-access.html',
    current: 'data-access',
    body: dataAccessBody,
  },
]

for (const p of pages) {
  writeFileSync(p.file, page(p))
  console.log(`wrote ${p.file}`)
}

/* ---------------------------------------------------------------- seo files */

const today = new Date().toISOString().slice(0, 10)
const sitemapUrls = ['', '/privacy', '/terms', '/support', '/data-access']
  .map((u) => `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join('\n')

writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
console.log('wrote public/robots.txt')

writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`,
)
console.log('wrote public/sitemap.xml')

writeFileSync('public/favicon.svg', favicon)
console.log('wrote public/favicon.svg')
