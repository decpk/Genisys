import { useCallback, useState } from 'react'

import { readHtmlFileContent } from '../api/readHtmlFileContent'
import { selectHtmlFilePath } from '../api/selectHtmlFilePath'

export interface ImportWebpageFilePickerDeps {
  setFilePath: (path: string) => void
  setFileContent: (content: string) => void
  setError: (error: string) => void
}

export interface ImportWebpageFilePickerApi {
  pickFile: () => Promise<void>
  clearFile: () => void
  isReadingFile: boolean
}

/** Handles the native HTML file picker and reads the selected file's contents. */
export function useImportWebpageFilePicker(
  deps: ImportWebpageFilePickerDeps,
): ImportWebpageFilePickerApi {
  const { setFilePath, setFileContent, setError } = deps
  const [isReadingFile, setIsReadingFile] = useState(false)

  const pickFile = useCallback(async () => {
    const path = await selectHtmlFilePath()
    if (!path) return

    setError('')
    setIsReadingFile(true)
    try {
      const content = await readHtmlFileContent(path)
      setFilePath(path)
      setFileContent(content)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to read file'
      setError(message)
      setFilePath('')
      setFileContent('')
    } finally {
      setIsReadingFile(false)
    }
  }, [setFilePath, setFileContent, setError])

  const clearFile = useCallback(() => {
    setFilePath('')
    setFileContent('')
  }, [setFilePath, setFileContent])

  return { pickFile, clearFile, isReadingFile }
}
