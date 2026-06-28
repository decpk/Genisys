import { useCallback, useState } from 'react'

import type {
  ImportDestination,
  ImportSource,
} from '../ImportWebpageDialog.types'

export interface ImportWebpageFormApi {
  source: ImportSource
  setSource: (source: ImportSource) => void
  destination: ImportDestination
  setDestination: (destination: ImportDestination) => void
  url: string
  setUrl: (url: string) => void
  html: string
  setHtml: (html: string) => void
  filePath: string
  setFilePath: (path: string) => void
  fileContent: string
  setFileContent: (content: string) => void
  name: string
  setName: (name: string) => void
  error: string
  setError: (error: string) => void
  resetForm: () => void
}

/** Owns every piece of form state for the import dialog. No side effects. */
export function useImportWebpageForm(): ImportWebpageFormApi {
  const [source, setSource] = useState<ImportSource>('url')
  const [destination, setDestination] = useState<ImportDestination>('page')
  const [url, setUrl] = useState('')
  const [html, setHtml] = useState('')
  const [filePath, setFilePath] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const resetForm = useCallback(() => {
    setSource('url')
    setDestination('page')
    setUrl('')
    setHtml('')
    setFilePath('')
    setFileContent('')
    setName('')
    setError('')
  }, [])

  return {
    source,
    setSource,
    destination,
    setDestination,
    url,
    setUrl,
    html,
    setHtml,
    filePath,
    setFilePath,
    fileContent,
    setFileContent,
    name,
    setName,
    error,
    setError,
    resetForm,
  }
}
