import { useEffect, useState } from 'react'

import type { ExplorerCopyProgress } from '@/tauri-api-bridge'

import type {
  ExplorerCopyProgressState,
  ExplorerCopyProgressToastProps,
} from './ExplorerCopyProgressToast.types'
import { computePercent } from './utils/computePercent'
import { formatBytes } from './utils/formatBytes'

const INITIAL_STATE: ExplorerCopyProgressState = {
  copiedBytes: 0,
  totalBytes: 0,
  filesDone: 0,
  totalFiles: 0,
  currentFile: '',
  done: false,
}

export function useExplorerCopyProgressToastData(props: ExplorerCopyProgressToastProps) {
  const { operationId } = props
  const [state, setState] = useState<ExplorerCopyProgressState>(INITIAL_STATE)

  useEffect(() => {
    const unsubscribe = window.api.onExplorerCopyProgress((data: ExplorerCopyProgress) => {
      if (data.operationId !== operationId) {
        return
      }

      setState({
        copiedBytes: data.copiedBytes,
        totalBytes: data.totalBytes,
        filesDone: data.filesDone,
        totalFiles: data.totalFiles,
        currentFile: data.currentFile,
        done: data.done,
      })
    })

    return unsubscribe
  }, [operationId])

  const rawPercent = computePercent(state.copiedBytes, state.totalBytes)
  const percent = state.done ? 100 : rawPercent

  return {
    percent,
    copiedLabel: formatBytes(state.copiedBytes),
    totalLabel: formatBytes(state.totalBytes),
    filesDone: state.filesDone,
    totalFiles: state.totalFiles,
    currentFile: state.currentFile,
    done: state.done,
  }
}
