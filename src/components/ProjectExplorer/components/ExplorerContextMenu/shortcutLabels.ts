import { IS_MAC } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.constants'

const MOD = IS_MAC ? '⌘' : 'Ctrl'
const SHIFT = IS_MAC ? '⇧' : 'Shift+'
const DEL = IS_MAC ? '⌫' : 'Del'

/**
 * Platform-aware keyboard shortcut hint labels shown next to Explorer
 * context-menu actions. Mirrors the bindings handled in
 * `ExplorerKeyboardOperations`.
 */
export const EXPLORER_SHORTCUT_LABELS = {
  cut: `${MOD}X`,
  copy: `${MOD}C`,
  paste: `${MOD}V`,
  duplicate: `${MOD}D`,
  rename: 'F2',
  softDelete: IS_MAC ? `${MOD}${DEL}` : 'Del',
  deletePermanent: IS_MAC ? `${SHIFT}${DEL}` : `${SHIFT}Del`,
  newFile: `${MOD}N`,
  newFolder: `${MOD}${SHIFT}N`,
  properties: `${MOD}I`,
  copyFullPath: `${MOD}${SHIFT}C`
} as const
