import { useSyncExternalStore, useMemo } from 'react'

import type { PanelDef } from './RightPanelTabs.types'

// ── Types ────────────────────────────────────────────────────────

interface PanelRegistryAPI {
  /** Register a panel. Throws if a panel with the same id already exists. */
  register: (panel: PanelDef) => void
  /** Unregister a panel by id. No-op if not found. */
  unregister: (panelId: string) => void
  /** Get current snapshot of registered panels */
  getPanels: () => PanelDef[]
  /** Subscribe to panel list changes */
  subscribe: (cb: () => void) => () => void
}

interface PanelRegistryResult {
  /** The underlying registry API (register, unregister, getPanels, subscribe) */
  registry: PanelRegistryAPI
  /** React hook that returns the reactive list of panels. Re-renders on register/unregister. */
  usePanels: () => PanelDef[]
  /** React hook to get register/unregister functions (stable references) */
  useRegistry: () => Pick<PanelRegistryAPI, 'register' | 'unregister'>
}

// ── Factory ──────────────────────────────────────────────────────

/**
 * Creates a panel registry for dynamic panel registration.
 *
 * ```ts
 * const { registry, usePanels, useRegistry } = createPanelRegistry(initialPanels)
 *
 * // In a plugin:
 * registry.register({ id: 'my-plugin', label: 'Plugin', icon: Plug, component: PluginPanel })
 *
 * // In the host component:
 * const panels = usePanels()
 * <RightPanelTabs panels={panels} />
 * ```
 */
export function createPanelRegistry(initialPanels: PanelDef[] = []): PanelRegistryResult {
  let panels = [...initialPanels]
  const listeners = new Set<() => void>()

  function notify() {
    listeners.forEach((cb) => cb())
  }

  const registry: PanelRegistryAPI = {
    register(panel) {
      if (panels.some((p) => p.id === panel.id)) {
        throw new Error(`Panel with id "${panel.id}" is already registered.`)
      }
      panels = [...panels, panel]
      notify()
    },

    unregister(panelId) {
      const before = panels.length
      panels = panels.filter((p) => p.id !== panelId)
      if (panels.length !== before) notify()
    },

    getPanels() {
      return panels
    },

    subscribe(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
  }

  function usePanels(): PanelDef[] {
    return useSyncExternalStore(registry.subscribe, registry.getPanels)
  }

  function useRegistry(): Pick<PanelRegistryAPI, 'register' | 'unregister'> {
    return useMemo(() => ({ register: registry.register, unregister: registry.unregister }), [])
  }

  return { registry, usePanels, useRegistry }
}
