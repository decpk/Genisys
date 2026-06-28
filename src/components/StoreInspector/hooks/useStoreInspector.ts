import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { StoreApi } from 'zustand'

import { STORE_REGISTRY, getStoreData } from '@/store/registry'
import type { StoreRegistryEntry } from '@/store/registry'

export interface UseStoreInspectorReturn {
  stores: readonly StoreRegistryEntry[]
  selectedStore: StoreRegistryEntry | null
  selectStore: (name: string) => void
  state: Record<string, unknown>
  actions: Record<string, (...args: unknown[]) => unknown>
  updateState: (path: string[], value: unknown) => void
  deleteKey: (path: string[]) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

/**
 * RAF-throttled subscription to a single Zustand store.
 * Only the currently selected store is subscribed — zero overhead from other stores.
 */
function useThrottledStoreSnapshot(api: StoreApi<Record<string, unknown>> | null): Record<string, unknown> {
  const snapshotRef = useRef<Record<string, unknown>>(api?.getState() ?? {})
  const listenersRef = useRef(new Set<() => void>())

  const subscribe = useCallback((cb: () => void) => {
    listenersRef.current.add(cb)
    return () => { listenersRef.current.delete(cb) }
  }, [])

  const getSnapshot = useCallback(() => snapshotRef.current, [])

  useEffect(() => {
    if (!api) {
      snapshotRef.current = {}
      for (const cb of listenersRef.current) cb()
      return
    }

    snapshotRef.current = api.getState()
    for (const cb of listenersRef.current) cb()

    let rafId = 0
    let pending = false

    const unsub = api.subscribe(() => {
      if (pending) return
      pending = true
      rafId = requestAnimationFrame(() => {
        pending = false
        snapshotRef.current = api.getState()
        for (const cb of listenersRef.current) cb()
      })
    })

    return () => {
      unsub()
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [api])

  return useSyncExternalStore(subscribe, getSnapshot)
}

export function useStoreInspector(): UseStoreInspectorReturn {
  const [selectedName, setSelectedName] = useState<string>(STORE_REGISTRY[0].name)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedStore = STORE_REGISTRY.find((s) => s.name === selectedName) ?? null
  const api = selectedStore?.api ?? null

  const snapshot = useThrottledStoreSnapshot(api as StoreApi<Record<string, unknown>> | null)
  const { state, actions } = getStoreData({ getState: () => snapshot } as StoreApi<Record<string, unknown>>)

  const updateState = useCallback((path: string[], value: unknown) => {
    if (!api) return
    const current = api.getState() as Record<string, unknown>
    if (path.length === 1) {
      api.setState({ [path[0]]: value })
      return
    }
    // Deep update via shallow clone chain
    const root = { ...current }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = root
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i]
      obj[key] = Array.isArray(obj[key]) ? [...obj[key]] : { ...obj[key] }
      obj = obj[key]
    }
    obj[path[path.length - 1]] = value
    api.setState(root)
  }, [api])

  const deleteKey = useCallback((path: string[]) => {
    if (!api || path.length === 0) return
    const current = api.getState() as Record<string, unknown>
    if (path.length === 1) {
      const next = { ...current }
      delete next[path[0]]
      api.setState(next, true)
      return
    }
    const root = { ...current }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = root
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i]
      obj[key] = Array.isArray(obj[key]) ? [...obj[key]] : { ...obj[key] }
      obj = obj[key]
    }
    if (Array.isArray(obj)) {
      obj.splice(Number(path[path.length - 1]), 1)
    } else {
      delete obj[path[path.length - 1]]
    }
    api.setState(root, true)
  }, [api])

  return {
    stores: STORE_REGISTRY,
    selectedStore,
    selectStore: setSelectedName,
    state,
    actions,
    updateState,
    deleteKey,
    searchQuery,
    setSearchQuery,
  }
}
