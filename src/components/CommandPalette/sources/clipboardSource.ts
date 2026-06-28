import { useClipboardStore } from '@/store/clipboard-store'
import { useNavigationStore } from '@/store/navigation-store'

import { safeRun } from '../utils/safeRun'
import { truncate } from '../utils/truncate'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

export const clipboardSource: PaletteSource = {
  id: 'clipboard',
  kinds: ['clipboard'],
  load: async () => {
    try {
      const state = useClipboardStore.getState() as { loadItems?: (reset?: boolean) => Promise<void> | void }
      await state.loadItems?.(true)
    } catch {
      /* ignore */
    }
  },
  getItems(): PaletteItem[] {
    try {
      const state = useClipboardStore.getState() as {
        items?: Array<{
          id: string
          textContent: string | null
          isPinned: boolean
          imageDescription?: string | null
        }>
      }
      const items = state.items ?? []
      return items
        .filter((item) => item.isPinned)
        .map((item): PaletteItem => {
          const fallback = truncate(item.textContent, 60)
          const title = truncate(item.imageDescription, 60) || fallback || 'Pinned clipboard item'
          return {
            id: `clipboard:${item.id}`,
            kind: 'clipboard',
            title,
            subtitle: 'Pinned clipboard',
            keywords: ['clipboard', 'pinned', 'copy', 'paste', 'snippet', 'history'],
            group: 'navigate',
            action: () =>
              safeRun(() => useNavigationStore.getState().setActiveApp('clipboard')),
          }
        })
    } catch {
      return []
    }
  },
}
