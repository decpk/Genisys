export interface FileHistoryEntry {
  hash: string
  authorName: string
  authorEmail: string
  date: string
  message: string
}

export interface FileHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filePath: string
  rootPath: string
}
