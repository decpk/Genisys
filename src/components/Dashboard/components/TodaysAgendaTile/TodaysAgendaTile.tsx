import { memo } from 'react'
import { ArrowUpRight, CalendarCheck, GripVertical } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { EmptyState } from '@/components/ui/empty-state'
import { useNavigationStore } from '@/store/navigation-store'
import { cn } from '@/lib/utils'

import { TileResizeMenu } from '../TileResizeMenu'
import { AgendaTaskRow } from './components/AgendaTaskRow'
import { AgendaMeetingRow } from './components/AgendaMeetingRow'
import { AgendaSectionLabel } from './components/AgendaSectionLabel'
import { AgendaAddTask } from './components/AgendaAddTask'
import { useTodaysAgendaTileData } from './hooks/useTodaysAgendaTileData'
import { MAX_TASKS_VISIBLE } from './TodaysAgendaTile.constants'
import { TODAYS_AGENDA_TILE_STYLES as s } from './TodaysAgendaTile.styles'
import { getAgendaSubtitle } from './utils/getAgendaSubtitle'
import type { TodaysAgendaTileProps } from './TodaysAgendaTile.types'

export const TodaysAgendaTile = memo(function TodaysAgendaTile(
  props: TodaysAgendaTileProps
): React.JSX.Element {
  const { tileWidth, onWidthChange, dragHandleProps } = props
  const { tasksData, meetingsData, actions } = useTodaysAgendaTileData()
  const { tasks, completedCount, totalCount } = tasksData
  const { upcoming, totalToday } = meetingsData

  const visibleTasks = tasks.slice(0, MAX_TASKS_VISIBLE)
  const overflowTaskCount = totalCount - visibleTasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const remainingTasks = totalCount - completedCount

  const isEmpty = totalCount === 0 && upcoming.length === 0
  const subtitle = getAgendaSubtitle({
    upcomingMeetings: upcoming.length,
    remainingTasks,
    completedTasks: completedCount,
    totalTasks: totalCount,
  })
  const tasksCountLabel = totalCount > 0 ? `${completedCount}/${totalCount}` : undefined
  const meetingsCountLabel = totalToday > upcoming.length ? `${totalToday} total` : undefined

  return (
    <div className={s.shell}>
      {/* Action buttons — top-right, shown on hover */}
      <div className={s.actions}>
        <TileResizeMenu tileWidth={tileWidth} onWidthChange={onWidthChange} />
        <IconButton
          tooltip="Drag to reorder"
          tooltipSide="bottom"
          size="xs"
          className="cursor-grab active:cursor-grabbing"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical size={14} />
        </IconButton>
      </div>

      {/* Header — icon chip + title block + progress mini-bar */}
      <div className={s.header}>
        <div className={s.headerRow}>
          <div className={s.iconChip}>
            <CalendarCheck size={14} className={s.iconChipIcon} />
          </div>
          <div className={s.titleBlock}>
            <button
              type="button"
              onClick={() => useNavigationStore.getState().setActiveApp('dailyplan')}
              title="Open Daily Plan"
              className={`group/heading inline-flex items-center gap-1 ${s.title} hover:text-amber-500 transition-colors`}
            >
              <span>Today&apos;s Agenda</span>
              <ArrowUpRight
                size={12}
                className="opacity-60 transition-transform duration-150 group-hover/heading:translate-x-0.5 group-hover/heading:-translate-y-0.5"
              />
            </button>
            <div className={s.subtitle}>{subtitle}</div>
          </div>
          {totalCount > 0 && (
            <div className={s.headerProgress}>
              <div
                className={s.headerProgressTrack}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Tasks completed"
              >
                <div
                  className={cn(
                    s.headerProgressFill,
                    progressPercent >= 100 && s.headerProgressFillComplete,
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className={s.headerProgressCount}>{progressPercent}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isEmpty ? (
        <div className={s.emptyWrap}>
          <EmptyState
            message="Nothing scheduled for today."
            icon={CalendarCheck}
            className="py-6"
          />
        </div>
      ) : (
        <div className={s.content}>
          {upcoming.length > 0 && (
            <section>
              <AgendaSectionLabel
                label="Meetings"
                count={meetingsCountLabel}
                variant="blue"
              />
              <div className="space-y-0.5">
                {upcoming.map(({ meeting, minutesFromNow }) => (
                  <AgendaMeetingRow
                    key={meeting.id}
                    meeting={meeting}
                    minutesFromNow={minutesFromNow}
                  />
                ))}
              </div>
            </section>
          )}

          {visibleTasks.length > 0 && (
            <section>
              <AgendaSectionLabel
                label="Tasks"
                count={tasksCountLabel}
                variant="emerald"
              />
              <div className="space-y-0.5">
                {visibleTasks.map((task) => (
                  <AgendaTaskRow
                    key={task.id}
                    task={task}
                    onToggle={actions.toggleTaskComplete}
                  />
                ))}
              </div>
              {overflowTaskCount > 0 && (
                <div className={s.overflowMore}>+{overflowTaskCount} more</div>
              )}
            </section>
          )}
        </div>
      )
      }

      {/* Quick-add composer — pinned at the bottom, always available. */}
      <AgendaAddTask onAdd={actions.addTask} />
    </div>
  )
})
