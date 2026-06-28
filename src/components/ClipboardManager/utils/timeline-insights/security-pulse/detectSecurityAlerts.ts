import type { ClipboardItem } from '@/store/clipboard-store'
import type { SensitiveDataType } from '../../sensitive-data'
import type { TimelineItemAnalysis } from '../analysis'
import type { SecurityAlert } from './securityPulse.types'

export function detectSecurityAlerts(
  items: ClipboardItem[],
  analysisMap: Map<string, TimelineItemAnalysis>
): SecurityAlert[] {
  const alerts: SecurityAlert[] = []

  for (const item of items) {
    const analysis = analysisMap.get(item.id)
    if (!analysis || analysis.sensitivity.level === 'none') continue

    const matchTypes = [...new Set(analysis.sensitivity.matches.map((m) => m.type))]

    alerts.push({
      itemId: item.id,
      time: item.createdAt,
      level: analysis.sensitivity.level,
      matchTypes: matchTypes as SensitiveDataType[],
      matchCount: analysis.sensitivity.matches.length,
    })
  }

  return alerts
}
