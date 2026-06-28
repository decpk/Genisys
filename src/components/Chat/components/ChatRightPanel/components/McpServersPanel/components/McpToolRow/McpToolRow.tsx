import { Wrench } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { McpToolRowProps } from './McpToolRow.types'

export function McpToolRow(props: McpToolRowProps): React.JSX.Element {
  const { tool, isAlternate } = props

  return (
    <div
      className={cn(
        'flex items-start gap-2 px-3 py-1.5 rounded-md transition-colors hover:bg-accent/50',
        isAlternate && 'bg-muted/20',
      )}
    >
      <Wrench size={11} className="shrink-0 text-muted-foreground/50 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-foreground truncate">{tool.name}</p>
        {tool.description && (
          <p className="text-[10px] text-muted-foreground/70 leading-snug line-clamp-2">
            {tool.description}
          </p>
        )}
      </div>
    </div>
  )
}
