import type { CSSProperties } from 'react'

import type { ThemeEditorDraft } from '../ThemeEditor.types'

const SIDEBAR_FALLBACKS: Record<string, string> = {
  sidebar: 'card',
  'sidebar-foreground': 'card-foreground',
  'sidebar-border': 'border',
  'sidebar-accent': 'secondary',
  'sidebar-accent-foreground': 'secondary-foreground',
  'sidebar-muted': 'muted',
  'sidebar-muted-foreground': 'muted-foreground',
}

/**
 * Builds the inline style object that maps every `--color-*` CSS variable
 * to the draft's value, applying sidebar fallbacks.
 */
export function buildPreviewStyle(draft: ThemeEditorDraft): CSSProperties {
  const style: Record<string, string> = {}
  const colors = draft.colors as Record<string, string | undefined>

  for (const [key, fallback] of Object.entries(SIDEBAR_FALLBACKS)) {
    const value = colors[key] ?? colors[fallback]
    if (typeof value === 'string') style[`--color-${key}`] = value
  }
  for (const [key, value] of Object.entries(colors)) {
    if (key in SIDEBAR_FALLBACKS) continue
    // `input` is derived from `primary` in CSS (see src/assets/main.css) as a
    // 90%-background blend. Skip it here so the preview inherits the same subtle,
    // mode-adaptive input border as the app instead of the draft's literal value.
    if (key === 'input') continue
    if (typeof value === 'string') style[`--color-${key}`] = value
  }

  return style as CSSProperties
}
