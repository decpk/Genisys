import type { BugSeverity } from '../../BugReportTab.types'

export interface SeveritySelectProps {
  value: BugSeverity
  onChange: (value: BugSeverity) => void
}
