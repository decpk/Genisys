import { useCallback } from 'react'

import { useWebpageStore } from '@/store/webpage-store'

import { isImportFormReady } from '../utils/isImportFormReady'
import { useImportWebpageFilePicker } from './useImportWebpageFilePicker'
import { useImportWebpageForm } from './useImportWebpageForm'
import { useImportWebpageSubmit } from './useImportWebpageSubmit'

/**
 * Orchestrator hook for the import dialog. Composes the focused form,
 * file-picker, and submit hooks and exposes everything the view needs.
 */
export function useImportWebpageDialogData(
  onOpenChange: (open: boolean) => void,
) {
  const form = useImportWebpageForm()
  const {
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
  } = form

  const filePicker = useImportWebpageFilePicker({
    setFilePath,
    setFileContent,
    setError,
  })

  const submit = useImportWebpageSubmit({
    source,
    destination,
    url,
    html,
    fileContent,
    name,
    setError,
    resetForm,
    onOpenChange,
  })

  const storeIsSaving = useWebpageStore((s) => s.isSaving)
  const isSaving = submit.isSubmitting || storeIsSaving

  const handleCancel = useCallback(() => {
    resetForm()
    onOpenChange(false)
  }, [resetForm, onOpenChange])

  const isReady = isImportFormReady({ source, url, html, fileContent })

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
    fileContent,
    name,
    setName,
    error,
    isSaving,
    isReadingFile: filePicker.isReadingFile,
    isReady,
    pickFile: filePicker.pickFile,
    clearFile: filePicker.clearFile,
    handleImport: submit.handleImport,
    handleCancel,
  }
}
