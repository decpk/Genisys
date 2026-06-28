import type { TimerInstance, TimerTag } from '@/store/timer-store/timer-store.types'

export interface UseTimerSidebarDataReturn {
  instances: TimerInstance[]
  tags: TimerTag[]
  primaryId: string | null
  setPrimary: (id: string) => void
  removeInstance: (id: string) => void
  newTimerOpen: boolean
  openNewTimerDialog: () => void
  closeNewTimerDialog: () => void
  setNewTimerOpen: (open: boolean) => void
}
