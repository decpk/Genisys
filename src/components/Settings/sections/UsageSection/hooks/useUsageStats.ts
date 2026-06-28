import { useCallback, useEffect, useState } from 'react'

import { loadUsageStats } from '@/lib/usage'
import type { UsageStats } from '@/lib/usage'

import { DEFAULT_USAGE_PRESET } from '../UsageSection.constants'
import type { UsageRangePreset } from '../UsageSection.types'
import { presetToRange } from '../utils/presetToRange'

export interface UseUsageStatsResult {
  stats: UsageStats | null
  isLoading: boolean
  error: string | null
  preset: UsageRangePreset
  setPreset: (preset: UsageRangePreset) => void
  reload: () => void
}

/**
 * Owns range-preset state plus loading/error and fetches usage stats
 * whenever the preset (or a manual reload token) changes. The in-flight
 * request is cancelled on cleanup so rapid preset switching never
 * applies a stale response.
 */
export function useUsageStats(): UseUsageStatsResult {
  const [preset, setPreset] = useState<UsageRangePreset>(DEFAULT_USAGE_PRESET)
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load(): Promise<void> {
      setIsLoading(true)
      setError(null)
      try {
        const result = await loadUsageStats(presetToRange(preset))
        if (!cancelled) setStats(result)
      } catch (err: unknown) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load usage data.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [preset, reloadToken])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  return { stats, isLoading, error, preset, setPreset, reload }
}
