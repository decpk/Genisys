import { useTimerStore } from '@/store/timer-store'

import type { UseTimerDataReturn } from './useTimerData.types'

export function useTimerData(): UseTimerDataReturn {
  const isHydrated = useTimerStore((s) => s.isHydrated)
  return { isLoaded: isHydrated }
}
