import { generateId } from '@/components/DailyPlan/utils/generateId'
import type { DPTask, DPMeeting, DPTemplateContent } from '@/components/DailyPlan/DailyPlan.types'
import { saveTaskAction } from './saveTask'
import { saveMeetingAction } from './saveMeeting'

type Get = () => any
type Set = (partial: any) => void

export async function applyTemplateAction(
  get: Get,
  set: Set,
  templateId: string,
  date: string,
): Promise<{ tasksCreated: number; meetingsCreated: number }> {
  const state = get()
  const template = state.templates.find((t: any) => t.id === templateId)
  if (!template) {
    throw new Error(`Template "${templateId}" not found.`)
  }

  let content: DPTemplateContent
  try {
    content = JSON.parse(template.content) as DPTemplateContent
  } catch {
    throw new Error(`Template "${template.name}" has invalid content.`)
  }

  const now = new Date().toISOString()
  let tasksCreated = 0
  let meetingsCreated = 0

  for (const taskDef of content.tasks || []) {
    const task: DPTask = {
      id: generateId('task'),
      title: taskDef.title,
      description: '',
      status: 'todo',
      priority: taskDef.priority || 'medium',
      categoryId: taskDef.categoryId || null,
      scheduledDate: date,
      scheduledTime: taskDef.scheduledTime || null,
      durationMinutes: taskDef.durationMinutes || 30,
      reminderAt: null,
      sortOrder: Date.now() + tasksCreated,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    }
    await saveTaskAction(get, set, task)
    tasksCreated++
  }

  for (const meetingDef of content.meetings || []) {
    const meeting: DPMeeting = {
      id: generateId('meeting'),
      title: meetingDef.title,
      description: '',
      scheduledDate: date,
      startTime: meetingDef.startTime,
      endTime: meetingDef.endTime,
      location: meetingDef.location || '',
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
      sortOrder: Date.now() + meetingsCreated,
      createdAt: now,
      updatedAt: now,
    }
    await saveMeetingAction(get, set, meeting)
    meetingsCreated++
  }

  return { tasksCreated, meetingsCreated }
}
