import { useSyncExternalStore } from 'react'

/**
 * Subscribers receive a no-arg notification — `useSyncExternalStore` re-reads
 * the snapshot via `getSnapshot` whenever a subscriber fires.
 */
const subscribers = new Set<() => void>()
let sharedObserver: MutationObserver | null = null

function readDomIsDark(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

let cachedIsDark: boolean = readDomIsDark()

function ensureObserver(): void {
  if (sharedObserver) return
  if (typeof document === 'undefined') return
  const root = document.documentElement
  sharedObserver = new MutationObserver(() => {
    const next = root.classList.contains('dark')
    if (next === cachedIsDark) return
    cachedIsDark = next
    subscribers.forEach((cb) => cb())
  })
  sharedObserver.observe(root, { attributes: true, attributeFilter: ['class'] })
}

function subscribe(callback: () => void): () => void {
  ensureObserver()
  subscribers.add(callback)
  return () => {
    subscribers.delete(callback)
  }
}

function getSnapshot(): boolean {
  return cachedIsDark
}

function getServerSnapshot(): boolean {
  return false
}

/**
 * Returns the current dark-mode state, refreshed when the <html> .dark class
 * toggles. A single MutationObserver is shared across all consumers so a
 * virtualized list of N highlighted items doesn't spawn N observers.
 */
export function useShikiTheme(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
