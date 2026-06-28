import { useUsageStats } from './hooks/useUsageStats'
import { useClearUsage } from './hooks/useClearUsage'
import type { UsageSectionViewModel } from './UsageSection.types'

/**
 * Orchestrator hook for the Usage settings section. Composes the focused
 * stats, tracking-toggle, and clear-data hooks into a single view-model.
 */
export function useUsageSectionData(): UsageSectionViewModel {
  const { stats, isLoading, error, preset, setPreset, reload } = useUsageStats()
  const { clearing, clear } = useClearUsage(reload)

  return {
    stats,
    isLoading,
    error,
    preset,
    setPreset,
    clearing,
    clear,
  }
}
