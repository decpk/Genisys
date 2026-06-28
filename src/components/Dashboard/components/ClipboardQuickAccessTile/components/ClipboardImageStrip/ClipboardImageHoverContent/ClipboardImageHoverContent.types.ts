import type { ClipboardItem } from '@/store/clipboard-store/clipboard-store.types'

export interface ClipboardImageHoverContentProps {
  item: ClipboardItem
}

export interface UseClipboardImageHoverContentDataParams {
  imagePath: string | null
  thumbnailPath: string | null
}

export interface UseClipboardImageHoverContentDataResult {
  isLoading: boolean
  hasError: boolean
  dataUrl: string | null
}

export interface ImageCapturedAtLabel {
  absolute: string
  relative: string
}

export interface ClipboardImageHoverPreviewProps {
  isLoading: boolean
  hasError: boolean
  dataUrl: string | null
  alt: string
}
