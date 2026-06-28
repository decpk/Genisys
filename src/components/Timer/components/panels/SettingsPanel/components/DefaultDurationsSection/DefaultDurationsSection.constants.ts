import type { DurationRowConfig } from './DefaultDurationsSection.types'

export const DURATION_ROWS: ReadonlyArray<DurationRowConfig> = [
  { key: 'defaultDurationSec', label: 'Work', minSec: 60, maxSec: 7200, stepSec: 60 },
  { key: 'shortBreakDurationSec', label: 'Short break', minSec: 30, maxSec: 1800, stepSec: 30 },
  { key: 'longBreakDurationSec', label: 'Long break', minSec: 60, maxSec: 3600, stepSec: 60 },
]
