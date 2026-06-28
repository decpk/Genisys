import type { UsageRangeOption, UsageRangePreset } from '../../UsageSection.types'

export interface RangeSelectorProps {
  value: UsageRangePreset
  options: ReadonlyArray<UsageRangeOption>
  onChange: (value: UsageRangePreset) => void
}
