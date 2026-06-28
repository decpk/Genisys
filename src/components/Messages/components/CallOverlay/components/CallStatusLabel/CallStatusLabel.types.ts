import type { CallStatus } from '@/components/Messages/Messages.types'

export interface CallStatusLabelProps {
  status: CallStatus
  startedAt: number | null
}
