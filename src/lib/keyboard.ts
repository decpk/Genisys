const IS_MAC = navigator.platform.toUpperCase().includes('MAC')

const KEY_SYMBOLS: Record<string, { mac: string; other: string }> = {
  mod: { mac: '⌘', other: 'Ctrl' },
  ctrl: { mac: '⌃', other: 'Ctrl' },
  alt: { mac: '⌥', other: 'Alt' },
  shift: { mac: '⇧', other: 'Shift' },
  up: { mac: '↑', other: '↑' },
  down: { mac: '↓', other: '↓' },
  left: { mac: '←', other: '←' },
  right: { mac: '→', other: '→' },
  enter: { mac: '↵', other: 'Enter' },
  backspace: { mac: '⌫', other: 'Backspace' },
  delete: { mac: '⌦', other: 'Del' },
  escape: { mac: 'Esc', other: 'Esc' },
  tab: { mac: '⇥', other: 'Tab' },
  space: { mac: '␣', other: 'Space' }
}

/**
 * Resolve a single key token (e.g. "Ctrl", "Alt", "Up") to
 * the platform-appropriate symbol.
 */
function resolveKey(key: string): string {
  const entry = KEY_SYMBOLS[key.toLowerCase()]
  if (entry) return IS_MAC ? entry.mac : entry.other
  return key.length === 1 ? key.toUpperCase() : key
}

/**
 * Parse a shortcut string like "Alt+Up" or "Mod+Shift+F"
 * into an array of resolved, platform-specific key labels.
 */
export function parseShortcut(shortcut: string): string[] {
  return shortcut.split('+').map((k) => resolveKey(k.trim()))
}
