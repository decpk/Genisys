import type { ClipboardItem } from '@/store/clipboard-store'

export interface ClipboardImagePreviewProps {
  item: ClipboardItem
}

export interface UseClipboardImagePreviewDataResult {
  ref: React.RefObject<HTMLDivElement | null>
  dataUrl: string | null
  error: boolean
  isVisible: boolean
}
