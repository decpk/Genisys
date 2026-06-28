export interface DPTask {
  id: string
  title: string
  description: string
  status: DPTaskStatus
  priority: DPPriority
  categoryId: string | null
  scheduledDate: string
  scheduledTime: string | null
  durationMinutes: number
  reminderAt: string | null
  sortOrder: number
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DPReview {
  id: string
  title: string
  description: string
  status: DPReviewStatus
  priority: DPPriority
  reviewType: DPReviewType
  link: string
  authorName: string
  authorAvatarUrl: string
  scheduledDate: string
  scheduledTime: string | null
  durationMinutes: number
  reminderAt: string | null
  sortOrder: number
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DPReviewFormData {
  title: string
  description: string
  priority: DPPriority
  reviewType: DPReviewType
  link: string
  authorName: string
  authorAvatarUrl: string
  scheduledDate: string
  scheduledTime: string | null
  durationMinutes: number
  reminderAt: string | null
}

export interface DPMeeting {
  id: string
  title: string
  description: string
  scheduledDate: string
  startTime: string
  endTime: string
  location: string
  meetingLink: string
  reminderAt: string | null
  status: DPMeetingStatus
  meetingType: DPMeetingType
  priority: DPMeetingPriority
  notes: string
  followUp: string
  agenda: string
  outcome: string
  attendees: string
  cancelReason: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface DPDailyEntry {
  id: string
  date: string
  motivationalQuote: string
  statusContent: string
  yesterdayReview: string
  workStartTime: string | null
  workEndTime: string | null
  lunchStartTime: string | null
  lunchEndTime: string | null
  createdAt: string
  updatedAt: string
}

export interface DPDailyStatus {
  date: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface DPWorkHoursFormData {
  workStartTime: string | null
  workEndTime: string | null
  lunchStartTime: string | null
  lunchEndTime: string | null
}

export interface DPCategory {
  id: string
  name: string
  color: string
  icon: string
  sortOrder: number
  createdAt: string
}

export interface DPTemplate {
  id: string
  name: string
  description: string
  templateType: DPTemplateType
  content: string
  isBuiltIn: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface DPTemplateContent {
  tasks: Array<{
    title: string
    priority: DPPriority
    scheduledTime: string | null
    durationMinutes: number
    categoryId: string | null
  }>
  meetings: Array<{
    title: string
    startTime: string
    endTime: string
    location: string
  }>
  statusTemplate: string
}

export type DPTaskStatus = 'todo' | 'in_progress' | 'completed'
export type DPReviewStatus = 'todo' | 'in_progress' | 'completed'
export type DPReviewType = 'code' | 'design' | 'document' | 'pr' | 'general'
export type DPPriority = 'low' | 'medium' | 'high' | 'urgent'
export type DPMeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed' | 'no_show' | 'rescheduled'
export type DPMeetingType = 'general' | 'one_on_one' | 'standup' | 'review' | 'planning' | 'retrospective' | 'interview' | 'client_call' | 'team' | 'workshop'
export type DPMeetingPriority = 'low' | 'medium' | 'high' | 'critical'
export type DPTemplateType = 'student' | 'professional' | 'freelancer' | 'custom'
export type DPViewMode = 'day' | 'week' | 'month'
export type DPDayViewMode = 'sections' | 'timeline'
export type DPStatusFormat = 'plain' | 'markdown' | 'html'
export type DPTaskSortBy = 'manual' | 'priority' | 'time' | 'created' | 'title' | 'status'
export type DPSortDirection = 'asc' | 'desc'

export interface DPTaskFormData {
  title: string
  description: string
  priority: DPPriority
  categoryId: string | null
  scheduledDate: string
  scheduledTime: string | null
  durationMinutes: number
  reminderAt: string | null
}

export interface DPMeetingFormData {
  title: string
  description: string
  scheduledDate: string
  startTime: string
  endTime: string
  location: string
  meetingLink: string
  reminderAt: string | null
  status: DPMeetingStatus
  meetingType: DPMeetingType
  priority: DPMeetingPriority
  notes: string
  followUp: string
  agenda: string
  outcome: string
  attendees: string
  cancelReason: string
}
