import type { FontWeight } from '@xterm/xterm'

import type { CodeFontWeight } from '@/store/settings-store'

/**
 * Map the user-facing weight enum (`normal | medium | bold`) to a value
 * accepted by xterm's `fontWeight` option.
 */
export function mapTerminalFontWeight(weight: CodeFontWeight): FontWeight {
  if (weight === 'bold') return 'bold'
  if (weight === 'medium') return 500
  return 'normal'
}
