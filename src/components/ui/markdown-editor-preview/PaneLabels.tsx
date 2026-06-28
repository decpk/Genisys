import { Link, Unlink } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { PaneLabelsProps } from './MarkdownEditorPreview.types'

export function PaneLabels(props: PaneLabelsProps): React.JSX.Element {
  const { leftPercent, rightPercent, leftLabel, rightLabel, scrollSyncEnabled, onScrollSyncToggle } = props

  return (
    <div className="shrink-0 flex border-b border-border/30 bg-muted/20">
      <div style={{ width: leftPercent }} className="flex items-center gap-1.5 px-4 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          {leftLabel}
        </span>
      </div>
      <div className="w-px bg-border/30" />
      <div style={{ width: rightPercent }} className="flex items-center justify-between px-4 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          {rightLabel}
        </span>
        {onScrollSyncToggle && (
          <button
            type="button"
            onClick={onScrollSyncToggle}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer',
              scrollSyncEnabled
                ? 'bg-primary/10 text-primary'
                : 'bg-secondary/60 text-muted-foreground hover:text-foreground',
            )}
          >
            {scrollSyncEnabled ? <Link size={10} /> : <Unlink size={10} />}
            Scroll Sync
          </button>
        )}
      </div>
    </div>
  )
}
