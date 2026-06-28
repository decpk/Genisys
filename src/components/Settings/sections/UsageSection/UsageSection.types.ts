import type { UsageStats } from '@/lib/usage'

export type UsageRangePreset = 'today' | 'week' | 'all'

export interface UsageRangeOption {
  value: UsageRangePreset
  label: string
}

/** View-model returned by the orchestrator hook and consumed by the view. */
export interface UsageSectionViewModel {
  stats: UsageStats | null
  isLoading: boolean
  error: string | null
  preset: UsageRangePreset
  setPreset: (preset: UsageRangePreset) => void
  clearing: boolean
  clear: () => void
}
