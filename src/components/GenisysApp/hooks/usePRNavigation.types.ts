export interface UsePRNavigationReturn {
  openPRUrl: string | null
  setOpenPRUrl: (url: string | null) => void
  handleOpenHistoryPR: (organization: string, pullRequestId: number, project: string) => void
}
