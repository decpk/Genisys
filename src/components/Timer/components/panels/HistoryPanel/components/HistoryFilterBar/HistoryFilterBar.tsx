import { Filter, Search, X } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PanelInput } from '@/components/ui/panel-input'
import { Tooltip } from '@/components/Tooltip'

import type { HistoryFilterBarProps } from './HistoryFilterBar.types'

export function HistoryFilterBar(props: HistoryFilterBarProps): React.JSX.Element {
  const { search, tagId, tags, onSearch, onTagChange, onReset } = props

  const activeTag = tags.find((t) => t.id === tagId)
  const tagLabel = activeTag ? activeTag.name : 'All tags'
  const hasFilters = search.length > 0 || tagId != null

  const triggerClass = activeTag
    ? 'inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 text-xs font-medium text-foreground transition-colors'
    : 'inline-flex h-8 items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 hover:bg-muted/50 hover:border-border/70 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors'

  return (
    <div className="flex items-center gap-2 px-3 pt-3 pb-2">
      <PanelInput
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search…"
        leadingIcon={<Search size={12} />}
        className="flex-1"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            <Filter size={12} />
            <span className="max-w-20 truncate">{tagLabel}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onTagChange(null)}>
            All tags
          </DropdownMenuItem>
          {tags.map((t) => (
            <DropdownMenuItem key={t.id} onClick={() => onTagChange(t.id)}>
              <span
                className="size-2 rounded-full mr-2"
                style={{ backgroundColor: t.color }}
                aria-hidden
              />
              {t.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {hasFilters && (
        <Tooltip content="Reset filters" side="bottom">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X size={12} />
          </button>
        </Tooltip>
      )}
    </div>
  )
}
