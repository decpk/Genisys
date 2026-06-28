import type { ShortcutDef, ShortcutScope, RegistryListener, ShortcutRegistry } from '../KeyboardShortcut.types'

// ── Registry ─────────────────────────────────────────────────────────

export function createShortcutRegistry(): ShortcutRegistry {
  const shortcuts = new Map<string, ShortcutDef>()
  const listeners = new Set<RegistryListener>()
  let cachedAll: ShortcutDef[] = []

  function notify(): void {
    cachedAll = Array.from(shortcuts.values())
    for (const listener of listeners) listener()
  }

  function register(defs: ShortcutDef[]): void {
    for (const def of defs) {
      shortcuts.set(def.id, def)
    }
    notify()
  }

  function unregister(ids: string[]): void {
    for (const id of ids) {
      shortcuts.delete(id)
    }
    notify()
  }

  function getAll(): ShortcutDef[] {
    return cachedAll
  }

  function getByScope(scope: ShortcutScope): ShortcutDef[] {
    return getAll().filter((s) => s.scope === scope)
  }

  function getById(id: string): ShortcutDef | undefined {
    return shortcuts.get(id)
  }

  function subscribe(listener: RegistryListener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  return { register, unregister, getAll, getByScope, getById, subscribe }
}

// ── Singleton ────────────────────────────────────────────────────────

export const shortcutRegistry = createShortcutRegistry()
