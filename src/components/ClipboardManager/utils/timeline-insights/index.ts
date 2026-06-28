export type { TimelineItemAnalysis } from './analysis'
export { analyzeTimelineItem, buildAnalysisMap } from './analysis'

export type { WorkSession } from './sessions'
export { detectSessions, labelSession, getSessionIcon } from './sessions'

export type { DailyDigest, DailyDigestLabel } from './digest'
export { generateDailyDigest, formatDigestSummary } from './digest'

export type { HeatmapCell } from './heatmap'
export { buildHeatmapData, computeHeatmapIntensity } from './heatmap'

export type { CategoryBreakdown, CategoryCount } from './category-breakdown'
export { computeCategoryBreakdown } from './category-breakdown'

export type { SecurityAlert } from './security-pulse'
export { detectSecurityAlerts } from './security-pulse'

export type { RecurringItem } from './recurring'
export { detectRecurringContent } from './recurring'
