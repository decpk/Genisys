import { useCallback, useMemo } from 'react'

import { exportRegistry, type ExportFormat } from '@/components/Library/book-export'

import type { ExportSubject } from '../notes-export.types'
import { useNotesExport } from '../useNotesExport'

export interface UseNotesExportSubmenuDataResult {
  formats: ExportFormat[]
  isExporting: boolean
  exportingFormatId: string | null
  handleSelectFormat: (formatId: string) => void
}

/**
 * Data hook for the context-menu `NotesExportSubmenu`. Identical
 * concerns to `useNotesExportMenuData` but kept in its own file so
 * the two components remain independently editable and testable.
 */
export function useNotesExportSubmenuData(subject: ExportSubject): UseNotesExportSubmenuDataResult {
  const { isExporting, exportingFormatId, runExport } = useNotesExport()

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
