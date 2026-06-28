import { Award, Lock } from 'lucide-react'

import { getMilestoneLabel } from '@/store/timer-store/utils/getMilestoneLabel'

import type { MilestoneBadgeProps } from './MilestoneBadge.types'

const MILESTONE_DESCRIPTIONS: Record<string, string> = {
  'first-session': 'Complete your first focus session',
  '50-sessions': 'Complete 50 focus sessions',
  '100-sessions': 'Complete 100 focus sessions',
  '10h-focus': 'Reach 10 hours of total focus time',
  '7-day-streak': 'Focus for 7 days in a row',
  '30-day-streak': 'Focus for 30 days in a row',
  'daily-goal-met': 'Hit your daily focus goal',
  'weekly-goal-met': 'Hit your weekly focus goal',
}

export function MilestoneBadge(props: MilestoneBadgeProps): React.JSX.Element {
  const { badgeKey, achieved } = props

  const tileClass = achieved
    ? 'group flex items-start gap-2 rounded-lg border border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 px-2.5 py-2'
    : 'group flex items-start gap-2 rounded-lg border border-border/40 bg-background px-2.5 py-2 opacity-70'

  const Icon = achieved ? Award : Lock
  const iconWrap = achieved
    ? 'flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary'
    : 'flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground'

  const description = MILESTONE_DESCRIPTIONS[badgeKey] ?? ''

  return (
    <div className={tileClass} title={description}>
      <div className={iconWrap}>
        <Icon size={13} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium leading-tight truncate">
          {getMilestoneLabel(badgeKey)}
        </div>
        <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
          {description}
        </div>
      </div>
    </div>
  )
}
