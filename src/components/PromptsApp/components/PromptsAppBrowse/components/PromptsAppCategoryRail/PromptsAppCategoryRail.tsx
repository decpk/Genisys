import { cn } from '@/lib/utils'

import type { PromptsAppCategoryRailProps } from './PromptsAppCategoryRail.types'
import { usePromptsAppCategoryRailData } from './usePromptsAppCategoryRailData'

/**
 * Vertical category selector rendered to the right of the left
 * sidebar, replacing the previous horizontally-scrolling chip strip.
 * Visibility rules mirror the legacy `PromptsAppCategoryChips`:
 * shown only when a folder is active, the user is not searching, and
 * the folder has at least one category.
 *
 * The width is user-resizable via a vertical drag handle on the right
 * edge and is persisted to localStorage so it survives view switches
 * and app reloads. Double-click the handle to reset to the default
 * width. The rail **never collapses** — width is clamped to the
 * configured min / max bounds.
 */
export function PromptsAppCategoryRail(
  props: PromptsAppCategoryRailProps,
): React.JSX.Element | null {
  const { data } = props
  const {
    activeFolder,
    activeFolderCategories,
    activeCategoryId,
    setActiveCategoryId,
    searchQuery,
    activeFolderPromptCount,
  } = data
  const { width, handleResizeMouseDown } = usePromptsAppCategoryRailData()

  if (!activeFolder) return null
  if (searchQuery.trim()) return null
  if (activeFolderCategories.length === 0) return null

  const isAll = activeCategoryId === null

  return (
    <aside
      aria-label="Categories"
      className="relative z-10 flex h-full shrink-0 flex-col border-r border-border/40 bg-card/20 backdrop-blur-sm"
      style={{ width }}
    >
      <div className="flex items-center justify-between px-4 pb-1.5 pt-4">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
          Categories
        </p>
        <span className="text-[10px] tabular-nums text-muted-foreground/50">
          {activeFolderCategories.length}
        </span>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3 pt-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveCategoryId(null)}
          className={cn(
            'group flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11.5px] font-medium transition-all cursor-pointer',
            isAll
              ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
              : 'border-transparent bg-transparent text-muted-foreground hover:bg-card/60 hover:text-foreground',
          )}
        >
          <span className="flex-1 truncate">All</span>
          <span
            className={cn(
              'shrink-0 rounded-full px-1.5 text-[10px] tabular-nums leading-4',
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
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategoryId(category.id)}
              className={cn(
                'group flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11.5px] font-medium transition-all cursor-pointer',
                isActive
                  ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
                  : 'border-transparent bg-transparent text-muted-foreground hover:bg-card/60 hover:text-foreground',
              )}
            >
              {category.icon ? (
                <span aria-hidden className="text-[12px] leading-none">
                  {category.icon}
                </span>
              ) : null}
              <span className="flex-1 truncate">{category.name}</span>
            </button>
          )
        })}
      </div>

      {/* Resize handle — drag to resize, double-click to reset. */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize categories"
        className="group absolute top-0 right-0 z-20 h-full w-[6px] translate-x-1/2 cursor-col-resize"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </aside>
  )
}
