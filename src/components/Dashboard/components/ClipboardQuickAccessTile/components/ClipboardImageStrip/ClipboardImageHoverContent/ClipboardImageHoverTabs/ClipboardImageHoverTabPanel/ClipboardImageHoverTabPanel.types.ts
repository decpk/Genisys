import type { ClipboardItem } from '@/store/clipboard-store/clipboard-store.types'

export interface ClipboardImageHoverTabPanelProps {
  text: string | null
  status: ClipboardItem['analysisStatus']
  emptyMessage: string
  pendingMessage: string
}
