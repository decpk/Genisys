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
import type { Chapter } from '@/store/library-store'
import { exportRegistry, downloadBlob, showInFolder } from './book-export'

// ─── Chapter Export Menu ────────────────────────────────────────

interface ChapterExportMenuProps {
  chapter: Chapter
  bookTitle: string
}

export function ChapterExportMenu({
  chapter,
  bookTitle,
}: ChapterExportMenuProps): React.JSX.Element | null {
  const [exporting, setExporting] = useState<string | null>(null)

  const formats = exportRegistry.getAll()

  if (formats.length === 0 || !chapter.content) return null

  const handleExport = async (formatId: string) => {
    const format = exportRegistry.get(formatId)
    if (!format) return

    setExporting(formatId)
    try {
      const content =
        chapter.content ||
        ((await window.api.loadChapterContent(chapter.id)) as string | null) ||
        ''

      if (!content) return

      const blob = await format.export({
        bookTitle,
        chapters: [
          {
            chapterNumber: chapter.chapterNumber,
            title: chapter.title,
            content,
          },
        ],
      })

      const safeTitle = `${bookTitle} - Ch${chapter.chapterNumber} ${chapter.title}`
        .replace(/[^a-zA-Z0-9 _-]/g, '')
        .trim()
        .replace(/\s+/g, '_')

      const savedPath = await downloadBlob(
        blob,
        `${safeTitle}.${format.extension}`,
      )

      if (savedPath) {
        const fileName = savedPath.split('/').pop() ?? safeTitle
        toast.success(`"${fileName}" saved successfully`, {
          duration: 5000,
          action: {
            label: 'Show in Folder',
            onClick: () => showInFolder(savedPath),
          },
        })
      }
    } catch (err) {
      console.error(`Chapter export as ${formatId} failed:`, err)
      toast.error('Export failed', {
        description:
          err instanceof Error ? err.message : 'Something went wrong',
      })
    } finally {
      setExporting(null)
    }
  }

  const isExporting = exporting !== null

  return (
    <DropdownMenu>
      <Tooltip content="Export chapter" side="bottom">
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="xs"
            disabled={isExporting}
          >
            {isExporting ? (
              <AppLoaderGlyph size={13} />
            ) : (
              <Download size={13} />
            )}
            <ChevronDown size={10} className="opacity-50" />
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
