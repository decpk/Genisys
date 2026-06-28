import { CheckCircle2, ChevronDown, X } from 'lucide-react'
import type { DPTask } from '../../DailyPlan.types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/Tooltip'
import { useYesterdayReviewData } from './useYesterdayReviewData'

interface YesterdayReviewProps {
  completedTasks: DPTask[]
}

export function YesterdayReview(props: YesterdayReviewProps): React.JSX.Element {
  const { completedTasks } = props
  const review = useYesterdayReviewData(completedTasks.length)

  if (!review.visible) return <></>

  const chevronBase = 'size-3.5 text-muted-foreground transition-transform duration-200 shrink-0'
  const chevronClass = review.isExpanded ? cn(chevronBase, 'rotate-180') : chevronBase
  const noun = completedTasks.length !== 1 ? 'tasks' : 'task'

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.08] to-emerald-500/[0.02] overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={review.toggleExpanded}
          className="flex-1 h-auto justify-start text-left gap-2.5 px-1.5 py-1 hover:bg-transparent group"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="size-3.5" />
          </span>
          <span className="flex flex-col items-start min-w-0 flex-1">
            <span className="text-xs font-semibold text-foreground/90 leading-tight">Completed</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{noun} done yesterday</span>
          </span>
          <span className="inline-flex items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold px-1.5 h-4 min-w-4 shrink-0">
            {completedTasks.length}
          </span>
          <ChevronDown className={chevronClass} />
        </Button>
        <Tooltip content="Dismiss for today">
          <Button
            variant="ghost"
            size="icon"
            onClick={review.dismiss}
            className="size-7 rounded-lg text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 shrink-0"
          >
            <X className="size-3.5" />
          </Button>
        </Tooltip>
      </div>

      {review.isExpanded && (
        <div className="px-2 pb-2 pt-0.5 space-y-0.5">
          {completedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-emerald-500/[0.07]"
            >
              <span className="flex size-5 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600/80 dark:text-emerald-400/80 shrink-0">
                <CheckCircle2 className="size-3" />
              </span>
              <span className="flex-1 truncate text-xs text-muted-foreground line-through">{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
