export interface ExplorerCopyProgressToastProps {
  operationId: string
  title: string
}

export interface ExplorerCopyProgressState {
  copiedBytes: number
  totalBytes: number
  filesDone: number
  totalFiles: number
  currentFile: string
  done: boolean
}
