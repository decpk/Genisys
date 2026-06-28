import { SplitSquareHorizontal } from 'lucide-react'
import { Popover } from 'radix-ui'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/Tooltip'

import { notesMainContentStyles as styles } from '../../../NotesMainContent.styles'
import type { NotesSplitButtonProps } from './NotesSplitButton.types'
import { useNotesSplitButtonData } from './useNotesSplitButtonData'

export function NotesSplitButton(props: NotesSplitButtonProps): React.JSX.Element {
  const { onPick, isCompact } = props
  const { open, setOpen, query, setQuery, items } = useNotesSplitButtonData(props)

  const handlePick = (noteId: string) => {
    onPick(noteId)
    setOpen(false)
    setQuery('')
  }

  const hasItems = items.length > 0

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Tooltip content="Open another note side by side" side="bottom">
        <Popover.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(styles.toolbarBtn, 'px-2 gap-1', styles.toolbarBtnIdle)}
          >
            <SplitSquareHorizontal size={13} />
            {!isCompact && <span>Split</span>}
          </Button>
        </Popover.Trigger>
      </Tooltip>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-[260px] max-h-[320px] flex flex-col rounded-lg border border-border/40 bg-popover shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          <div className="p-2 border-b border-border/30 shrink-0">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a note to open beside…"
              className="w-full bg-secondary/40 rounded-md px-2.5 py-1.5 text-[12px] outline-none placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="flex flex-col gap-0.5 p-1.5 overflow-y-auto">
            {!hasItems && (
              <div className="px-2.5 py-3 text-[12px] text-muted-foreground/50 text-center">No other notes</div>
            )}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item.id)}
                className="text-left px-2.5 py-1.5 rounded-md text-[12px] text-foreground/80 hover:bg-secondary cursor-pointer truncate"
              >
                {item.title}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
