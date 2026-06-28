import React, { useMemo, useState, useCallback } from 'react'
import { ListTodo, CalendarPlus, CheckSquare, CalendarClock, X, AlertTriangle, FileText, ClipboardList, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { LinkifiedText } from '@/components/LinkifiedText'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPTask, DPMeeting, DPReview } from '../../DailyPlan.types'
import { PRIORITY_CONFIG, TIMELINE_HOURS } from '../../constants'
import { MEETING_TYPE_LABELS } from '../../constants/meetingTypeLabels'
import { formatTime, formatTimeRange } from '../../utils/formatTime'
import { computeTimelineLayout } from '../../utils/computeTimelineLayout'
import type { LayoutEvent } from '../../utils/computeTimelineLayout'
import { isTaskOverdue } from '../../utils/isTaskOverdue'
import { computeCurrentEventIds } from '../../utils/computeCurrentEventIds'
import { isTodayDate } from '../../utils/isTodayDate'
import { useHourlyTimelineData } from './useHourlyTimelineData'
import { useTimelineDragSelect } from './useTimelineDragSelect'
import { useTimelineEventDrag } from './useTimelineEventDrag'
import { WorkHoursBackground } from './WorkHoursBackground'
import type { DragMode } from './useTimelineEventDrag'
import { TaskDescription } from '../TaskDescription'
import { TaskDialog } from '../TaskDialog/TaskDialog'
import { MeetingDialog } from '../MeetingDialog/MeetingDialog'
import { TaskContextMenu } from './TaskContextMenu'
import { MEETING_PRIORITY_CARD_CLASS } from './MeetingSection.styles'
import { MeetingContextMenu } from './MeetingContextMenu'
import { DeleteConfirmationDialog } from '../dialogs/DeleteConfirmationDialog'
import { useDailyPlanConfirmation } from '@/hooks/useDailyPlanConfirmation'
import { TimelineEventHoverCard } from './TimelineEventHoverCard'
import { TaskHoverCard, MeetingHoverCard } from './TimelineHoverCards'

const START_HOUR = 0
const END_HOUR = 23
const HOUR_HEIGHT = 60
const VISIBLE_HOURS = TIMELINE_HOURS.filter((h) => h >= START_HOUR && h <= END_HOUR)
const CONTAINER_HEIGHT = VISIBLE_HOURS.length * HOUR_HEIGHT
const TIME_GUTTER_PX = 72

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}
const RIGHT_PAD_PX = 8
const COL_GAP_PX = 2
/**
 * Block height (px) below which the 2-row "normal" card can't fit its title row
 * without clipping (badge row + title row + vertical padding ≈ 35px). Short
 * meetings/tasks in the 25–39px band render a single-line "compact" card instead
 * so the title stays visible. (Heights are 1px/min, so this ≈ 40 minutes.)
 */
const MIN_NORMAL_CARD_HEIGHT = 40

interface HourlyTimelineProps {
  tasks: DPTask[]
  meetings: DPMeeting[]
  reviews: DPReview[]
}

function getTopOffset(time24: string): number {
  const [hourStr, minuteStr] = time24.split(':')
  const hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr ?? '0', 10)
  return (hour - START_HOUR) * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT
}

const BORDER_COLOR_MAP: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
}

function getEventStyle(event: LayoutEvent): React.CSSProperties {
  const timeStr = event.type === 'task' ? event.task!.scheduledTime! : event.meeting!.startTime
  const topPx = getTopOffset(timeStr)

  let heightPx: number
  if (event.type === 'task') {
    heightPx = Math.max(event.task!.durationMinutes, 24)
  } else {
    heightPx = Math.max(event.endMinutes - event.startMinutes, 24)
  }

  const colWidthPercent = 100 / event.totalColumns
  const leftPercent = event.column * colWidthPercent
  const widthPercent = colWidthPercent

  return {
    position: 'absolute',
    top: topPx,
    height: heightPx,
    left: `calc(${TIME_GUTTER_PX}px + (100% - ${TIME_GUTTER_PX}px - ${RIGHT_PAD_PX}px) * ${leftPercent / 100} + ${COL_GAP_PX}px)`,
    width: `calc((100% - ${TIME_GUTTER_PX}px - ${RIGHT_PAD_PX}px) * ${widthPercent / 100} - ${COL_GAP_PX * 2}px)`,
  }
}

interface TaskBlockProps {
  event: LayoutEvent
  onEdit: (task: DPTask) => void
  onRemove: (task: DPTask) => void
  onDragStart: (event: LayoutEvent, mode: DragMode, e: React.MouseEvent) => void
  isDragTarget: boolean
  didDragRef: React.RefObject<boolean>
  isOverdue: boolean
  isCurrent: boolean
  hasConflict: boolean
  conflictCount: number
}

function TaskBlock(props: TaskBlockProps): React.JSX.Element {
  const { event, onEdit, onRemove, onDragStart, isDragTarget, didDragRef, isOverdue, isCurrent, hasConflict, conflictCount } = props
  const task = event.task!
  const priorityConf = PRIORITY_CONFIG[task.priority]
  const style = getEventStyle(event)
  const height = style.height as number
  const isCompleted = task.status === 'completed'

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    onDragStart(event, 'move', e)
  }

  function handleClick() {
    if (didDragRef.current) return
    onEdit(task)
  }

  return (
    <TaskContextMenu task={task} onEdit={onEdit}>
      <div
        data-timeline-event
        style={{
          ...style,
          opacity: isDragTarget ? 0.3 : isCompleted ? 0.4 : undefined,
        }}
        className={cn(
          "z-10 group rounded-lg",
          isOverdue && "ring-1 ring-red-500/40",
          isCurrent && "ring-2 ring-primary/50 shadow-lg shadow-primary/10",
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Top resize handle */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          onMouseDown={(e) => {
            e.stopPropagation();
            onDragStart(event, "resize-top", e);
          }}
        >
          <div className="w-5 h-0.5 rounded-full bg-foreground/40" />
        </div>

        <div
          className={cn(
            "rounded-lg overflow-hidden cursor-grab h-full",
            "transition-opacity",
            priorityConf.bgColor,
          )}
          style={{
            border: `0.5px solid ${BORDER_COLOR_MAP[task.priority] ?? "#3b82f6"}`,
          }}
          onClick={handleClick}
        >
          <div
            className={cn(
              "h-full overflow-hidden relative",
              height < MIN_NORMAL_CARD_HEIGHT
                ? "px-1.5 flex items-center gap-1"
                : "px-2 pt-1.5 pb-1",
            )}
          >
            <IconButton
              variant="ghost"
              size="xs"
              className="absolute top-0.5 right-0.5 size-4 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-20"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(task);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X size={10} />
            </IconButton>

            {/* Overdue indicator */}
            {isOverdue && height >= MIN_NORMAL_CARD_HEIGHT && (
              <div className="absolute top-0.5 right-5 flex items-center">
                <AlertTriangle className="size-3 text-red-500" />
              </div>
            )}

            {/* Conflict indicator */}
            {hasConflict && height >= MIN_NORMAL_CARD_HEIGHT && (
              <Tooltip content={`Overlaps with ${conflictCount} event${conflictCount > 1 ? 's' : ''}`} side="top">
                <div className="absolute bottom-0.5 right-0.5 flex items-center" onMouseDown={(e) => e.stopPropagation()}>
                  <AlertTriangle className="size-2.5 text-orange-500" />
                </div>
              </Tooltip>
            )}

            {height <= 24 ? (
              /* Tiny card — single compact line */
              <>
                <CheckSquare className="size-2.5 text-emerald-500 shrink-0" />
                <span className="text-[9px] font-normal text-foreground truncate">
                  {task.title}
                </span>
                {task.scheduledTime && (
                  <span className="text-[8px] text-muted-foreground shrink-0 ml-auto">
                    {formatTime(task.scheduledTime)}
                  </span>
                )}
              </>
            ) : height < MIN_NORMAL_CARD_HEIGHT ? (
              /* Compact card — single line keeps the title visible for short tasks */
              <>
                <span className="text-[8px] font-bold uppercase text-emerald-600 bg-emerald-500/20 rounded px-1 py-px leading-none shrink-0">
                  Task
                </span>
                <span className="text-[10px] font-normal text-foreground truncate flex-1 min-w-0">
                  {task.title}
                </span>
                {task.scheduledTime && (
                  <span className="text-[8px] text-muted-foreground shrink-0">
                    {formatTime(task.scheduledTime)}
                  </span>
                )}
              </>
            ) : (
              /* Normal card — multi-row top-aligned */
              <>
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[8px] font-bold uppercase text-emerald-600 bg-emerald-500/20 rounded px-1 py-px leading-none shrink-0">
                    Task
                  </span>
                  {task.scheduledTime && (
                    <span className="text-[9px] text-muted-foreground ml-auto shrink-0">
                      {formatTime(task.scheduledTime)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-normal text-foreground leading-tight flex items-start gap-1">
                  <CheckSquare className="size-2.5 text-emerald-500 shrink-0 mt-px" />
                  <span className={height >= 50 ? "line-clamp-2" : "truncate"}>
                    {task.title}
                  </span>
                </p>
                {height >= 45 && task.scheduledTime && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    {task.durationMinutes}m
                  </p>
                )}
                {height >= 70 && task.description && (
                  <TaskDescription
                    content={task.description}
                    clampLines={2}
                    className="text-[9px] text-muted-foreground/70 mt-1 leading-tight"
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom resize handle */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          onMouseDown={(e) => {
            e.stopPropagation();
            onDragStart(event, "resize-bottom", e);
          }}
        >
          <div className="w-5 h-0.5 rounded-full bg-foreground/40" />
        </div>
      </div>
    </TaskContextMenu>
  );
}

interface MeetingBlockProps {
  event: LayoutEvent
  onEdit: (meeting: DPMeeting) => void
  onRemove: (meeting: DPMeeting) => void
  onDragStart: (event: LayoutEvent, mode: DragMode, e: React.MouseEvent) => void
  isDragTarget: boolean
  didDragRef: React.RefObject<boolean>
  isCurrent: boolean
  hasConflict: boolean
  conflictCount: number
}

function MeetingBlock(props: MeetingBlockProps): React.JSX.Element {
  const { event, onEdit, onRemove, onDragStart, isDragTarget, didDragRef, isCurrent, hasConflict, conflictCount } = props
  const meeting = event.meeting!
  const style = getEventStyle(event)
  const height = style.height as number

  const isCancelled = meeting.status === 'cancelled' || meeting.status === 'no_show'
  const isCompleted = meeting.status === 'completed'
  const hasNotes = meeting.notes.length > 0
  const hasFollowUp = meeting.followUp.length > 0
  const hasAgenda = meeting.agenda.length > 0
  const showTypeBadge = meeting.meetingType !== 'general'

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    onDragStart(event, 'move', e)
  }

  function handleClick() {
    if (didDragRef.current) return
    onEdit(meeting)
  }

  return (
    <MeetingContextMenu meeting={meeting} onEdit={onEdit}>
      <div
        data-timeline-event
        style={{ ...style, opacity: isDragTarget ? 0.3 : undefined }}
        className={cn(
          "z-10 group rounded-lg",
          isCurrent && "ring-2 ring-primary/50 shadow-lg shadow-primary/10",
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Top resize handle */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          onMouseDown={(e) => {
            e.stopPropagation();
            onDragStart(event, "resize-top", e);
          }}
        >
          <div className="w-5 h-0.5 rounded-full bg-foreground/40" />
        </div>

        <div
          className={cn(
            'rounded-lg overflow-hidden cursor-grab h-full transition-opacity border border-dashed',
            MEETING_PRIORITY_CARD_CLASS[meeting.priority],
            isCancelled && 'opacity-40',
            isCompleted && 'opacity-50',
          )}
          onClick={handleClick}
        >
          <div
            className={cn(
              "h-full overflow-hidden relative",
              height < MIN_NORMAL_CARD_HEIGHT
                ? "px-1.5 flex items-center gap-1"
                : "px-2 pt-1.5 pb-1",
            )}
          >
            <IconButton
              variant="ghost"
              size="xs"
              className="absolute top-0.5 right-0.5 size-4 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-20"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(meeting);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X size={10} />
            </IconButton>

            {/* Conflict indicator */}
            {hasConflict && height >= MIN_NORMAL_CARD_HEIGHT && (
              <Tooltip content={`Overlaps with ${conflictCount} event${conflictCount > 1 ? 's' : ''}`} side="top">
                <div className="absolute bottom-0.5 right-0.5 flex items-center" onMouseDown={(e) => e.stopPropagation()}>
                  <AlertTriangle className="size-2.5 text-orange-500" />
                </div>
              </Tooltip>
            )}

            {height <= 24 ? (
              /* Tiny card — single compact line */
              <>
                <CalendarClock className="size-2.5 text-blue-500 shrink-0" />
                <span
                  className={cn(
                    "text-[9px] font-normal text-foreground truncate",
                    isCancelled && "line-through text-muted-foreground",
                  )}
                >
                  {meeting.title}
                </span>
                <span className="text-[8px] text-muted-foreground shrink-0 ml-auto">
                  {formatTime(meeting.startTime)}
                </span>
              </>
            ) : height < MIN_NORMAL_CARD_HEIGHT ? (
              /* Compact card — single line keeps the title visible for short meetings */
              <>
                <span
                  className={cn(
                    "text-[8px] font-bold uppercase rounded px-1 py-px leading-none shrink-0",
                    isCancelled
                      ? "text-red-500 bg-red-500/20"
                      : isCompleted
                        ? "text-green-500 bg-green-500/20"
                        : "text-blue-500 bg-blue-500/20",
                  )}
                >
                  {isCancelled ? "Cancelled" : isCompleted ? "Done" : "Meet"}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-normal text-foreground truncate flex-1 min-w-0",
                    isCancelled && "line-through text-muted-foreground",
                  )}
                >
                  {meeting.title}
                </span>
                <span className="text-[8px] text-muted-foreground shrink-0">
                  {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                </span>
              </>
            ) : (
              /* Normal card — multi-row top-aligned */
              <>
                <div className="flex items-center gap-1 mb-0.5">
                  <span
                    className={cn(
                      "text-[8px] font-bold uppercase rounded px-1 py-px leading-none shrink-0",
                      isCancelled
                        ? "text-red-500 bg-red-500/20"
                        : isCompleted
                          ? "text-green-500 bg-green-500/20"
                          : "text-blue-500 bg-blue-500/20",
                    )}
                  >
                    {isCancelled ? "Cancelled" : isCompleted ? "Done" : "Meet"}
                  </span>
                  {showTypeBadge && (
                    <span className="text-[8px] font-medium text-muted-foreground/70 bg-muted/50 rounded-full px-1.5 py-px leading-none shrink-0">
                      {MEETING_TYPE_LABELS[meeting.meetingType] ?? meeting.meetingType}
                    </span>
                  )}
                  <span className="text-[9px] text-muted-foreground ml-auto shrink-0">
                    {formatTime(meeting.startTime)} -{" "}
                    {formatTime(meeting.endTime)}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-[10px] font-normal text-foreground leading-tight flex items-start gap-1",
                    isCancelled && "line-through text-muted-foreground",
                  )}
                >
                  <CalendarClock className="size-2.5 text-blue-500 shrink-0 mt-px" />
                  <span className={height >= 50 ? "line-clamp-2" : "truncate"}>
                    {meeting.title}
                  </span>
                  {hasNotes && <FileText className="inline size-2.5 text-muted-foreground/50 shrink-0 mt-px" />}
                  {hasFollowUp && <ListTodo className="inline size-2.5 text-muted-foreground/50 shrink-0 mt-px" />}
                  {hasAgenda && <ClipboardList className="inline size-2.5 text-muted-foreground/50 shrink-0 mt-px" />}
                </p>
                {height >= 70 && meeting.location && (
                  <p className="text-[9px] text-muted-foreground/70 mt-1 truncate leading-tight">
                    📍 {meeting.location}
                  </p>
                )}
                {height >= 90 && meeting.description && (
                  <p className="text-[9px] text-muted-foreground/70 mt-0.5 line-clamp-2 leading-tight">
                    <LinkifiedText text={meeting.description} mode="short" />
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom resize handle */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          onMouseDown={(e) => {
            e.stopPropagation();
            onDragStart(event, "resize-bottom", e);
          }}
        >
          <div className="w-5 h-0.5 rounded-full bg-foreground/40" />
        </div>
      </div>
    </MeetingContextMenu>
  );
}

export function HourlyTimeline(props: HourlyTimelineProps): React.JSX.Element {
  const { tasks, meetings, reviews } = props
  const { currentTime, currentLineTop, currentTimeRef } = useHourlyTimelineData()
  const removeTask = useDailyPlanStore((s) => s.removeTask)
  const removeMeeting = useDailyPlanStore((s) => s.removeMeeting)
  const saveTask = useDailyPlanStore((s) => s.saveTask)
  const saveMeeting = useDailyPlanStore((s) => s.saveMeeting)

  const {
    containerRef,
    onContainerMouseDown,
    isDragging,
    selectionStyle,
    selectionRange,
    showPopover,
    setShowPopover,
    popoverAnchorStyle,
    clearSelection,
  } = useTimelineDragSelect()

  const {
    onEventMouseDown,
    dragPreview,
    isDraggingEvent,
    draggedEventId,
    didDragRef,
  } = useTimelineEventDrag({ containerRef, saveTask, saveMeeting })

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [taskOverrides, setTaskOverrides] = useState<{ scheduledTime: string; durationMinutes: number } | undefined>()
  const [meetingOverrides, setMeetingOverrides] = useState<{ startTime: string; endTime: string } | undefined>()
  const [editingTask, setEditingTask] = useState<DPTask | null>(null)
  const [editingMeeting, setEditingMeeting] = useState<DPMeeting | null>(null)

  const handleAddTask = useCallback(() => {
    if (!selectionRange) return
    const startMin = timeToMinutes(selectionRange.startTime)
    const endMin = timeToMinutes(selectionRange.endTime)
    setTaskOverrides({
      scheduledTime: selectionRange.startTime,
      durationMinutes: endMin - startMin,
    })
    setShowPopover(false)
    setTaskDialogOpen(true)
  }, [selectionRange, setShowPopover])

  const handleAddMeeting = useCallback(() => {
    if (!selectionRange) return
    setMeetingOverrides({
      startTime: selectionRange.startTime,
      endTime: selectionRange.endTime,
    })
    setShowPopover(false)
    setMeetingDialogOpen(true)
  }, [selectionRange, setShowPopover])

  const handleEditTask = useCallback((task: DPTask) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }, [])

  const handleEditMeeting = useCallback((meeting: DPMeeting) => {
    setEditingMeeting(meeting)
    setMeetingDialogOpen(true)
  }, [])

  const confirmation = useDailyPlanConfirmation()
  const [pendingTimelineDelete, setPendingTimelineDelete] = useState<
    | { type: 'task'; task: DPTask }
    | { type: 'meeting'; meeting: DPMeeting }
    | null
  >(null)

  const handleTimelineDeleteConfirm = useCallback(async () => {
    if (pendingTimelineDelete?.type === 'task') {
      removeTask(pendingTimelineDelete.task.id, pendingTimelineDelete.task.scheduledDate)
    } else if (pendingTimelineDelete?.type === 'meeting') {
      removeMeeting(pendingTimelineDelete.meeting.id, pendingTimelineDelete.meeting.scheduledDate)
    }
    setPendingTimelineDelete(null)
    confirmation.closeConfirmation()
  }, [pendingTimelineDelete, removeTask, removeMeeting, confirmation])

  const handleRemoveTask = useCallback((task: DPTask) => {
    setPendingTimelineDelete({ type: 'task', task })
    confirmation.openConfirmation(
      'Delete Task',
      'Are you sure you want to delete',
      task.title,
      () => {},
      []
    )
  }, [confirmation])

  const handleRemoveMeeting = useCallback((meeting: DPMeeting) => {
    setPendingTimelineDelete({ type: 'meeting', meeting })
    confirmation.openConfirmation(
      'Delete Meeting',
      'Are you sure you want to delete',
      meeting.title,
      () => {},
      []
    )
  }, [confirmation])

  const handleTaskDialogClose = useCallback(
    (open: boolean) => {
      setTaskDialogOpen(open)
      if (!open) {
        setTaskOverrides(undefined)
        setEditingTask(null)
        clearSelection()
      }
    },
    [clearSelection],
  )

  const handleMeetingDialogClose = useCallback(
    (open: boolean) => {
      setMeetingDialogOpen(open)
      if (!open) {
        setMeetingOverrides(undefined)
        setEditingMeeting(null)
        clearSelection()
      }
    },
    [clearSelection],
  )

  const unscheduledTasks = useMemo(
    () => tasks.filter((t) => !t.scheduledTime && t.status !== 'completed'),
    [tasks],
  )

  const unscheduledReviews = useMemo(
    () => reviews.filter((r) => !r.scheduledTime && r.status !== 'completed'),
    [reviews],
  )

  const unscheduledCount = unscheduledTasks.length + unscheduledReviews.length

  const [isUnscheduledExpanded, setIsUnscheduledExpanded] = useState(false)

  const layoutEvents = useMemo(
    () => computeTimelineLayout(tasks, meetings),
    [tasks, meetings],
  )

  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const isToday = useMemo(() => isTodayDate(selectedDate), [selectedDate])

  const currentEventIds = useMemo(
    () => computeCurrentEventIds(layoutEvents, currentTime, isToday),
    [layoutEvents, currentTime, isToday],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => new Date(), [currentTime])

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={confirmation.isOpen}
        onConfirm={handleTimelineDeleteConfirm}
        onCancel={confirmation.handleCancel}
        title={confirmation.title}
        description={confirmation.description}
        itemName={confirmation.itemName}
        warnings={confirmation.warnings}
        isLoading={confirmation.isLoading}
      />
      <div className="space-y-3">
        {unscheduledCount > 0 && (
          <div className="sticky top-0 z-20 rounded-lg border border-border/40 bg-card p-3 shadow-sm">
            <button
              type="button"
              onClick={() => setIsUnscheduledExpanded((prev) => !prev)}
              aria-expanded={isUnscheduledExpanded}
              className={cn(
                "w-full text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5",
                isUnscheduledExpanded && "mb-2",
              )}
            >
              <ChevronDown
                className={cn(
                  "size-3 shrink-0 transition-transform",
                  !isUnscheduledExpanded && "-rotate-90",
                )}
              />
              <ListTodo className="size-3" />
              Unscheduled
              <span className="text-[10px] font-medium bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 leading-none">
                {unscheduledCount}
              </span>
            </button>
            {isUnscheduledExpanded && (
            <div className="space-y-1">
              {unscheduledTasks.map((task) => {
                const priorityConf = PRIORITY_CONFIG[task.priority];
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "text-xs px-2.5 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-1.5",
                      "border hover:shadow-sm",
                      priorityConf.bgColor,
                    )}
                    style={{
                      borderColor: `${BORDER_COLOR_MAP[task.priority] ?? "#3b82f6"}33`,
                    }}
                    onClick={() => handleEditTask(task)}
                  >
                    <CheckSquare className={cn("size-3 shrink-0", priorityConf.color)} />
                    <span className={cn("font-medium", priorityConf.color)}>
                      {task.title}
                    </span>
                  </div>
                );
              })}
              {unscheduledReviews.map((review) => {
                const priorityConf = PRIORITY_CONFIG[review.priority];
                return (
                  <div
                    key={review.id}
                    className={cn(
                      "text-xs px-2.5 py-2 rounded-md transition-colors flex items-center gap-1.5",
                      "border hover:shadow-sm",
                      review.link ? "cursor-pointer" : "cursor-default",
                      priorityConf.bgColor,
                    )}
                    style={{
                      borderColor: `${BORDER_COLOR_MAP[review.priority] ?? "#3b82f6"}33`,
                    }}
                    onClick={() => {
                      if (review.link) window.open(review.link, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <ClipboardList className={cn("size-3 shrink-0", priorityConf.color)} />
                    <span className={cn("font-medium", priorityConf.color)}>
                      {review.title}
                    </span>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        <div className="bg-card border border-border/40 rounded-lg p-3">
          <Popover
            open={showPopover}
            onOpenChange={(open) => {
              if (!open) clearSelection();
            }}
          >
            <div
              ref={containerRef}
              className="relative"
              style={{
                height: CONTAINER_HEIGHT,
                userSelect: isDragging || isDraggingEvent ? "none" : undefined,
              }}
              onMouseDown={onContainerMouseDown}
            >
              {VISIBLE_HOURS.map((hour) => {
                const top = (hour - START_HOUR) * HOUR_HEIGHT;
                const label = formatTime(`${String(hour).padStart(2, "0")}:00`);
                return (
                  <div
                    key={hour}
                    className="absolute left-0 right-0"
                    style={{ top }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] text-muted-foreground w-16 shrink-0 -mt-1.5 text-right">
                        {label}
                      </span>
                      <div className="flex-1 border-t border-border/30 h-0" />
                    </div>
                    {/* 15-min line */}
                    <div
                      className="absolute left-[72px] right-0"
                      style={{ top: HOUR_HEIGHT * 0.25 }}
                    >
                      <div className="border-t border-dashed border-border/20 h-0" />
                    </div>
                    {/* 30-min line */}
                    <div
                      className="absolute left-[72px] right-0"
                      style={{ top: HOUR_HEIGHT * 0.5 }}
                    >
                      <div className="border-t border-border/20 h-0" />
                    </div>
                    {/* 45-min line */}
                    <div
                      className="absolute left-[72px] right-0"
                      style={{ top: HOUR_HEIGHT * 0.75 }}
                    >
                      <div className="border-t border-dashed border-border/20 h-0" />
                    </div>
                  </div>
                );
              })}

              {/* Work hours subtle background */}
              <WorkHoursBackground
                hourHeight={HOUR_HEIGHT}
                startHour={START_HOUR}
                gutterPx={TIME_GUTTER_PX}
              />

              <div
                ref={currentTimeRef}
                className="absolute left-0 right-0 z-20 flex items-center gap-1"
                style={{ top: currentLineTop }}
              >
                <span className="text-[10px] font-medium text-red-500 w-16 shrink-0 -mt-px text-right bg-card py-0.5">
                  {formatTime(currentTime)}
                </span>
                <div className="size-2 rounded-full bg-red-500 -ml-0.5" />
                <div className="flex-1 h-px bg-red-500" />
              </div>

              {layoutEvents.map((event) => {
                const isDragTarget = draggedEventId === event.id;
                const isCurrent = currentEventIds.has(event.id);
                const hasConflict = event.totalColumns > 1;
                const conflictCount = event.totalColumns - 1;

                if (event.type === "task") {
                  const taskOverdue =
                    isToday && isTaskOverdue(event.task!, now);
                  return (
                    <TimelineEventHoverCard
                      key={event.id}
                      content={<TaskHoverCard task={event.task!} />}
                      disabled={isDraggingEvent}
                    >
                      <TaskBlock
                        event={event}
                        onEdit={handleEditTask}
                        onRemove={handleRemoveTask}
                        onDragStart={onEventMouseDown}
                        isDragTarget={isDragTarget}
                        didDragRef={didDragRef}
                        isOverdue={taskOverdue}
                        isCurrent={isCurrent}
                        hasConflict={hasConflict}
                        conflictCount={conflictCount}
                      />
                    </TimelineEventHoverCard>
                  );
                }
                return (
                  <TimelineEventHoverCard
                    key={event.id}
                    content={<MeetingHoverCard meeting={event.meeting!} />}
                    disabled={isDraggingEvent}
                  >
                    <MeetingBlock
                      event={event}
                      onEdit={handleEditMeeting}
                      onRemove={handleRemoveMeeting}
                      onDragStart={onEventMouseDown}
                      isDragTarget={isDragTarget}
                      didDragRef={didDragRef}
                      isCurrent={isCurrent}
                      hasConflict={hasConflict}
                      conflictCount={conflictCount}
                    />
                  </TimelineEventHoverCard>
                );
              })}

              {/* Drag preview ghost */}
              {dragPreview &&
                (() => {
                  const draggedEvent = layoutEvents.find(
                    (e) => e.id === dragPreview.eventId,
                  );
                  if (!draggedEvent) return null;
                  const previewStyle = getEventStyle(draggedEvent);
                  return (
                    <div
                      className="pointer-events-none z-30"
                      style={{
                        ...previewStyle,
                        top: dragPreview.topPx,
                        height: dragPreview.heightPx,
                        opacity: 0.6,
                      }}
                    >
                      <div className="rounded px-2 h-full border-2 border-dashed border-primary/60 bg-primary/10 flex flex-col justify-center">
                        <p className="text-[10px] font-normal text-foreground truncate">
                          {draggedEvent.type === "task"
                            ? draggedEvent.task!.title
                            : draggedEvent.meeting!.title}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {formatTime(dragPreview.startTime)} -{" "}
                          {formatTime(dragPreview.endTime)}
                        </p>
                      </div>
                    </div>
                  );
                })()}

              {/* Drag selection highlight */}
              {selectionStyle && (
                <div
                  className="bg-primary/15 border border-primary/40 rounded-md"
                  style={selectionStyle}
                />
              )}

              {/* Popover anchor positioned at selection midpoint */}
              <PopoverAnchor asChild>
                <div style={popoverAnchorStyle} />
              </PopoverAnchor>
            </div>

            <PopoverContent
              side="right"
              align="center"
              sideOffset={8}
              className="w-auto p-2"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              {selectionRange && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] text-muted-foreground text-center px-1">
                    {formatTimeRange(
                      selectionRange.startTime,
                      selectionRange.endTime,
                    )}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 h-8 text-xs"
                    onClick={handleAddTask}
                  >
                    <ListTodo className="size-3.5" />
                    Add Task
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 h-8 text-xs"
                    onClick={handleAddMeeting}
                  >
                    <CalendarPlus className="size-3.5" />
                    Add Meeting
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <TaskDialog
          open={taskDialogOpen}
          onOpenChange={handleTaskDialogClose}
          editTask={editingTask}
          defaultOverrides={taskOverrides}
        />
        <MeetingDialog
          open={meetingDialogOpen}
          onOpenChange={handleMeetingDialogClose}
          editMeeting={editingMeeting}
          defaultOverrides={meetingOverrides}
        />
      </div>
    </>
  );
}
