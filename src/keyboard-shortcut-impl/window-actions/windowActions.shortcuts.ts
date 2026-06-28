import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

/**
 * Window-level shortcut definitions live in `GLOBAL_SHORTCUTS` so they appear
 * in the Settings UI's "View" category. This file is kept to mirror the
 * per-feature registration pattern used by other shortcut implementations.
 */
export const WINDOW_ACTIONS_SHORTCUTS: ShortcutDef[] = []
