import { Lock, X } from 'lucide-react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'

import type { PromptsAppTabProps } from './PromptsAppTab.types'
import { usePromptsAppTabData } from './usePromptsAppTabData'
import { getPromptTabFolderColor } from './utils/getPromptTabFolderColor'

/**
 * One prompt tab in the PromptsApp tab strip. Mirrors MockServer's
 * `EndpointTab`: middle-click closes, right-click opens a context menu
 * with tab-management + quick prompt actions, and the active tab gets a
 * subtle bottom border + filled background.
 */
export function PromptsAppTab(props: PromptsAppTabProps): React.JSX.Element {
  const {
    prompt,
    isActive,
    folderColor,
    onActivate,
    onClose,
    onCloseOthers,
    onCloseAll,
    onCopy,
  } = props

  const { handleMouseDown, handleCloseClick } = usePromptsAppTabData({
    prompt,
    onClose,
  })

  const dotColor = getPromptTabFolderColor(folderColor)
  const dotStyle = dotColor ? { backgroundColor: dotColor } : undefined

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={() => onActivate(prompt.id)}
          onMouseDown={handleMouseDown}
          className={cn(
            'group relative flex h-9 shrink-0 select-none items-center gap-1.5 border-b-2 px-3 text-xs transition-colors',
            isActive
              ? 'border-b-primary bg-background text-foreground'
              : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground',
          )}
        >
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              dotColor ? '' : 'bg-muted-foreground/40',
            )}
            style={dotStyle}
          />
          <span className="max-w-[160px] truncate text-[11px]">
            {prompt.title || 'Untitled prompt'}
          </span>
          {prompt.isBuiltIn && (
            <Lock className="size-2.5 shrink-0 text-muted-foreground/45" />
          )}
          <span
            role="button"
            onClick={handleCloseClick}
            className="ml-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm"
          >
            <X className="size-3 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100" />
          </span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onClose(prompt.id)}>
          Close
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onCloseOthers(prompt.id)}>
          Close Others
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onCloseAll()}>Close All</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onCopy(prompt)}>
          Copy content
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
