import { useTimerStore } from '@/store/timer-store'
import type { TimerInstance } from '@/store/timer-store/timer-store.types'

import { ResumePendingDialog } from './ResumePendingDialog'

export function ResumePendingDialogContainer(): React.JSX.Element | null {
  const pendingIds = useTimerStore((s) => s.pendingResumeIds)
  const instances = useTimerStore((s) => s.instances)
  const resumePending = useTimerStore((s) => s.resumePending)
  const dismiss = useTimerStore((s) => s.dismissPendingResume)

  if (!pendingIds || pendingIds.length === 0) return null

  const idSet = new Set(pendingIds)
  const pending: TimerInstance[] = instances.filter((i) => idSet.has(i.id))
  if (pending.length === 0) return null

  return (
    <ResumePendingDialog pending={pending} onResume={resumePending} onDismiss={dismiss} />
  )
}
