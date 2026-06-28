import type { ClipboardSet } from '../clipboard-store.types'

export async function loadStatsAction(set: ClipboardSet): Promise<void> {
  try {
    const stats = await window.api.clipboardStats()
    set({
      stats: {
        total: stats.total,
        textCount: stats.textCount,
        imageCount: stats.imageCount,
        labeledCount: stats.labeledCount ?? 0,
        pinnedCount: stats.pinnedCount ?? 0,
      },
    })
  } catch (e) {
    console.error('[clipboard] loadStats failed:', e)
  }
}
