import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { PaletteEmpty } from './components/PaletteEmpty'
import { PaletteInput } from './components/PaletteInput'
import { PaletteList } from './components/PaletteList'
import { useCommandPaletteData } from './hooks/useCommandPaletteData'
import { KIND_CONFIG } from './CommandPalette.constants'

function pickModeLabel(
  mode: ReturnType<typeof useCommandPaletteData>['mode'],
  kindFilter: ReturnType<typeof useCommandPaletteData>['kindFilter'],
): string | null {
  if (kindFilter) {
    return `@${KIND_CONFIG[kindFilter].pluralLabel}`
  }
  if (mode === 'commands') return 'Commands'
  return null
}

export function CommandPalette() {
  const data = useCommandPaletteData()
  const modeLabel = pickModeLabel(data.mode, data.kindFilter)

  const handleOpenChange = (open: boolean): void => {
    if (!open) data.close()
  }

  let body: React.ReactNode
  if (data.results.length === 0) {
    body = <PaletteEmpty />
  } else {
    body = (
      <PaletteList
        items={data.results}
        firstNonRecentIndex={data.firstNonRecentIndex}
        selectedIndex={data.selectedIndex}
        onSelectIndex={data.setSelectedIndex}
        onInvoke={data.invokeItem}
      />
    );
  }

  return (
    <Dialog open={data.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        onKeyDown={data.onKeyDown}
        style={{ top: '8vh', maxWidth: '1020px' }}
        className={cn(
          "flex translate-y-0 flex-col gap-0 overflow-hidden p-0",
        )}
      >
        <PaletteInput
          query={data.query}
          modeLabel={modeLabel}
          onChange={data.setQuery}
          onKeyDown={data.onKeyDown}
        />
        {body}
        <div className="flex items-center gap-3 border-t border-border bg-muted/30 px-3 py-1.5 text-[10px] text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
          <span className="ml-auto">
            <kbd className="rounded border border-border bg-background px-1">
              {">"}
            </kbd>{" "}
            commands ·{" "}
            <kbd className="rounded border border-border bg-background px-1">
              @
            </kbd>{" "}
            filter
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
