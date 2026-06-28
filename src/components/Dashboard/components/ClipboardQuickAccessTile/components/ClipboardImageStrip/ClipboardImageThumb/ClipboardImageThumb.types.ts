import type { ClipboardItem } from '@/store/clipboard-store/clipboard-store.types'

export interface ClipboardImageThumbProps {
  item: ClipboardItem
  onSelect: (id: string) => void
}

export interface UseClipboardImageThumbDataParams {
  thumbnailPath: string | null
}

export interface UseClipboardImageThumbDataResult {
  triggerRef: React.RefObject<HTMLButtonElement | null>
  dataUrl: string | null
  hasError: boolean
  isHoverOpen: boolean
  onHoverOpenChange: (open: boolean) => void
  popoverWidth: number
  popoverHeight: number
}
