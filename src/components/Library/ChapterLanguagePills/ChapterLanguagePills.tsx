import { useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { LANGUAGE_OPTIONS, type Language } from '@/lib/languages'
import { getLanguageLabel } from '@/lib/getLanguageLabel'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { cn } from '@/lib/utils'

import type { ChapterLanguagePillsProps } from './ChapterLanguagePills.types'

interface PillEntry {
  language: Language
  label: string
  status: 'completed' | 'generating' | 'pending' | 'error'
  isPrimary: boolean
}

export function ChapterLanguagePills(props: ChapterLanguagePillsProps): React.JSX.Element {
  const {
    chapter,
    activeLanguage,
    translations,
    visible,
    onSelectLanguage,
    onTranslateChapter,
    onTranslateBook,
    onDeleteTranslation,
  } = props
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const pills = useMemo<PillEntry[]>(() => {
    const map = new Map<Language, PillEntry>()
    map.set(chapter.language, {
      language: chapter.language,
      label: getLanguageLabel(chapter.language),
      status: 'completed',
      isPrimary: true,
    })
    for (const t of translations) {
      if (map.has(t.language)) continue
      map.set(t.language, {
        language: t.language,
        label: getLanguageLabel(t.language),
        status: t.status,
        isPrimary: false,
      })
    }
    return Array.from(map.values())
  }, [chapter.language, translations])

  const existingLangs = useMemo(() => new Set(pills.map((p) => p.language)), [pills])
  const missing = useMemo(
    () => LANGUAGE_OPTIONS.filter((opt) => !existingLangs.has(opt.value)),
    [existingLangs],
  )

  const handleDeleteClick = (lang: Language, label: string): void => {
    openConfirmDialog({
      title: `Delete ${label} translation?`,
      description: `The ${label} translation of “${chapter.title}” will be permanently removed. The original chapter is not affected.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'destructive',
      onConfirm: () => onDeleteTranslation(lang),
    })
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-20 -mx-4 px-4 pt-0 pb-3 bg-background',
        'transition-transform duration-300 ease-out',
        visible ? 'translate-y-0' : '-translate-y-[120%]',
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 w-fit max-w-full">
        {pills.map((p) => {
          const isActive = p.language === activeLanguage
          const isGenerating = p.status === 'generating'
          return (
            <div
              key={p.language}
              className={cn(
                'group flex items-center gap-1.5 rounded-full border pl-3 pr-1.5 py-1 text-[10px] backdrop-blur-md shadow-sm transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary border-primary/30 font-medium'
                  : 'bg-background/85 text-foreground/70 border-border/40 hover:bg-secondary',
              )}
            >
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => !isGenerating && onSelectLanguage(p.language)}
                className="leading-none cursor-pointer disabled:cursor-default"
              >
                {p.label}
              </button>
              {isGenerating ? (
                <AppLoaderGlyph size={10} className="text-muted-foreground ml-0.5" />
              ) : !p.isPrimary ? (
                <button
                  type="button"
                  aria-label={`Delete ${p.label} translation`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(p.language, p.label)
                  }}
                  className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-red-500/15"
                >
                  <Trash2 size={9} color="#ef4444" className="!size-[9px]" />
                </button>
              ) : (
                <span className="w-1" />
              )}
            </div>
          )
        })}

        {/* Add translation pill */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Add translation"
              className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 backdrop-blur-md shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={11} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="z-50 min-w-[240px] max-h-[420px] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
          >
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none text-foreground/80 hover:bg-secondary transition-colors">
                Translate whole book
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="z-50 min-w-[220px] max-h-[360px] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={`book-${opt.value}`}
                    onSelect={() => onTranslateBook(opt.value)}
                    className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none text-foreground/80 hover:bg-secondary transition-colors"
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {missing.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  Translate this chapter
                </DropdownMenuLabel>
                {missing.map((opt) => (
                  <DropdownMenuItem
                    key={`tr-${opt.value}`}
                    onSelect={() => onTranslateChapter(opt.value)}
                    className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none text-foreground/80 hover:bg-secondary transition-colors"
                  >
                    <span className="flex-1">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground/50">Generate</span>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
