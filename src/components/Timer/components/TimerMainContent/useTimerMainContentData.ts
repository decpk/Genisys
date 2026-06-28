import { useCallback } from 'react'

import { useTimerStore } from '@/store/timer-store'

import type {
  TimerView,
  UseTimerMainContentDataReturn,
} from './TimerMainContent.types'

export function useTimerMainContentData(): UseTimerMainContentDataReturn {
  const instances = useTimerStore((s) => s.instances)
  const primaryId = useTimerStore((s) => s.primaryId)
  const view = useTimerStore((s) => s.settings.lastView)
  const updateSettings = useTimerStore((s) => s.updateSettings)

  const primary = instances.find((i) => i.id === primaryId) ?? instances[0] ?? null
  const setView = useCallback(
    (next: TimerView) => updateSettings({ lastView: next }),
    [updateSettings],
  )

  return { primary, primaryId, instances, view, setView }
}
