import type { BugReportFormState, SeverityOption } from './BugReportTab.types'

export const SEVERITY_OPTIONS: SeverityOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
]

export const INITIAL_BUG_REPORT: BugReportFormState = {
  title: '',
  description: '',
  steps: '',
  severity: 'medium',
  email: ''
}
