import { useSyncExternalStore } from 'react'

import type { RepoItem } from '../../ProjectExplorer.types'

type ClipboardMode = 'copy' | 'cut'

interface ClipboardEntry {
  mode: ClipboardMode
  rootPath: string
  item: RepoItem
}

let clipboardEntry: ClipboardEntry | null = null
let listeners = new Set<() => void>()

function emitChange(): void {
  listeners.forEach((listener) => listener())
}

export function setClipboard(entry: ClipboardEntry): void {
  clipboardEntry = entry
  emitChange()
}

export function getClipboard(): ClipboardEntry | null {
  return clipboardEntry
}

export function clearClipboard(): void {
  clipboardEntry = null
  emitChange()
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot(): ClipboardEntry | null {
  return clipboardEntry
}

export function useClipboardState(): ClipboardEntry | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
