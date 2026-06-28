import type { SmartCollectionKey, SmartCollectionCount } from '../../smart-collections'
import type { SensitiveDataType } from '../../sensitive-data'

export interface DailyDigest {
  totalItems: number
  textCount: number
  imageCount: number
  sessionCount: number
  peakHour: number
  peakHourCount: number
  categories: SmartCollectionCount[]
  sensitiveCount: number
  totalBytes: number
  topLabels: DailyDigestLabel[]
  pinnedCount: number
}

export interface DailyDigestLabel {
  name: string
  color: string
  count: number
}
