import { useCallback } from 'react'

import type { AiCacheSettingsProps } from './AiCacheSettings.types'

const TTL_MIN = 0
const POOL_MIN = 1
const POOL_MAX = 50

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  if (value < min) return min
  if (value > max) return max
  return value
}

export function useAiCacheSettingsData(props: AiCacheSettingsProps) {
  const {
    mode,
    cacheTtlMs: rawTtl,
    onCacheTtlChange,
    poolSize: rawPoolSize,
    onPoolSizeChange,
  } = props

  const cacheTtlMs = rawTtl ?? 60000
  const poolSize = rawPoolSize ?? 5

  const setCacheTtlMs = useCallback(
    (next: number) => {
      onCacheTtlChange(clamp(next, TTL_MIN, Number.MAX_SAFE_INTEGER))
    },
    [onCacheTtlChange]
  )

  const setPoolSize = useCallback(
    (next: number) => {
      onPoolSizeChange(clamp(next, POOL_MIN, POOL_MAX))
    },
    [onPoolSizeChange]
  )

  return {
    mode,
    cacheTtlMs,
    setCacheTtlMs,
    poolSize,
    setPoolSize,
    poolMin: POOL_MIN,
    poolMax: POOL_MAX,
    ttlMin: TTL_MIN,
  }
}
