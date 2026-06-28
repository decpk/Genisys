import { memo } from 'react'
import { Clipboard, GripVertical } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { EmptyState } from '@/components/ui/empty-state'
import { ClipboardPreviewModal } from '@/components/ClipboardManager/components/ClipboardPreviewModal'

import { TileResizeMenu } from '../TileResizeMenu'
import { TileHeading } from '../TileHeading'
import { ClipboardQuickRow } from './components/ClipboardQuickRow'
import { ClipboardImageStrip } from './components/ClipboardImageStrip'
import { useClipboardQuickAccessTileData } from './hooks/useClipboardQuickAccessTileData'
import type { ClipboardQuickAccessTileProps } from './ClipboardQuickAccessTile.types'

export const ClipboardQuickAccessTile = memo(function ClipboardQuickAccessTile(
  props: ClipboardQuickAccessTileProps
): React.JSX.Element {
  const { tileWidth, onWidthChange, dragHandleProps } = props
  const { curated, actions } = useClipboardQuickAccessTileData()
  const { items, pinnedCount, totalAvailable, isLoaded } = curated;

  const showEmpty = isLoaded && items.length === 0
  const overflow = totalAvailable - items.length;

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
        icon={Clipboard}
        title="Clipboard Quick Access"
        appId="clipboard"
        appLabel="Open Clipboard Manager"
        count={
          totalAvailable > 0
            ? pinnedCount > 0
              ? `${pinnedCount} pinned · ${totalAvailable}`
              : totalAvailable
            : undefined
        }
      />

      {/* Content */}
      {showEmpty ? (
        <div className="p-4 flex-1 flex items-center justify-center">
          <EmptyState
            message="No clipboard items yet."
            icon={Clipboard}
            className="py-6"
          />
        </div>
      ) : (
        <>
          <ClipboardImageStrip />
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {items.map((item) => (
              <ClipboardQuickRow
                key={item.id}
                item={item}
                onCopy={actions.copy}
              />
            ))}
            {overflow > 0 && (
              <div className="px-3 pt-1 text-[10px] text-muted-foreground">
                +{overflow} more in Clipboard
              </div>
            )}
          </div>
        </>
      )}

      {/* Shared preview modal — driven by `useClipboardStore.previewItemId` */}
      <ClipboardPreviewModal />
    </div>
  );
})
