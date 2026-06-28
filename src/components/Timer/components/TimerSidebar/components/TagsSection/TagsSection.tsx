import { Tag } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { TagsSectionProps } from './TagsSection.types'

export function TagsSection(props: TagsSectionProps): React.JSX.Element {
  const { tags, activeTagId, onSelect } = props

  if (tags.length === 0) return <></>

  return (
    <div className="px-2 pt-4">
      <div className="flex items-center gap-1.5 px-2 mb-2">
        <Tag size={11} className="text-muted-foreground/70" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Tags
        </span>
      </div>
      <div className="flex flex-wrap gap-1 px-2">
        {tags.map((tag) => {
          const active = tag.id === activeTagId
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onSelect(active ? null : tag.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] border transition-all',
                active
                  ? 'border-primary/40 bg-primary/10 text-foreground shadow-sm'
                  : 'border-border/40 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:border-border/70',
              )}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
              <span>{tag.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
