import type { TimerMode } from '@/store/timer-store/timer-store.types'

export interface NewTimerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface NewTimerFormState {
  name: string
  mode: TimerMode
  workSec: number
  shortBreakSec: number
  longBreakSec: number
  themeId: string
  soundProfileId: string
  tagId: string | null
  autoStartBreak: boolean
}
