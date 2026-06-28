import type { BugReportFieldProps } from './BugReportField.types'

export function BugReportField(props: BugReportFieldProps) {
  const { label, htmlFor, optional, children } = props

  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {optional && <span className="ml-1 text-xs text-muted-foreground">(optional)</span>}
      </label>
      {children}
    </div>
  )
}
