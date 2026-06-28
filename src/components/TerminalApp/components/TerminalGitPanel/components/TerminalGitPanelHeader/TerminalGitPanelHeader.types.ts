export interface TerminalGitPanelHeaderProps {
  title: string
  count: number
  isLoading: boolean
  onRefresh: () => void
  onClose: () => void
}
