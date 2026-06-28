import { useCallback, useState } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('notes')

import {
  downloadBlob,
  exportRegistry,
  showInFolder,
} from '@/components/Library/book-export'

import type { ExportSubject } from './notes-export.types'
import { collectExportChapters } from './utils/collectExportChapters'
import { sanitizeExportFilename } from './utils/sanitizeExportFilename'

export interface UseNotesExportResult {
  /** Format id currently being exported (or `null` if idle). */
  exportingFormatId: string | null
  /** True while any export is in flight. */
  isExporting: boolean
  /**
   * Run an export for `subject` using the export format registered as `formatId`
   * (e.g. `'pdf'`, `'html'`). Surfaces all user-visible feedback via `sonner`
   * toasts — callers don't need to handle errors themselves.
   */
  runExport: (subject: ExportSubject, formatId: string) => Promise<void>
}

/**
 * Shared hook that drives the notes export flow. Composes the
 * `collectExportChapters` resolver, the Library export registry, and
 * the Tauri save-dialog / reveal-in-folder helpers.
 *
 * Used by both the toolbar `NotesExportMenu` (single-note exports)
 * and the sidebar `NotesExportSubmenu` (container exports).
 */
export function useNotesExport(): UseNotesExportResult {
  const [exportingFormatId, setExportingFormatId] = useState<string | null>(null)

  const runExport = useCallback(
    async (subject: ExportSubject, formatId: string): Promise<void> => {
      const format = exportRegistry.get(formatId)
      if (!format) {
        toast.error('Export failed', {
          description: `Unknown export format: ${formatId}`,
        })
        return
      }

      setExportingFormatId(formatId)
      try {
        const collected = collectExportChapters(subject)

        if (collected.chapters.length === 0) {
          toast.warning('Nothing to export', {
            description: 'This selection has no notes with content.',
          })
          return
        }

        if (collected.skippedTitles.length > 0) {
          toast.warning(
            `${collected.skippedTitles.length} empty note(s) skipped`,
            {
              description: collected.skippedTitles.slice(0, 5).join(', '),
              duration: 6000,
            },
          )
        }

        const blob = await format.export({
          bookTitle: collected.bookTitle,
          bookDescription: collected.bookDescription,
          chapters: collected.chapters,
        })

        const safeStem = sanitizeExportFilename(collected.bookTitle)
        const filename = `${safeStem || 'Notes'}.${format.extension}`

        const savedPath = await downloadBlob(blob, filename)
        if (!savedPath) return // user cancelled the save dialog

        const fileName = savedPath.split('/').pop() ?? filename
        toast.success(
          `"${fileName}" saved — ${collected.chapters.length} note${
            collected.chapters.length === 1 ? '' : 's'
          } exported`,
          {
            duration: 5000,
            action: {
              label: 'Show in Folder',
              onClick: () => {
                void showInFolder(savedPath)
              },
            },
          },
        )
      } catch (err) {
        console.error(`[NotesExport] export as ${formatId} failed:`, err)
        toast.error('Export failed', {
          description: err instanceof Error ? err.message : 'Something went wrong',
        })
      } finally {
        setExportingFormatId(null)
      }
    },
    [],
  )

  return {
    exportingFormatId,
    isExporting: exportingFormatId !== null,
    runExport,
  }
}
