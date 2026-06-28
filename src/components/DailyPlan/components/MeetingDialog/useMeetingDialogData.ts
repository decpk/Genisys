import { useState, useCallback, useEffect } from 'react'
import { format, parse } from 'date-fns'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { generateId } from '../../utils/generateId'
import type { DPMeeting, DPMeetingFormData } from '../../DailyPlan.types'
import type { MeetingDialogProps } from './MeetingDialog.types'

function getDefaultFormData(selectedDate: string): DPMeetingFormData {
  return {
    title: '',
    description: '',
    scheduledDate: selectedDate,
    startTime: '09:00',
    endTime: '09:30',
    location: '',
    meetingLink: '',
    reminderAt: null,
    status: 'scheduled',
    meetingType: 'general',
    priority: 'medium',
    notes: '',
    followUp: '',
    agenda: '',
    outcome: '',
    attendees: '',
    cancelReason: '',
  }
}

export function useMeetingDialogData(props: Pick<MeetingDialogProps, 'open' | 'onOpenChange' | 'editMeeting' | 'defaultOverrides'>) {
  const { open, onOpenChange, editMeeting, defaultOverrides } = props

  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const saveMeeting = useDailyPlanStore((s) => s.saveMeeting)

  const [formData, setFormData] = useState<DPMeetingFormData>(() =>
    getDefaultFormData(selectedDate),
  )

  useEffect(() => {
    if (open && editMeeting) {
      setFormData({
        title: editMeeting.title,
        description: editMeeting.description,
        scheduledDate: editMeeting.scheduledDate,
        startTime: editMeeting.startTime,
        endTime: editMeeting.endTime,
        location: editMeeting.location,
        meetingLink: editMeeting.meetingLink,
        reminderAt: editMeeting.reminderAt,
        status: editMeeting.status,
        meetingType: editMeeting.meetingType,
        priority: editMeeting.priority,
        notes: editMeeting.notes,
        followUp: editMeeting.followUp,
        agenda: editMeeting.agenda,
        outcome: editMeeting.outcome,
        attendees: editMeeting.attendees,
        cancelReason: editMeeting.cancelReason,
      })
    } else if (open) {
      setFormData({ ...getDefaultFormData(selectedDate), ...defaultOverrides })
    }
  }, [open, editMeeting, selectedDate, defaultOverrides])

  const handleFieldChange = useCallback(
    (field: keyof DPMeetingFormData, value: string | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.title.trim()) return
      if (!formData.startTime || !formData.endTime) return

      const now = new Date().toISOString()
      const meeting: DPMeeting = {
        id: editMeeting?.id ?? generateId('mtg'),
        title: formData.title.trim(),
        description: formData.description,
        scheduledDate: formData.scheduledDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        meetingLink: formData.meetingLink,
        reminderAt: formData.reminderAt,
        status: formData.status,
        meetingType: formData.meetingType,
        priority: formData.priority,
        notes: formData.notes,
        followUp: formData.followUp,
        agenda: formData.agenda,
        outcome: formData.outcome,
        attendees: formData.attendees,
        cancelReason: formData.cancelReason,
        sortOrder: editMeeting?.sortOrder ?? 0,
        createdAt: editMeeting?.createdAt ?? now,
        updatedAt: now,
      }

      saveMeeting(meeting)
      onOpenChange(false)
    },
    [formData, editMeeting, saveMeeting, onOpenChange],
  )

  const isEditing = !!editMeeting

  const formatDate = useCallback(
    (dateStr: string) => format(parse(dateStr, 'yyyy-MM-dd', new Date()), 'yyyy-MM-dd'),
    [],
  )

  const parseDate = useCallback(
    (dateStr: string) => parse(dateStr, 'yyyy-MM-dd', new Date()),
    [],
  )

  const parseTime = useCallback(
    (timeStr: string) => parse(timeStr, 'HH:mm', new Date()),
    [],
  )

  const formatTime = useCallback(
    (date: Date) => format(date, 'HH:mm'),
    [],
  )

  return {
    formData,
    isEditing,
    handleFieldChange,
    handleSubmit,
    parseDate,
    formatDate,
    parseTime,
    formatTime,
  }
}
