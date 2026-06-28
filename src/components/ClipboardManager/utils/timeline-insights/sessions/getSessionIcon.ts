import type { SmartCollectionKey } from '../../smart-collections'

const ICON_MAP: Record<SmartCollectionKey, string> = {
  url: 'Globe',
  code: 'Code',
  color: 'Palette',
  email: 'Mail',
  json: 'Braces',
  shell: 'Terminal',
  filepath: 'FolderOpen',
  phone: 'Phone',
}

const FALLBACK_ICON = 'ClipboardList'

export function getSessionIcon(dominantCategory: SmartCollectionKey | null): string {
  if (!dominantCategory) return FALLBACK_ICON
  return ICON_MAP[dominantCategory] ?? FALLBACK_ICON
}
