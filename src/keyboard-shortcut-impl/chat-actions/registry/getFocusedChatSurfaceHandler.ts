import { chatSurfaceRegistry } from './chatSurfaceRegistry'
import type { ChatNewChatHandler } from './chatSurfaceRegistry.types'

/**
 * Walks the registry and returns the "new chat" handler belonging to the
 * surface whose root container currently contains `document.activeElement`.
 *
 * Returns `null` when:
 *   - There is no active element (document not focused), or
 *   - `document.activeElement` is `document.body` (no real focus), or
 *   - No registered surface contains the active element.
 */
export function getFocusedChatSurfaceHandler(): ChatNewChatHandler | null {
  if (typeof document === 'undefined') return null

  const active = document.activeElement
  if (!active || active === document.body) return null

  for (const entry of chatSurfaceRegistry.values()) {
    const container = entry.containerRef.current
    if (!container) continue
    if (container.contains(active)) {
      return entry.handlerRef.current ?? null
    }
  }

  return null
}
