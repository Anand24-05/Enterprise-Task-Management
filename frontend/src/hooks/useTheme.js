// src/hooks/useTheme.js
// Single source of truth for theming.
// applyTheme() sets CSS custom properties on :root AND injects a <style> tag
// so that every accent colour in the app (including Tailwind-compiled classes)
// responds to the chosen theme at runtime.

export const THEMES = [
  {
    id: 'default',
    label: 'Dark Purple',
    description: 'Classic deep purple gradient',
    from: '#667eea',
    to:   '#764ba2',
    bg1:  '#0f0f1a',
    bg2:  '#1a1a2e',
    bg3:  '#16213e',
    accent: '#667eea',
  },
  {
    id: 'ocean',
    label: 'Ocean Blue',
    description: 'Cool oceanic blue tones',
    from: '#0ea5e9',
    to:   '#2563eb',
    bg1:  '#0a0f1a',
    bg2:  '#0f1e2e',
    bg3:  '#0c1a28',
    accent: '#0ea5e9',
  },
  {
    id: 'forest',
    label: 'Forest Green',
    description: 'Lush deep forest greens',
    from: '#10b981',
    to:   '#059669',
    bg1:  '#0a120f',
    bg2:  '#0f1f18',
    bg3:  '#0c1a14',
    accent: '#10b981',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    description: 'Warm amber and orange glow',
    from: '#f59e0b',
    to:   '#ef4444',
    bg1:  '#14100a',
    bg2:  '#1f170d',
    bg3:  '#1a120a',
    accent: '#f59e0b',
  },
  {
    id: 'rose',
    label: 'Rose',
    description: 'Vibrant rose and crimson',
    from: '#f43f5e',
    to:   '#e11d48',
    bg1:  '#140a0f',
    bg2:  '#1f0f18',
    bg3:  '#1a0c14',
    accent: '#f43f5e',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Pure dark monochrome',
    from: '#6b7280',
    to:   '#374151',
    bg1:  '#080808',
    bg2:  '#111111',
    bg3:  '#0d0d0d',
    accent: '#9ca3af',
  },
]

// Hex -> rgba helper (no external lib needed)
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function applyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0]
  const root = document.documentElement

  // 1. Set CSS custom properties
  root.style.setProperty('--theme-from',   theme.from)
  root.style.setProperty('--theme-to',     theme.to)
  root.style.setProperty('--theme-bg1',    theme.bg1)
  root.style.setProperty('--theme-bg2',    theme.bg2)
  root.style.setProperty('--theme-bg3',    theme.bg3)
  root.style.setProperty('--theme-accent', theme.accent)
  root.style.setProperty('--gradient-brand',
    `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`)

  // 2. Update body background directly (fastest repaint)
  document.body.style.background =
    `linear-gradient(135deg, ${theme.bg1} 0%, ${theme.bg2} 50%, ${theme.bg3} 100%)`

  // 3. Inject (or update) a <style> tag that overrides every Tailwind-compiled
  //    class that bakes in the old accent colour.  Using rgba() avoids needing
  //    color-mix browser support.
  const f  = theme.from
  const t2 = theme.to

  const css = `
/* === TaskFlow dynamic theme: ${theme.id} === */

/* gradient-brand utility */
.bg-gradient-brand,
.themed-gradient { background: linear-gradient(135deg, ${f} 0%, ${t2} 100%) !important; }

/* text accent */
.text-primary-500, .themed-text { color: ${f} !important; }
.text-primary-400              { color: ${f}cc !important; }
.hover\\:text-primary-500:hover { color: ${f} !important; }
.hover\\:text-primary-400:hover { color: ${f}cc !important; }

/* border accent */
.border-primary-500, .themed-border { border-color: ${f} !important; }
.border-primary-500\\/20  { border-color: ${hexToRgba(f, 0.20)} !important; }
.border-primary-500\\/30  { border-color: ${hexToRgba(f, 0.30)} !important; }
.border-primary-500\\/40  { border-color: ${hexToRgba(f, 0.40)} !important; }
.hover\\:border-primary-500\\/30:hover { border-color: ${hexToRgba(f, 0.30)} !important; }
.hover\\:border-primary-500\\/40:hover { border-color: ${hexToRgba(f, 0.40)} !important; }

/* background accent */
.bg-primary-500           { background-color: ${f} !important; }
.bg-primary-500\\/10       { background-color: ${hexToRgba(f, 0.10)} !important; }
.bg-primary-500\\/15       { background-color: ${hexToRgba(f, 0.15)} !important; }
.bg-primary-500\\/20       { background-color: ${hexToRgba(f, 0.20)} !important; }
.bg-primary-500\\/30       { background-color: ${hexToRgba(f, 0.30)} !important; }
.hover\\:bg-primary-500\\/20:hover { background-color: ${hexToRgba(f, 0.20)} !important; }
.hover\\:bg-primary-500\\/30:hover { background-color: ${hexToRgba(f, 0.30)} !important; }

/* btn-primary */
.btn-primary {
  background: linear-gradient(135deg, ${f} 0%, ${t2} 100%) !important;
  box-shadow: 0 4px 20px ${hexToRgba(f, 0.25)} !important;
}
.btn-primary:hover {
  box-shadow: 0 6px 28px ${hexToRgba(f, 0.35)} !important;
}

/* sidebar active */
.sidebar-link.active {
  background: ${hexToRgba(f, 0.18)} !important;
  border-color: ${hexToRgba(f, 0.35)} !important;
}

/* input focus */
.input-field:focus {
  border-color: ${f} !important;
  box-shadow: 0 0 0 2px ${hexToRgba(f, 0.30)} !important;
}

/* ring */
.ring-primary-500,
.focus\\:ring-primary-500:focus { --tw-ring-color: ${f} !important; }
.focus\\:border-primary-500:focus { border-color: ${f} !important; }

/* spinner border-top */
.border-primary-500 { border-color: ${f} !important; }

/* task-card hover */
.task-card:hover { border-color: ${hexToRgba(f, 0.35)} !important; }

/* scrollbar thumb */
::-webkit-scrollbar-thumb { background: ${f} !important; }
::-webkit-scrollbar-track { background: ${theme.bg2} !important; }

/* calendar selected day */
.cal-day-selected {
  background: linear-gradient(135deg, ${f} 0%, ${t2} 100%) !important;
  box-shadow: 0 4px 16px ${hexToRgba(f, 0.35)} !important;
}
.cal-day-today { outline-color: ${f} !important; color: ${f} !important; }

/* shadow accent */
.shadow-primary-500\\/25 { --tw-shadow-color: ${hexToRgba(f, 0.25)} !important; }
.shadow-primary-500\\/30 { --tw-shadow-color: ${hexToRgba(f, 0.30)} !important; }

/* SVG gradient stops (dashboard donut) */
#theme-grad-stop-1 { stop-color: ${f} !important; }
#theme-grad-stop-2 { stop-color: ${t2} !important; }
`

  let tag = document.getElementById('taskflow-theme-style')
  if (!tag) {
    tag = document.createElement('style')
    tag.id = 'taskflow-theme-style'
    document.head.appendChild(tag)
  }
  tag.textContent = css

  // 4. Persist
  localStorage.setItem('taskflow-theme', themeId)
  return theme
}

export function getStoredTheme() {
  return localStorage.getItem('taskflow-theme') || 'default'
}
