import type { Theme, ThemeColors } from './themes.types'

const COLOR_KEYS: (keyof ThemeColors)[] = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  // 'input' is intentionally NOT applied. The input border is derived from
  // `primary` in CSS (see src/assets/main.css `--color-input`) as a 90%-background
  // blend, so every theme gets a subtle, mode-adaptive primary-tinted border.
  'ring',
  'success',
  'warning',
  'info'
]

const SIDEBAR_KEYS: { key: keyof ThemeColors; fallback: keyof ThemeColors }[] = [
  { key: 'sidebar', fallback: 'card' },
  { key: 'sidebar-foreground', fallback: 'card-foreground' },
  { key: 'sidebar-border', fallback: 'border' },
  { key: 'sidebar-accent', fallback: 'secondary' },
  { key: 'sidebar-accent-foreground', fallback: 'secondary-foreground' },
  { key: 'sidebar-muted', fallback: 'muted' },
  { key: 'sidebar-muted-foreground', fallback: 'muted-foreground' }
]

/** Apply a theme's colors as CSS custom properties on <html> and toggle the dark class. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement

  for (const key of COLOR_KEYS) {
    root.style.setProperty(`--color-${key}`, theme.colors[key] as string)
  }

  for (const { key, fallback } of SIDEBAR_KEYS) {
    const value = (theme.colors[key] ?? theme.colors[fallback]) as string
    root.style.setProperty(`--color-${key}`, value)
  }

  root.classList.toggle('dark', theme.isDark)

  // Mirror the essentials into localStorage so the pre-React splash screen
  // (index.html + public/splash.js) can match the active theme on the next
  // launch — it runs before React mounts and cannot read the Tauri store.
  try {
    localStorage.setItem(
      'genisys-splash-theme',
      JSON.stringify({
        isDark: theme.isDark,
        background: theme.colors.background,
        foreground: theme.colors.foreground,
        primary: theme.colors.primary
      })
    )
  } catch {
    // localStorage may be unavailable; the splash falls back to its defaults.
  }
}
