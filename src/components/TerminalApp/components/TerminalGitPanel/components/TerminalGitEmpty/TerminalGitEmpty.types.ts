export type TerminalGitEmptyVariant = 'no-cwd' | 'not-repo' | 'clean' | 'error'

export interface TerminalGitEmptyProps {
  variant: TerminalGitEmptyVariant
  message?: string
}
