import type { MeetingTypeDistribution } from '../ProductivityAnalytics.types'
import { safeMeetingMinutes } from './safeMeetingMinutes'

const MEETING_TYPE_LABELS: Record<string, string> = {
  general: 'General',
  one_on_one: '1:1',
  standup: 'Standup',
  review: 'Review',
  planning: 'Planning',
  retrospective: 'Retro',
  interview: 'Interview',
  client_call: 'Client',
  team: 'Team',
  workshop: 'Workshop',
}

const MEETING_TYPE_COLORS: Record<string, string> = {
  general: '#6b7280',
  one_on_one: '#8b5cf6',
  standup: '#f59e0b',
  review: '#3b82f6',
  planning: '#10b981',
  retrospective: '#ec4899',
  interview: '#14b8a6',
  client_call: '#f97316',
  team: '#6366f1',
  workshop: '#a855f7',
}

export interface MeetingIntelligence {
  meetingTypeDistribution: MeetingTypeDistribution[]
  meetingCancelRate: number
  avgMeetingDuration: number
  meetingLoadPct: number
}

export function computeMeetingIntelligence(
  allMeetings: Record<string, unknown>[],
  totalWorkMinutesInRange: number,
): MeetingIntelligence {
  if (allMeetings.length === 0) {
    return {
      meetingTypeDistribution: [],
      meetingCancelRate: 0,
      avgMeetingDuration: 0,
      meetingLoadPct: 0,
    }
  }

  // Type distribution
  const typeMap = new Map<string, { count: number; minutes: number }>()
  let cancelledCount = 0
  let activeDurationSum = 0
  let activeCount = 0

  for (const m of allMeetings) {
    const meetingType = ((m as any).meetingType || 'general') as string
    const status = (m as any).status as string
    const mins = safeMeetingMinutes(m)

    // Count cancellations
    if (status === 'cancelled' || status === 'no_show' || status === 'rescheduled') {
      cancelledCount++
    } else {
      activeDurationSum += mins
      activeCount++
    }

    // Type breakdown (include all)
    const entry = typeMap.get(meetingType) || { count: 0, minutes: 0 }
    entry.count++
    entry.minutes += mins
    typeMap.set(meetingType, entry)
  }

  const meetingTypeDistribution: MeetingTypeDistribution[] = []
  for (const [type, stats] of typeMap) {
    meetingTypeDistribution.push({
      type,
      label: MEETING_TYPE_LABELS[type] || type,
      count: stats.count,
      minutes: stats.minutes,
      color: MEETING_TYPE_COLORS[type] || '#6b7280',
    })
  }
  meetingTypeDistribution.sort((a, b) => b.count - a.count)

  const meetingCancelRate = allMeetings.length > 0
    ? Math.round((cancelledCount / allMeetings.length) * 100)
    : 0

  const avgMeetingDuration = activeCount > 0
    ? Math.round(activeDurationSum / activeCount)
    : 0

  const meetingLoadPct = totalWorkMinutesInRange > 0
    ? Math.min(Math.round((activeDurationSum / totalWorkMinutesInRange) * 100), 100)
    : 0

  return {
    meetingTypeDistribution,
    meetingCancelRate,
    avgMeetingDuration,
    meetingLoadPct,
  }
}
