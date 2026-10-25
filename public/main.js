// Shared behaviours: theme, mobile nav, reveal, copy, nav highlight.
// No dependencies. Runs before paint where it matters.

/* ------------------------------------------------------------------
   Theme
   ------------------------------------------------------------------
   Resolution order:
     1. Stored choice in localStorage ('light' | 'dark' | 'system')
     2. OS preference via prefers-color-scheme
   'system' means "clear the override and follow the OS".
   The inline script in each <head> applies the attribute before first
   paint to avoid a flash; this file handles switching afterwards.
------------------------------------------------------------------ */
const THEME_KEY = 'opencode-theme'

// Seed the stored preference from a ?theme= override so the toggle and the
// head script agree. Keeps screenshot/testing overrides usable.
const urlTheme = new URLSearchParams(location.search).get('theme')
if (urlTheme === 'light' || urlTheme === 'dark') localStorage.setItem(THEME_KEY, urlTheme)

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return systemPrefersDark() ? 'dark' : 'light'
}

function applyTheme(theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#16121c' : '#fdf9f6')

  for (const btn of document.querySelectorAll('.theme-toggle')) {
    const next = theme === 'dark' ? 'light' : 'dark'
    btn.setAttribute('aria-label', `Switch to ${next} theme`)
    btn.setAttribute('title', `Switch to ${next} theme`)
  }
}

// Apply on load (the head script already did it, this keeps state in sync).
applyTheme(resolveTheme())

for (const btn of document.querySelectorAll('.theme-toggle')) {
  btn.addEventListener('click', () => {
    const next = resolveTheme() === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_KEY, next)
    applyTheme(next)
  })
}

// Follow the OS live, but only while the user has no explicit choice stored.
const mq = window.matchMedia('(prefers-color-scheme: dark)')
const onSystemChange = () => {
  if (!localStorage.getItem(THEME_KEY)) applyTheme(resolveTheme())
}
if (typeof mq.addEventListener === 'function') {
  mq.addEventListener('change', onSystemChange)
} else if (typeof mq.addListener === 'function') {
  mq.addListener(onSystemChange)
}

/* ------------------------------------------------------------------
   Mobile navigation
------------------------------------------------------------------ */
const navToggle = document.querySelector('.nav-toggle')
const navLinks = document.querySelector('.nav-links')

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open')
    navToggle.setAttribute('aria-expanded', String(open))
  })

  // Close after following an in-page link.
  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      navLinks.classList.remove('open')
      navToggle.setAttribute('aria-expanded', 'false')
    }
  })

  // Close on Escape, and on resize back to desktop.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open')
      navToggle.setAttribute('aria-expanded', 'false')
      navToggle.focus()
    }
  })
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760 && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open')
      navToggle.setAttribute('aria-expanded', 'false')
    }
  })
}

/* ------------------------------------------------------------------
   Reveal on scroll
------------------------------------------------------------------ */
const revealTargets = document.querySelectorAll('[data-reveal]')
if ('IntersectionObserver' in window && revealTargets.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  )
  revealTargets.forEach((t) => io.observe(t))
} else {
  revealTargets.forEach((t) => t.classList.add('in'))
}

/* ------------------------------------------------------------------
   Copy-to-clipboard
------------------------------------------------------------------ */
for (const btn of document.querySelectorAll('[data-copy]')) {
  btn.addEventListener('click', async () => {
    const el = document.querySelector(btn.getAttribute('data-copy'))
    if (!el) return
    const text = el.textContent.trim()
    const original = btn.textContent
    try {
      await navigator.clipboard.writeText(text)
      btn.textContent = 'Copied'
    } catch {
      // Clipboard API needs a secure context; fall back to selecting the text.
      const r = document.createRange()
      r.selectNodeContents(el)
      const s = getSelection()
      s.removeAllRanges()
      s.addRange(r)
      btn.textContent = 'Press ⌘C'
    }
    setTimeout(() => { btn.textContent = original }, 2000)
  })
}

/* ------------------------------------------------------------------
   Nav: mark current page
------------------------------------------------------------------ */
const here = location.pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/'
for (const a of document.querySelectorAll('.nav-links a')) {
  const href = new URL(a.href, location.origin).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/'
  if (href === here) a.setAttribute('aria-current', 'page')
}
