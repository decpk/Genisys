import { useCallback, useMemo } from 'react'

import { exportRegistry, type ExportFormat } from '@/components/Library/book-export'

import type { ExportSubject } from '../notes-export.types'
import { useNotesExport } from '../useNotesExport'

export interface UseNotesExportMenuDataResult {
  formats: ExportFormat[]
  isExporting: boolean
  exportingFormatId: string | null
  handleSelectFormat: (formatId: string) => void
}

/**
 * Data hook for the toolbar `NotesExportMenu`. Snapshots the export
 * registry and binds the click handler to the shared `useNotesExport`
 * runner pre-curried with the menu's `subject`.
 */
export function useNotesExportMenuData(subject: ExportSubject): UseNotesExportMenuDataResult {
  const { isExporting, exportingFormatId, runExport } = useNotesExport()

  // The registry is populated at module load and never changes for the
  // lifetime of the app, but `useMemo` keeps the reference stable so
  // child renders skip unchanged work.
  const formats = useMemo(() => exportRegistry.getAll(), [])

  const handleSelectFormat = useCallback(
    (formatId: string): void => {
      void runExport(subject, formatId)
    },
    [runExport, subject],
  )

  return {
    formats,
    isExporting,
    exportingFormatId,
    handleSelectFormat,
  }
}
