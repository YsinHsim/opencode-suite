import { defineConfig } from 'vite'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

// Multi-page: every top-level .html becomes an entry so /privacy etc. work
// on Vercel without rewrites.
const pages = Object.fromEntries(
  readdirSync(__dirname)
    .filter((f) => f.endsWith('.html'))
    .map((f) => [f.replace(/\.html$/, ''), resolve(__dirname, f)])
)

export default defineConfig({
  build: {
    rollupOptions: { input: pages },
    target: 'es2020',
  },
})
