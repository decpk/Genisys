import { Folder, Tag } from 'lucide-react'

import type { PromptsAppBreadcrumbProps } from './PromptsAppBreadcrumb.types'
import { usePromptsAppBreadcrumbData } from './usePromptsAppBreadcrumbData'

/**
 * Thin row that sits between the tab bar and the viewer body. Renders
 * `[folder dot] {folder.name} › {category.name} › {prompt.title}`,
 * with the folder and category segments clickable — selecting one
 * switches back to the Browse tab and pre-filters the grid.
 *
 * Returns an empty fragment when the Browse tab is active.
 */
export function PromptsAppBreadcrumb(
  props: PromptsAppBreadcrumbProps,
): React.JSX.Element {
  const breadcrumb = usePromptsAppBreadcrumbData(props.data)
  const { activePrompt, folder, category } = breadcrumb

  if (!activePrompt) return <></>

  return (
    <div className="flex h-7 shrink-0 items-center gap-1.5 border-b border-border/30 bg-muted/10 px-4 text-[10px]">
      {folder && (
        <button
          onClick={breadcrumb.handleSelectFolder}
          className="flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-muted-foreground/70 transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          {folder.color ? (
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: folder.color }}
            />
          ) : (
            <Folder size={9} className="text-muted-foreground/50" />
          )}
          <span className="font-medium">{folder.name}</span>
        </button>
      )}
      {folder && category && (
        <span className="text-muted-foreground/30">›</span>
      )}
      {category && (
        <button
          onClick={breadcrumb.handleSelectCategory}
          className="flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-muted-foreground/70 transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <Tag size={8} className="text-muted-foreground/50" />
          <span className="font-medium">{category.name}</span>
        </button>
      )}
      {(folder || category) && (
        <span className="text-muted-foreground/30">›</span>
      )}
      <span className="truncate font-medium text-foreground/80">
        {activePrompt.title || 'Untitled prompt'}
      </span>
    </div>
  )
}
