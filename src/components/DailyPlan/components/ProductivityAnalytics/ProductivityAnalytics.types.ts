export interface DayStats {
  date: string
  label: string
  totalTasks: number
  completedTasks: number
  completionPct: number
  meetingCount: number
  meetingMinutes: number
}

export interface CategoryBreakdown {
  categoryId: string | null
  name: string
  color: string
  count: number
  completed: number
}

export interface PriorityBreakdown {
  priority: string
  label: string
  total: number
  completed: number
  pct: number
}

export interface TaskFlowInsights {
  statusCounts: { todo: number; in_progress: number; completed: number }
  total: number
  overdueCount: number
  remainingWorkloadMinutes: number
}

export interface CompletionHeatmapCell {
  day: number // 0=Mon, 1=Tue, ..., 6=Sun
  hour: number // 0-23
  count: number
}

export interface MeetingTypeDistribution {
  type: string
  label: string
  count: number
  minutes: number
  color: string
}

export interface FocusTimeTrendPoint {
  date: string
  label: string
  focusMinutes: number
}

export interface WeekdayAnalysis {
  day: number // 0=Mon, 1=Tue, ..., 6=Sun
  label: string // Mon, Tue, Wed, ...
  avgCompletionPct: number
  totalTasks: number
  totalCompleted: number
  dayCount: number // how many occurrences of this weekday in range
}

export interface AnalyticsData {
  // Existing
  days: DayStats[]
  totalTasks: number
  totalCompleted: number
  overallCompletionPct: number
  totalMeetings: number
  totalMeetingMinutes: number
  currentStreak: number
  bestStreak: number
  categoryBreakdown: CategoryBreakdown[]
  isLoading: boolean

  // New — Phase 1: Task Insights
  priorityBreakdown: PriorityBreakdown[]
  completionHeatmap: CompletionHeatmapCell[]
  avgVelocityHours: number
  planningScore: number
  taskFlowInsights: TaskFlowInsights

  // New — Phase 2: Meeting Intelligence
  meetingTypeDistribution: MeetingTypeDistribution[]
  meetingCancelRate: number
  avgMeetingDuration: number
  meetingLoadPct: number

  // New — Phase 3: Trends & Patterns
  focusTimeTrend: FocusTimeTrendPoint[]
  avgFocusMinutes: number
  weekdayAnalysis: WeekdayAnalysis[]
}
