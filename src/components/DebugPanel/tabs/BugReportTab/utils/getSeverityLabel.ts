import { SEVERITY_OPTIONS } from '../BugReportTab.constants'
import type { BugSeverity } from '../BugReportTab.types'

export function getSeverityLabel(value: BugSeverity): string {
  const match = SEVERITY_OPTIONS.find((option) => option.value === value)
  return match?.label ?? value
}
