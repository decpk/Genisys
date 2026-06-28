import { Link2 } from 'lucide-react'

import { useNavigationStore } from '@/store/navigation-store'

import type { LinkedTaskChipProps } from './LinkedTaskChip.types'

export function LinkedTaskChip(props: LinkedTaskChipProps): React.JSX.Element {
  const { taskId, taskName } = props
  const openDailyPlanTask = useNavigationStore((s) => s.openDailyPlanTask)

  const handleClick = (): void => {
    openDailyPlanTask(taskId)
  }

  const label = taskName ?? `Task: ${taskId}`

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
    >
      <Link2 size={10} />
      <span className="truncate max-w-[10rem]">{label}</span>
    </button>
  )
}
