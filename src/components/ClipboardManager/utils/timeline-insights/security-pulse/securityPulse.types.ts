import type { SensitivityLevel, SensitiveDataType } from '../../sensitive-data'

export interface SecurityAlert {
  itemId: string
  time: string
  level: SensitivityLevel
  matchTypes: SensitiveDataType[]
  matchCount: number
}
