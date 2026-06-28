import type { ReactNode } from 'react'

export interface BugReportFieldProps {
  label: string
  htmlFor?: string
  optional?: boolean
  children: ReactNode
}
