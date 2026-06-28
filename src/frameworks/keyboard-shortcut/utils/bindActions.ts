import type { ShortcutActionMap } from '../KeyboardShortcut.types'

// ── Action map (module-level, ref-like) ──────────────────────────────

const actionMap = new Map<string, () => void>()

export function bindActions(actions: ShortcutActionMap): () => void {
  for (const [id, action] of Object.entries(actions)) {
    actionMap.set(id, action)
  }
  return () => {
    for (const id of Object.keys(actions)) {
      actionMap.delete(id)
    }
  }
}

export function getActionMap(): ReadonlyMap<string, () => void> {
  return actionMap
}

export function runShortcut(id: string): boolean {
  const action = actionMap.get(id)
  if (!action) return false
  action()
  return true
}
