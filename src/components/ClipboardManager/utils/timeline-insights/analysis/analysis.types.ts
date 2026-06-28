import type { SmartCollectionKey } from '../../smart-collections'
import type { SensitivityResult } from '../../sensitive-data'

export interface TimelineItemAnalysis {
  categories: SmartCollectionKey[]
  sensitivity: SensitivityResult
}
