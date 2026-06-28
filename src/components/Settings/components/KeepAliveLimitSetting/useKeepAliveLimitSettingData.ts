import { useCallback, useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import type {
  KeepAliveLimitOption,
  UseKeepAliveLimitSettingData,
} from './KeepAliveLimitSetting.types'

/** Sentinel select value representing the numeric `0` (= Unlimited). */
const UNLIMITED_VALUE = 'unlimited'

/** Static option list. Module-level so the reference stays stable across renders. */
const KEEP_ALIVE_LIMIT_OPTIONS: KeepAliveLimitOption[] = [
  { value: '2', label: '2 apps' },
  { value: '3', label: '3 apps' },
  { value: '4', label: '4 apps' },
  { value: '5', label: '5 apps' },
  { value: UNLIMITED_VALUE, label: 'Unlimited' },
]

/**
 * Logic layer for {@link KeepAliveLimitSetting}.
 *
 * Reads the keep-alive LRU cap (`keepAliveLimit`) from the settings store and
 * exposes it as a string-based select value. The store represents "Unlimited"
 * as the number `0`; this hook maps `0 <-> 'unlimited'` so the radix Select
 * (which is string-based) stays in sync with the numeric setting.
 */
export function useKeepAliveLimitSettingData(): UseKeepAliveLimitSettingData {
  const limit = useSettingsStore((s) => s.keepAliveLimit)
  const setKeepAliveLimit = useSettingsStore((s) => s.setKeepAliveLimit)

  const value = useMemo(() => {
    if (limit === 0) return UNLIMITED_VALUE
    return String(limit)
  }, [limit])

  const onChange = useCallback(
    (next: string) => {
      if (next === UNLIMITED_VALUE) {
        setKeepAliveLimit(0)
        return
      }
      setKeepAliveLimit(Number(next))
    },
    [setKeepAliveLimit],
  )

  return { value, options: KEEP_ALIVE_LIMIT_OPTIONS, onChange }
}
