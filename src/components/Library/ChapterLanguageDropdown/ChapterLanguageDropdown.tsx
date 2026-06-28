import { ChevronDown, Languages, Trash2 } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'

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
import { Tooltip } from '@/components/Tooltip'
import { LANGUAGE_OPTIONS, type Language } from '@/lib/languages'
import { getLanguageLabel } from '@/lib/getLanguageLabel'
import { cn } from '@/lib/utils'

import type { ChapterLanguageDropdownProps } from './ChapterLanguageDropdown.types'

export function ChapterLanguageDropdown(props: ChapterLanguageDropdownProps): React.JSX.Element {
  const { chapter, activeLanguage, translations, onSelectLanguage, onTranslateChapter, onTranslateBook, onDeleteTranslation } = props
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const existing = new Map<Language, 'completed' | 'generating' | 'pending' | 'error'>()
  existing.set(chapter.language, 'completed')
  for (const t of translations) {
    existing.set(t.language, t.status)
  }

  const missing = LANGUAGE_OPTIONS.filter((opt) => !existing.has(opt.value))

  const triggerLabel = getLanguageLabel(activeLanguage)

  return (
    <DropdownMenu>
      <Tooltip content="Reading language" side="bottom">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="h-7 px-2 rounded-md inline-flex items-center gap-1 border border-border/40 text-[11px] text-foreground/70 hover:bg-secondary transition-colors cursor-pointer"
          >
            <Languages size={10} />
            <span className="max-w-[120px] truncate">{triggerLabel}</span>
            <ChevronDown size={8} />
          </button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent
          align="end"
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

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Available
          </DropdownMenuLabel>
          {LANGUAGE_OPTIONS.filter((opt) => existing.has(opt.value)).map((opt) => {
            const status = existing.get(opt.value)
            const isActive = opt.value === activeLanguage
            const isGenerating = status === 'generating'
            const isPrimary = opt.value === chapter.language
            return (
              <DropdownMenuItem
                key={opt.value}
                disabled={isGenerating}
                onSelect={() => !isGenerating && onSelectLanguage(opt.value)}
                className={cn(
                  'group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/80 hover:bg-secondary',
                )}
              >
                <span className="flex-1">{opt.label}</span>
                {isGenerating && <AppLoaderGlyph size={12} className="text-muted-foreground" />}
                {!isPrimary && !isGenerating && (
                  <button
                    type="button"
                    aria-label={`Delete ${opt.label} translation`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      openConfirmDialog({
                        title: `Delete ${opt.label} translation?`,
                        description: `The ${opt.label} translation of “${chapter.title}” will be permanently removed. The original chapter is not affected.`,
                        confirmLabel: 'Delete',
                        cancelLabel: 'Cancel',
                        variant: 'destructive',
                        onConfirm: () => onDeleteTranslation(opt.value),
                      })
                    }}
                    className="rounded p-0.5 hover:bg-red-500/10"
                  >
                    <Trash2 size={9} color="#ef4444" className="!size-[10px]" />
                  </button>
                )}
              </DropdownMenuItem>
            )
          })}

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
  )
}
