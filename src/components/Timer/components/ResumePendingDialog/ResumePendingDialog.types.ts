import type { TimerInstance } from '@/store/timer-store/timer-store.types'

export interface ResumePendingDialogProps {
  pending: TimerInstance[]
  onResume: (ids: string[]) => void
  onDismiss: () => void
}
