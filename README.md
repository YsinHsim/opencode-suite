# opencode-suite-boom

Public brand site for the opencode suite — a set of single-purpose OpenCode installers
(`opencode-bootstrap`, `opencode-aztra`, `opencode-google`).

Two jobs:

1. **Google OAuth branding.** Satisfies the Home page, Privacy policy and Terms requirements
   for the `opencode-google` OAuth consent screen, so the app can leave *Testing* mode.
2. **Public face for the suite.** Explains what each repo does before `opencode-bootstrap-public`
   ships.

Static site, five pages, no backend, no cookies, no trackers.

## Pages

| Page | URL | Purpose |
|---|---|---|
| Home | `/` | What the suite is, three repo cards, safety model, install commands |
| Privacy | `/privacy.html` | Google user data disclosure, scope table, Limited Use compliance |
| Terms | `/terms.html` | Plain terms, no-warranty, liability limit |
| Support | `/support.html` | Contact routes, known-issues table, scope of support |
| Data access | `/data-access.html` | Per-scope justification, scopes deliberately not requested |

`vercel.json` sets `cleanUrls`, so `/privacy` and `/privacy.html` both resolve.
**Use the `.html` URL in Google Cloud Console** — it is unambiguous and cannot 404.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # -> dist/
npm run preview    # serve dist/ on :4173
```

Requires Node 18+.

## Deploy to Vercel

```bash
npm install -g vercel
vercel             # first run: link the project, preview URL
vercel --prod      # production
```

Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
Vercel detects both from `package.json` and `vite.config.js` — no manual config needed.

Free Hobby tier is sufficient. The site is fully static; there is no function to invoke.

## Wiring it into Google Cloud Console

Order matters: the URLs must be live **before** you paste them into Google, because the
checker fetches them.

### 1. Fill Branding

<https://console.cloud.google.com/auth/branding> → select your project.

| Field | Value |
|---|---|
| App name | `opencode-google` |
| User support email | `yasinhassim43@gmail.com` |
| App logo | optional — leave empty (a logo triggers brand verification) |
| Application home page | `https://<your-project>.vercel.app/` |
| Application privacy policy link | `https://<your-project>.vercel.app/privacy.html` |
| Application terms of service link | `https://<your-project>.vercel.app/terms.html` |
| Authorized domains | leave empty while unverified |
| Developer contact email | `yasinhassim43@gmail.com` |

Leave **Authorized domains** empty. It is only required for brand verification, and an
unverified domain there causes more friction than it solves.

### 2. Save, then publish

Click **Save**. If the Publish button stays disabled, the Branding page still has an empty
required field — app name, support email and developer email are the three that block it.

### 3. Expect this

The home page requirement is that it "accurately represents and identifies your app". The
suite homepage names `opencode-google` explicitly in the repo card and discloses the Google
scopes on `/data-access.html`. If an automated check wants the app name more prominently,
the fix is a dedicated `/opencode-google.html` page — not a rewrite.

## What this does and does not unlock

The site removes the **branding** blocker. It does not remove the **scope** blocker.

| Scope | Class | Verification implication |
|---|---|---|
| `gmail.readonly` | **Restricted** | Annual CASA security assessment (paid third party) |
| `calendar.events`, `documents`, `spreadsheets`, `tasks`, `contacts.readonly` | Sensitive | Scope justification + demo video |
| `drive.file` | Non-restricted | None |

Google's own docs exempt **personal use** — you are the only user, or a few users you know
personally. Under that exemption the unverified-app screen appears once and everything works.

The cost of staying exempt: in *Testing* mode, refresh tokens expire after **7 days**. You
re-run `python auth.py` weekly. Publishing the app while unverified removes user-cap and
testing restrictions but does **not** complete verification; restricted-scope behaviour is
still governed by Google's review status.

Source: <https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification>

## Editing content

All copy is hand-written from the three repos. If a repo changes, update these in step:

| Claim on the site | Source of truth |
|---|---|
| 22 Google tools | `opencode-google/server.py` → `TOOLS` list |
| 7 Google scopes | `opencode-google/lib/google_clients.py` → `SCOPES` |
| Class R / C / X model | `opencode-google/SOP.md` |
| Nine provider models | `opencode-bootstrap/config/opencode.json` |
| Install commands | each repo's `README.md` |

Verified at build time of this site: 22 tools, 7 scopes, 9 models, `0600` key modes.

## Structure

```
index.html          home
privacy.html        Google data disclosure
terms.html          terms
support.html        support + known issues
data-access.html    scope justification
public/style.css    the brand system (all styling, no framework)
public/main.js      scroll reveal, copy button, nav highlight
vite.config.js      builds every top-level .html as its own page
vercel.json         cleanUrls + security headers
```

No design framework. The whole visual system is ~600 lines of CSS custom properties and
layout rules, so the palette in `:root` is the only place to change the look.

## Safety notes

- No secrets exist in this repo and none should ever be added. `.gitignore` blocks
  `.env`, `*.key`, `client_secret*.json` and `token.json` as a second line of defence.
- Never put an OAuth `client_secret` on a public web page. The branding process never asks
  for one — it asks for a URL. If a form ever requests the secret, it is not Google.
- The site loads Google Fonts. That is the only third-party request. If you want zero
  third-party requests, self-host the three families in `public/fonts/` and drop the
  `<link>` tags.

## Verified

- `npm run build` — all 5 pages emit to `dist/`, no errors.
- Every page returns HTTP 200 under `vite preview`.
- HTML tag balance checked with a parser: 0 unclosed tags, 0 mismatched closers.
- All internal links resolve; all images carry `alt` (the site uses no `<img>` at all).
- Scope list cross-checked against `lib/google_clients.py`: exact match.
- Tool count cross-checked against `server.py`: 22.

## Not verified

- Not yet deployed to Vercel.
- Not yet pasted into Google Cloud Console, so the Branding checker has not run.
- No visual browser screenshot was captured during the build (the automation window was not
  visible); layout was validated by markup and CSS review only. **Open `npm run dev` and
  eyeball it on your M1 and on a phone before deploying.**
