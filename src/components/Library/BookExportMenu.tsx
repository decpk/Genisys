import { useState } from 'react'
import { Download, FileDown, ChevronDown } from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('library')

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { Tooltip } from '@/components/Tooltip'
import { Button } from '@/components/ui/button'
import { AppLoaderGlyph } from '@/components/AppLoader'
import {
  useLibraryStore,
  type BookWithChapters,
} from '@/store/library-store'
import {
  exportRegistry,
  downloadBlob,
  showInFolder,
  type ExportChapter,
} from './book-export'

// ─── Export Menu ────────────────────────────────────────────────

export function BookExportMenu(): React.JSX.Element | null {
  const [exporting, setExporting] = useState<string | null>(null)
  const activeBook = useLibraryStore((s) => s.activeBook)

  const formats = exportRegistry.getAll()

  if (!activeBook || formats.length === 0) return null

  const completedChapters = activeBook.chapters.filter(
    (ch) => ch.status === 'completed',
  )
  if (completedChapters.length === 0) return null

  const handleExport = async (formatId: string) => {
    const format = exportRegistry.get(formatId)
    if (!format || !activeBook) return

    setExporting(formatId)
    try {
      // Reload the book fresh from DB to get accurate chapter statuses.
      // The in-memory activeBook may be stale — chapters that finished
      // generating might still show as 'pending' in the store.
      const freshBook = (await window.api.loadBookWithChapters(
        activeBook.book.id,
      )) as BookWithChapters | null
      const allChapters = freshBook?.chapters ?? activeBook.chapters

      const sorted = allChapters
        .filter((ch) => ch.status === 'completed')
        .sort((a, b) => a.sortOrder - b.sortOrder)

      console.log(
        `[Export] Total chapters: ${allChapters.length}, Completed: ${sorted.length}, Statuses:`,
        allChapters.map((c) => `Ch${c.chapterNumber}=${c.status}`).join(', '),
      )

      const chapters: ExportChapter[] = []
      const skipped: string[] = []

      // Load chapter contents sequentially from DB
      for (const ch of sorted) {
        // In-memory content might be available for the currently viewed chapter
        const inMemory = activeBook.chapters.find((c) => c.id === ch.id)
        let content = inMemory?.content || ''

        if (!content) {
          content =
            ((await window.api.loadChapterContent(ch.id)) as
              | string
              | null) ?? ''
        }
        if (content) {
          chapters.push({
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            content,
          })
        } else {
          skipped.push(`Ch ${ch.chapterNumber}: ${ch.title}`)
        }
      }

      console.log(
        `[Export] Loaded: ${chapters.length}, Skipped: ${skipped.length}`,
        chapters.map((c) => `Ch${c.chapterNumber}: ${c.content.length} chars`).join(', '),
      )

      if (skipped.length > 0) {
        toast.warning(
          `${skipped.length} chapter(s) could not be loaded and were skipped`,
          {
            description: skipped.join(', '),
            duration: 6000,
          },
        )
      }

      if (chapters.length === 0) return

      const blob = await format.export({
        bookTitle: activeBook.book.title,
        bookDescription: activeBook.book.description,
        chapters,
      })

      const safeTitle = activeBook.book.title
        .replace(/[^a-zA-Z0-9 _-]/g, '')
        .trim()
        .replace(/\s+/g, '_')

      const savedPath = await downloadBlob(blob, `${safeTitle}.${format.extension}`)

      if (savedPath) {
        const fileName = savedPath.split('/').pop() ?? safeTitle
        toast.success(`"${fileName}" saved — ${chapters.length} chapters exported`, {
          duration: 5000,
          action: {
            label: 'Show in Folder',
            onClick: () => showInFolder(savedPath),
          },
        })
      }
    } catch (err) {
      console.error(`Export as ${formatId} failed:`, err)
      toast.error('Export failed', {
        description: err instanceof Error ? err.message : 'Something went wrong',
      })
    } finally {
      setExporting(null)
    }
  }

  const isExporting = exporting !== null

  return (
    <DropdownMenu>
      <Tooltip content="Export book">
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="xs"
            disabled={isExporting}
          >
            {isExporting ? (
              <AppLoaderGlyph size={13} />
            ) : (
              <Download size={13} />
            )}
            <span>Export</span>
            <ChevronDown size={10} />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>

        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="z-50 min-w-[170px] rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        >
          {formats.map((format) => (
            <DropdownMenuItem
              key={format.id}
              disabled={isExporting}
              onSelect={() => handleExport(format.id)}
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none transition-colors text-foreground/80 hover:bg-secondary disabled:opacity-50"
            >
              <FileDown size={13} className="shrink-0" />
              <div className="flex flex-col">
                <span>{format.label}</span>
                {format.description && (
                  <span className="text-[10px] text-muted-foreground">
                    {format.description}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
    </DropdownMenu>
  )
}
