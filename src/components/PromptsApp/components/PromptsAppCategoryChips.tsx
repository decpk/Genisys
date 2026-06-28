import { Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

import type { PromptsAppData } from '../PromptsApp.types'

const DESTRUCTIVE_ITEM_CLASS = 'text-destructive'

interface PromptsAppCategoryChipsProps {
  data: PromptsAppData
}

export function PromptsAppCategoryChips(
  props: PromptsAppCategoryChipsProps,
): React.JSX.Element | null {
  const { data } = props
  const {
    activeFolder,
    activeFolderCategories,
    activeCategoryId,
    setActiveCategoryId,
    searchQuery,
    activeFolderPromptCount,
    removeCategory,
  } = data

  if (!activeFolder) return null
  if (searchQuery.trim()) return null
  if (activeFolderCategories.length === 0) return null

  const isAll = activeCategoryId === null

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-6 pb-2 pt-1 scrollbar-thin">
      <button
        type="button"
        onClick={() => setActiveCategoryId(null)}
        className={cn(
          'group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-medium transition-all cursor-pointer',
          isAll
            ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
            : 'border-border/50 bg-card/50 text-muted-foreground backdrop-blur-sm hover:border-border hover:bg-card hover:text-foreground',
        )}
      >
        All
        <span
          className={cn(
            'rounded-full px-1.5 text-[10px] tabular-nums leading-4',
            isAll
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-muted/60 text-muted-foreground',
          )}
        >
          {activeFolderPromptCount}
        </span>
      </button>

      {activeFolderCategories.map((category) => {
        const isActive = activeCategoryId === category.id
        return (
          <ContextMenu key={category.id}>
            <ContextMenuTrigger asChild>
              <button
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-medium transition-all cursor-pointer',
                  isActive
                    ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
                    : 'border-border/50 bg-card/50 text-muted-foreground backdrop-blur-sm hover:border-border hover:bg-card hover:text-foreground',
                )}
              >
                {category.icon ? (
                  <span aria-hidden className="text-[12px] leading-none">
                    {category.icon}
                  </span>
                ) : null}
                {category.name}
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                className={DESTRUCTIVE_ITEM_CLASS}
                onClick={() => removeCategory(category.id)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )
      })}
    </div>
  )
}
