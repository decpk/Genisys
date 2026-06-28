import { memo } from 'react'
import { GripVertical, Pin, Sparkles } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { EmptyState } from '@/components/ui/empty-state'

import { TileResizeMenu } from '../TileResizeMenu'
import { TileHeading } from '../TileHeading'
import { PromptTreeFolder } from './components/PromptTreeFolder'
import { PromptTreeLeaf } from './components/PromptTreeLeaf'
import { useQuickPromptsTileData } from './hooks/useQuickPromptsTileData'
import type { QuickPromptsTileProps } from './QuickPromptsTile.types'

const PINNED_INDENT = 22

export const QuickPromptsTile = memo(function QuickPromptsTile(
  props: QuickPromptsTileProps
): React.JSX.Element {
  const { tileWidth, onWidthChange, dragHandleProps } = props
  const { grouped, actions } = useQuickPromptsTileData()
  const { folders, pinnedPrompts, totalAvailable, pinnedCount, isLoaded } = grouped

  const showEmpty = isLoaded && folders.length === 0 && pinnedPrompts.length === 0
  const headerCount =
    pinnedCount > 0 ? `${pinnedCount} pinned · ${totalAvailable}` : `${totalAvailable}`

  return (
    <div className="@container group relative border border-border rounded-lg bg-card overflow-hidden h-[400px] flex flex-col">
      {/* Action buttons — top-right, shown on hover */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <TileResizeMenu tileWidth={tileWidth} onWidthChange={onWidthChange} />
        <IconButton
          tooltip="Drag to reorder"
          tooltipSide="bottom"
          size="xs"
          className="cursor-grab active:cursor-grabbing"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical size={14} />
        </IconButton>
      </div>

      {/* Header */}
      <TileHeading
        icon={Sparkles}
        title="Prompts"
        appId="prompts"
        appLabel="Open Prompt Manager"
        count={totalAvailable > 0 ? headerCount : undefined}
      />

      {/* Content */}
      {showEmpty ? (
        <div className="p-4 flex-1 flex items-center justify-center">
          <EmptyState
            message="No prompts yet. Add some in Prompt Manager."
            icon={Sparkles}
            className="py-6"
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-1.5 pr-1.5 flex flex-col">
          {pinnedPrompts.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground/80">
                <Pin size={10} className="text-amber-500" fill="currentColor" />
                Pinned
                <span className="text-muted-foreground/60 normal-case tracking-normal">
                  · {pinnedCount}
                </span>
              </div>
              <div className="flex flex-col">
                {pinnedPrompts.map((prompt) => (
                  <PromptTreeLeaf
                    key={`pinned-${prompt.id}`}
                    prompt={prompt}
                    indentPx={PINNED_INDENT}
                    onLaunch={actions.launch}
                  />
                ))}
              </div>
              <div className="mt-2 mx-2 border-t border-border/30" />
            </div>
          )}

          {folders.map((folder, idx) => (
            <PromptTreeFolder
              key={folder.folder.id}
              node={folder}
              defaultExpanded={idx === 0}
              onLaunch={actions.launch}
            />
          ))}
        </div>
      )}
    </div>
  )
})
