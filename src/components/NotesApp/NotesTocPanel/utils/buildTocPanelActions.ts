import type { TocPanelActions } from '@/right-panels/TocPanel'

export function buildTocPanelActions(scrollToItem: (id: string) => void): TocPanelActions {
  return {
    onNavigate: scrollToItem,
  }
}
