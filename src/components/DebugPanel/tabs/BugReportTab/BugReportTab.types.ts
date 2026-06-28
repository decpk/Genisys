export type BugSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface BugReportFormState {
  title: string
  description: string
  steps: string
  severity: BugSeverity
  email: string
}

export interface SeverityOption {
  value: BugSeverity
  label: string
}

export interface UseBugReportData {
  form: BugReportFormState
  canSubmit: boolean
  emailLocked: boolean
  setTitle: (value: string) => void
  setDescription: (value: string) => void
  setSteps: (value: string) => void
  setSeverity: (value: BugSeverity) => void
  setEmail: (value: string) => void
  reset: () => void
  handleSubmit: () => void
}
