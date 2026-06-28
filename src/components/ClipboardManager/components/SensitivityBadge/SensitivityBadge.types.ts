import type { SensitivityLevel } from '../../utils/sensitive-data'

export interface SensitivityBadgeProps {
  level: SensitivityLevel
  matchCount: number
}
