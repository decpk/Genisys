import { useCallback } from 'react'

import { dedupeFilePaths } from '../utils/dedupeFilePaths'
import { filterMarkdownPaths } from '../utils/filterMarkdownPaths'

import type { AppendDroppedFilesResult } from './useLocalFilesData.types'

export interface LocalFilesDataApi {
  handleSelectFiles: () => Promise<void>
  handleRemoveFile: (filePath: string) => void
  handleAppendDroppedFiles: (paths: string[]) => AppendDroppedFilesResult
}

export function useLocalFilesData(
  selectedFiles: string[],
  setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>,
): LocalFilesDataApi {
  const handleSelectFiles = useCallback(async (): Promise<void> => {
    const result = await window.api.selectMarkdownFiles()
    if (!result.success) return
    setSelectedFiles((prev) => {
      const { unique } = dedupeFilePaths(prev, result.data)
      return [...prev, ...unique]
    })
  }, [setSelectedFiles])

  const handleRemoveFile = useCallback(
    (filePath: string): void => {
      setSelectedFiles((prev) => prev.filter((f) => f !== filePath))
    },
    [setSelectedFiles],
  )

  const handleAppendDroppedFiles = useCallback(
    (paths: string[]): AppendDroppedFilesResult => {
      const markdownPaths = filterMarkdownPaths(paths)
      const skippedNonMarkdown = paths.length - markdownPaths.length

      if (markdownPaths.length === 0) {
        return { added: 0, skippedNonMarkdown, skippedDuplicate: 0 }
      }

      const { unique, duplicateCount } = dedupeFilePaths(selectedFiles, markdownPaths)
      if (unique.length > 0) {
        setSelectedFiles((prev) => {
          const { unique: stillUnique } = dedupeFilePaths(prev, unique)
          return [...prev, ...stillUnique]
        })
      }

      return {
        added: unique.length,
        skippedNonMarkdown,
        skippedDuplicate: duplicateCount,
      }
    },
    [selectedFiles, setSelectedFiles],
  )

  return { handleSelectFiles, handleRemoveFile, handleAppendDroppedFiles }
}
