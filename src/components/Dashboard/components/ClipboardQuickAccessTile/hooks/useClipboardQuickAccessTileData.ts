import {
  usePinnedClipboardItems,
  type UsePinnedClipboardItemsResult,
} from './usePinnedClipboardItems'
import { useCopyToClipboard, type UseCopyToClipboardResult } from './useCopyToClipboard'

export interface UseClipboardQuickAccessTileDataResult {
  curated: UsePinnedClipboardItemsResult
  actions: UseCopyToClipboardResult
}

/**
 * Orchestrator for the Clipboard Quick Access tile.
 */
export function useClipboardQuickAccessTileData(): UseClipboardQuickAccessTileDataResult {
  const curated = usePinnedClipboardItems()
  const actions = useCopyToClipboard()
  return { curated, actions }
}
