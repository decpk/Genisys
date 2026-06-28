import { useTimerStore } from '@/store/timer-store'

import { groupSessionsByDate, type SessionGroup } from '../utils/groupSessionsByDate'
import {
  useHistoryPanelFilters,
  type HistoryFiltersHook,
} from './useHistoryPanelFilters'
import {
  useHistoryPanelLoader,
  type HistoryLoaderHook,
} from './useHistoryPanelLoader'

export interface HistoryPanelData
  extends HistoryFiltersHook,
    HistoryLoaderHook {
  groups: SessionGroup[]
  tags: ReturnType<typeof useTimerStore.getState>['tags']
}

export function useHistoryPanelData(): HistoryPanelData {
  const filters = useHistoryPanelFilters()
  const loader = useHistoryPanelLoader(
    filters.filter,
    filters.limit,
    filters.offset,
  )
  const tags = useTimerStore((s) => s.tags)
  const groups = groupSessionsByDate(loader.sessions)

  return { ...filters, ...loader, groups, tags }
}
