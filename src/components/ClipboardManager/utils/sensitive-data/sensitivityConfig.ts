import type { SensitivityLevel } from './sensitiveData.types'

export interface SensitivityConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
}

export const SENSITIVITY_CONFIGS: Record<Exclude<SensitivityLevel, 'none'>, SensitivityConfig> = {
  low: {
    label: 'Low Risk',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30',
  },
  medium: {
    label: 'Medium Risk',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
  },
  high: {
    label: 'High Risk',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/30',
  },
  critical: {
    label: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/30',
  },
}
