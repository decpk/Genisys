// ── Framework Public API ─────────────────────────────────────────────

export { ShortcutDispatcher } from './ShortcutDispatcher'
export { useShortcutDispatcherData } from './useShortcutDispatcherData'
export { bindActions, getActionMap, runShortcut } from './utils/bindActions'
export { resolveShortcuts } from './utils/resolveShortcuts'
export { shortcutRegistry, createShortcutRegistry } from './utils/createShortcutRegistry'
export { detectConflicts } from './utils/detectConflicts'
export { getConflictsForShortcut } from './utils/getConflictsForShortcut'
export { parseKeyCombo } from './utils/parseKeyCombo'
export { parseKeyChord } from './utils/parseKeyChord'
export { normalizeKeyString } from './utils/normalizeKeyString'
export { normalizeKeyChord } from './utils/normalizeKeyChord'
export { matchesEvent } from './utils/matchesEvent'
export { keyComboToDisplayString } from './utils/keyComboToDisplayString'
export { eventToKeyString } from './utils/eventToKeyString'
export { isInputFocused } from './utils/isInputFocused'
export { dispatchShortcutEvent } from './utils/dispatchShortcutEvent'
export { selectActiveShortcuts } from './utils/selectActiveShortcuts'
export { getShortcutOwnerApp } from './utils/getShortcutOwnerApp'
export { ALL_SHORTCUT_DEFS, GLOBAL_SHORTCUTS } from './KeyboardShortcut.constants'
export { useKeyboardStore } from './keyboard-store'
export { useBindShortcutActions } from './hooks/useBindShortcutActions'
export { useShortcuts } from './hooks/useShortcuts'
export { useShortcutsWithConflicts } from './hooks/useShortcutsWithConflicts'

export type {
  ShortcutScope,
  KeyCombo,
  KeyChord,
  ShortcutDef,
  ShortcutOverride,
  ResolvedShortcut,
  ConflictGroup,
  ShortcutActionMap,
  ShortcutRegistry,
} from './KeyboardShortcut.types'
