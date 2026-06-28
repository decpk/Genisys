import type { ClipboardItem } from '@/store/clipboard-store/clipboard-store.types'

export type ClipboardImageHoverTabValue = 'description' | 'extracted-text'

export interface ClipboardImageHoverTabsProps {
  item: ClipboardItem
}

export interface UseClipboardImageHoverTabsDataResult {
  activeTab: ClipboardImageHoverTabValue
  onTabChange: (value: string) => void
}
