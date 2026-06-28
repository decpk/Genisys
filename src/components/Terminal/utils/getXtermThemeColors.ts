/**
 * Read the current theme's CSS color tokens and map them to an xterm.js theme.
 *
 * Values are resolved at call-time from `:root` CSS custom properties, so this
 * automatically reflects whatever theme the user has applied.
 */

interface XtermThemeColors {
  background: string
  foreground: string
  cursor: string
  cursorAccent: string
  selectionBackground: string
}

function readVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export function getXtermThemeColors(): XtermThemeColors {
  const background = readVar('--color-background', '#0c0c10')
  const foreground = readVar('--color-foreground', '#e6e6e6')
  const primary = readVar('--color-primary', '#7dd3fc')
  return {
    background,
    foreground,
    cursor: primary,
    cursorAccent: background,
    // Use primary at low opacity for selection highlight; xterm accepts CSS color strings.
    selectionBackground: `color-mix(in srgb, ${primary} 30%, transparent)`,
  }
}

export type { XtermThemeColors }
