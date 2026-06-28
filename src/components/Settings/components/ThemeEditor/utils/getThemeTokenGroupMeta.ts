import type { ThemeTokenGroup } from '@/themes/themeTokenCatalog.types'

const META: Record<ThemeTokenGroup, { label: string; description: string }> = {
  surface: {
    label: 'Surfaces & Borders',
    description: 'Base canvas, cards, popovers, and divider colors.',
  },
  text: {
    label: 'Text',
    description: 'Foreground colors layered on top of each surface.',
  },
  interactive: {
    label: 'Interactive',
    description: 'Brand color, focus rings, and primary actions.',
  },
  feedback: {
    label: 'Feedback',
    description: 'Success, warning, info, and destructive states.',
  },
  sidebar: {
    label: 'Sidebar (advanced)',
    description: 'Optional overrides for the sidebar surface. Leave blank to inherit fallbacks.',
  },
}

/** Looks up presentation metadata for a token group. */
export function getThemeTokenGroupMeta(group: ThemeTokenGroup): { label: string; description: string } {
  return META[group]
}
