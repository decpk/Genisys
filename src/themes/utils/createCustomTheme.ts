import type { Theme } from '@/themes/themes.types'

/**
 * Clones an existing theme into a fresh custom theme with a slugified id.
 * The base theme remains untouched.
 */
export function createCustomTheme(base: Theme, name: string): Theme {
  const trimmed = name.trim()
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32)
  const safeSlug = slug.length > 0 ? slug : 'theme'
  const suffix = Math.random().toString(36).slice(2, 8)
  const id = `custom-${safeSlug}-${suffix}`

  return {
    id,
    name: trimmed.length > 0 ? trimmed : 'Untitled theme',
    isDark: base.isDark,
    category: base.category,
    isCustom: true,
    colors: { ...base.colors },
  }
}
