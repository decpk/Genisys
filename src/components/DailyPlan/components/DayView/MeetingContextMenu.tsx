import { useState } from 'react'
import {
  Pencil,
  Copy,
  ArrowRight,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Signal,
  Tag,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPMeeting, DPMeetingStatus, DPMeetingType, DPMeetingPriority } from '../../DailyPlan.types'
import { generateId } from '../../utils/generateId'
import { buildMoveTargetDates } from '../../utils/buildMoveTargetDates'
import { moveMeetingToDate } from '../../utils/moveMeetingToDate'
import { getToday, getTomorrow } from '../../utils/formatDate'
import { DeleteConfirmationDialog } from '../dialogs/DeleteConfirmationDialog'
import { useDailyPlanConfirmation } from '@/hooks/useDailyPlanConfirmation'

const STATUS_OPTIONS: { value: DPMeetingStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'postponed', label: 'Postponed' },
  { value: 'no_show', label: 'No Show' },
  { value: 'rescheduled', label: 'Rescheduled' },
]

const TYPE_OPTIONS: { value: DPMeetingType; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'one_on_one', label: '1:1' },
  { value: 'standup', label: 'Standup' },
  { value: 'review', label: 'Review' },
  { value: 'planning', label: 'Planning' },
  { value: 'retrospective', label: 'Retrospective' },
  { value: 'interview', label: 'Interview' },
  { value: 'client_call', label: 'Client Call' },
  { value: 'team', label: 'Team' },
  { value: 'workshop', label: 'Workshop' },
]

const PRIORITY_OPTIONS: { value: DPMeetingPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

interface MeetingContextMenuProps {
  meeting: DPMeeting
  children: React.ReactNode
  onEdit: (meeting: DPMeeting) => void
}

export function MeetingContextMenu({ meeting, children, onEdit }: MeetingContextMenuProps): React.JSX.Element {
  const saveMeeting = useDailyPlanStore((s) => s.saveMeeting)
  const removeMeeting = useDailyPlanStore((s) => s.removeMeeting)
  
  const confirmation = useDailyPlanConfirmation()
  const [pendingDelete, setPendingDelete] = useState<{ meetingId: string; date: string } | null>(null)

  const handleDeleteConfirm = async () => {
    if (pendingDelete) {
      removeMeeting(pendingDelete.meetingId, pendingDelete.date)
      setPendingDelete(null)
      confirmation.closeConfirmation()
    }
  }

  const handleDeleteClick = () => {
    setPendingDelete({ meetingId: meeting.id, date: meeting.scheduledDate })
    confirmation.openConfirmation(
      'Delete Meeting',
      'Are you sure you want to delete',
      meeting.title,
      handleDeleteConfirm,
      []
    )
  }

  function handleEdit() {
    onEdit(meeting)
  }

  function handleDuplicate() {
    const now = new Date().toISOString()
    saveMeeting({
      ...meeting,
      id: generateId('mtg'),
      title: `${meeting.title} (copy)`,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    })
  }

  function handleMoveToToday() {
    saveMeeting(moveMeetingToDate(meeting, getToday()))
  }

  function handleMoveToTomorrow() {
    saveMeeting(moveMeetingToDate(meeting, getTomorrow()))
  }

  const moveTargets = buildMoveTargetDates(meeting.scheduledDate)

  function handleSetStatus(status: DPMeetingStatus) {
    saveMeeting({ ...meeting, status, updatedAt: new Date().toISOString() })
  }

  function handleSetType(meetingType: DPMeetingType) {
    saveMeeting({ ...meeting, meetingType, updatedAt: new Date().toISOString() })
  }

  function handleSetPriority(priority: DPMeetingPriority) {
    saveMeeting({ ...meeting, priority, updatedAt: new Date().toISOString() })
  }

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={confirmation.isOpen}
        onConfirm={confirmation.handleConfirm}
        onCancel={confirmation.handleCancel}
        title={confirmation.title}
        description={confirmation.description}
        itemName={confirmation.itemName}
        warnings={confirmation.warnings}
        isLoading={confirmation.isLoading}
      />
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleEdit}>
            <Pencil size={15} />
            Edit
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDuplicate}>
            <Copy size={15} />
            Duplicate
          </ContextMenuItem>

          {!moveTargets.isToday && (
            <ContextMenuItem onClick={handleMoveToToday}>
              <ArrowRight size={15} />
              {`Move to Today \u2014 ${moveTargets.todayLabel}`}
            </ContextMenuItem>
          )}
          {!moveTargets.isTomorrow && (
            <ContextMenuItem onClick={handleMoveToTomorrow}>
              <ArrowRight size={15} />
              {`Move to Tomorrow \u2014 ${moveTargets.tomorrowLabel}`}
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />

          {/* Quick actions */}
          {meeting.status !== "completed" && (
            <ContextMenuItem onClick={() => handleSetStatus("completed")}>
              <CheckCircle2 size={15} className="text-green-500" />
              Mark as Done
            </ContextMenuItem>
          )}
          {meeting.status !== "cancelled" && (
            <ContextMenuItem onClick={() => handleSetStatus("cancelled")}>
              <XCircle size={15} className="text-red-500" />
              Cancel Meeting
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />

          {/* Status submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Clock size={15} />
              Set Status
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="space-y-0.5">
              {STATUS_OPTIONS.map((opt) => (
                <ContextMenuItem
                  key={opt.value}
                  onClick={() => handleSetStatus(opt.value)}
                  className={
                    meeting.status === opt.value
                      ? "bg-primary/8 font-semibold rounded-lg"
                      : ""
                  }
                >
                  {opt.label}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Priority submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Signal size={15} />
              Set Priority
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="space-y-0.5">
              {PRIORITY_OPTIONS.map((opt) => (
                <ContextMenuItem
                  key={opt.value}
                  onClick={() => handleSetPriority(opt.value)}
                  className={
                    meeting.priority === opt.value
                      ? "bg-primary/8 font-semibold rounded-lg"
                      : ""
                  }
                >
                  {opt.label}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Type submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Tag size={15} />
              Set Type
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="space-y-0.5">
              {TYPE_OPTIONS.map((opt) => (
                <ContextMenuItem
                  key={opt.value}
                  onClick={() => handleSetType(opt.value)}
                  className={
                    meeting.meetingType === opt.value
                      ? "bg-primary/8 font-semibold rounded-lg"
                      : ""
                  }
                >
                  {opt.label}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={handleDeleteClick}
            className="text-red-500 [&_svg]:!text-red-500 focus:!bg-red-500/10 focus:!text-red-500"
          >
            <Trash2 size={15} />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}

/* ── MeetingDropdownMenu: 3-dot vertical button that opens dropdown ── */

interface MeetingDropdownMenuProps {
  meeting: DPMeeting
  onEdit: (meeting: DPMeeting) => void
  className?: string
}

export function MeetingDropdownMenu({ meeting, onEdit, className }: MeetingDropdownMenuProps): React.JSX.Element {
  const saveMeeting = useDailyPlanStore((s) => s.saveMeeting)
  const removeMeeting = useDailyPlanStore((s) => s.removeMeeting)
  
  const confirmation = useDailyPlanConfirmation()
  const [pendingDelete, setPendingDelete] = useState<{ meetingId: string; date: string } | null>(null)

  const handleDeleteConfirm = async () => {
    if (pendingDelete) {
      removeMeeting(pendingDelete.meetingId, pendingDelete.date)
      setPendingDelete(null)
      confirmation.closeConfirmation()
    }
  }

  const handleDeleteClick = () => {
    setPendingDelete({ meetingId: meeting.id, date: meeting.scheduledDate })
    confirmation.openConfirmation(
      'Delete Meeting',
      'Are you sure you want to delete',
      meeting.title,
      handleDeleteConfirm,
      []
    )
  }

  function handleEdit() {
    onEdit(meeting)
  }

  function handleDuplicate() {
    const now = new Date().toISOString()
    saveMeeting({
      ...meeting,
      id: generateId('mtg'),
      title: `${meeting.title} (copy)`,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    })
  }

  function handleMoveToToday() {
    saveMeeting(moveMeetingToDate(meeting, getToday()))
  }

  function handleMoveToTomorrow() {
    saveMeeting(moveMeetingToDate(meeting, getTomorrow()))
  }

  const moveTargets = buildMoveTargetDates(meeting.scheduledDate)

  function handleSetStatus(status: DPMeetingStatus) {
    saveMeeting({ ...meeting, status, updatedAt: new Date().toISOString() })
  }

  function handleSetType(meetingType: DPMeetingType) {
    saveMeeting({ ...meeting, meetingType, updatedAt: new Date().toISOString() })
  }

  function handleSetPriority(priority: DPMeetingPriority) {
    saveMeeting({ ...meeting, priority, updatedAt: new Date().toISOString() })
  }

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={confirmation.isOpen}
        onConfirm={confirmation.handleConfirm}
        onCancel={confirmation.handleCancel}
        title={confirmation.title}
        description={confirmation.description}
        itemName={confirmation.itemName}
        warnings={confirmation.warnings}
        isLoading={confirmation.isLoading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={className}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil size={15} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy size={15} />
            Duplicate
          </DropdownMenuItem>

          {!moveTargets.isToday && (
            <DropdownMenuItem onClick={handleMoveToToday}>
              <ArrowRight size={15} />
              {`Move to Today \u2014 ${moveTargets.todayLabel}`}
            </DropdownMenuItem>
          )}
          {!moveTargets.isTomorrow && (
            <DropdownMenuItem onClick={handleMoveToTomorrow}>
              <ArrowRight size={15} />
              {`Move to Tomorrow \u2014 ${moveTargets.tomorrowLabel}`}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {meeting.status !== "completed" && (
            <DropdownMenuItem onClick={() => handleSetStatus("completed")}>
              <CheckCircle2 size={15} className="text-green-500" />
              Mark as Done
            </DropdownMenuItem>
          )}
          {meeting.status !== "cancelled" && (
            <DropdownMenuItem onClick={() => handleSetStatus("cancelled")}>
              <XCircle size={15} className="text-red-500" />
              Cancel Meeting
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Clock size={15} />
              Set Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="space-y-0.5">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleSetStatus(opt.value)}
                  className={
                    meeting.status === opt.value
                      ? "bg-primary/8 font-semibold rounded-lg"
                      : ""
                  }
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Signal size={15} />
              Set Priority
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="space-y-0.5">
              {PRIORITY_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleSetPriority(opt.value)}
                  className={
                    meeting.priority === opt.value
                      ? "bg-primary/8 font-semibold rounded-lg"
                      : ""
                  }
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Tag size={15} />
              Set Type
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="space-y-0.5">
              {TYPE_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleSetType(opt.value)}
                  className={
                    meeting.meetingType === opt.value
                      ? "bg-primary/8 font-semibold rounded-lg"
                      : ""
                  }
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-red-500 [&_svg]:!text-red-500 focus:!bg-red-500/10 focus:!text-red-500"
          >
            <Trash2 size={15} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
