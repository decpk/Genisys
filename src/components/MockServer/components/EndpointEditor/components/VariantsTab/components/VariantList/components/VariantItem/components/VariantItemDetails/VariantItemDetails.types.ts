import type { VariantMode } from '@/components/MockServer/MockServer.types'

export interface VariantItemDetailsProps {
  mode: VariantMode
  body: string
  onBodyChange: (value: string) => void
  weight: number
  onWeightChange: (value: number) => void
  onWeightBlur: () => void
  matchRules: string
  onMatchRulesChange: (rules: string) => void
}
