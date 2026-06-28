import { IS_MAC } from '../KeyboardShortcut.constants'

// ── Build shortcut string from KeyboardEvent ─────────────────────────

export function eventToKeyString(event: KeyboardEvent): string | null {
  const key = event.key.toLowerCase()

  // Ignore standalone modifier presses
  if (['meta', 'control', 'alt', 'shift'].includes(key)) return null

  const parts: string[] = []

  if (IS_MAC ? event.metaKey : event.ctrlKey) parts.push('Mod')
  if (event.ctrlKey && IS_MAC) parts.push('Ctrl')
  if (event.altKey) parts.push('Alt')
  if (event.shiftKey) parts.push('Shift')

  // Reverse-map special keys
  const reverseKeyMap: Record<string, string> = {
    arrowup: 'Up',
    arrowdown: 'Down',
    arrowleft: 'Left',
    arrowright: 'Right',
    ' ': 'Space',
    enter: 'Enter',
    escape: 'Escape',
    backspace: 'Backspace',
    delete: 'Delete',
    tab: 'Tab',
  }

  const displayKey = reverseKeyMap[key] ?? key.toUpperCase()
  parts.push(displayKey)

  return parts.join('+')
}
