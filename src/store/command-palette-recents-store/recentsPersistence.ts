import { LazyStore } from '@tauri-apps/plugin-store'

import type { RecentEntry } from '@/components/CommandPalette/CommandPalette.types'

const STORE_FILE = 'command-palette-recents.json'
const STORE_KEY = 'recents'

let store: LazyStore | null = null

function getStore(): LazyStore {
  if (!store) store = new LazyStore(STORE_FILE, { autoSave: 200 })
  return store
}

export async function readRecentsFromDisk(): Promise<RecentEntry[]> {
  try {
    const raw = await getStore().get<RecentEntry[]>(STORE_KEY)
    if (Array.isArray(raw)) return raw.filter((r) => r && typeof r.id === 'string')
  } catch {
    /* ignore — first launch / missing file */
  }
  return []
}

export async function writeRecentsToDisk(entries: RecentEntry[]): Promise<void> {
  try {
    await getStore().set(STORE_KEY, entries)
  } catch {
    /* ignore write failures — recents are best-effort */
  }
}
