import { useState } from 'react'
import { ClipboardList, FileText, Image, Pin, Settings, Tag, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'
import { useClipboardStore } from '@/store/clipboard-store'
import { useClipboardLabelStore } from '@/store/clipboard-label-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { LabelManagementModal } from './LabelManagementModal'
import { SmartCollectionsSidebar } from './SmartCollectionsSidebar'
import { SensitiveDataSidebar } from './SensitiveDataSidebar'

export function ClipboardSidebar(): React.JSX.Element {
  const filter = useClipboardStore((s) => s.filter)
  const setFilter = useClipboardStore((s) => s.setFilter)
  const stats = useClipboardStore((s) => s.stats)
  const clearAll = useClipboardStore((s) => s.clearAll)
  const labels = useClipboardLabelStore((s) => s.labels)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)
  const [labelModalOpen, setLabelModalOpen] = useState(false)

  const filters = [
    { key: 'all' as const, label: 'All Items', icon: ClipboardList, count: stats.total },
    { key: 'pinned' as const, label: 'Pinned', icon: Pin, count: stats.pinnedCount },
    { key: 'text' as const, label: 'Text', icon: FileText, count: stats.textCount },
    { key: 'image' as const, label: 'Images', icon: Image, count: stats.imageCount },
    { key: 'labeled' as const, label: 'Labeled', icon: Tag, count: stats.labeledCount },
  ]

  const handleClearAll = () => {
    openConfirmDialog({
      title: 'Clear All Items',
      description: 'Are you sure you want to delete all clipboard items? This action cannot be undone.',
      confirmLabel: 'Clear All',
      variant: 'destructive',
      onConfirm: async () => {
        await clearAll()
      },
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-3 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">Clipboard Manager</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{stats.total} items</p>
      </div>

      {/* Filter buttons */}
      <div className="px-2 py-2 pb-3 space-y-0.5">
        {filters.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm transition-colors',
              filter === key
                ? 'bg-primary/10 border border-primary/30 text-primary font-medium'
                : 'border border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon size={15} />
            <span className="flex-1 text-left">{label}</span>
            <span className="text-xs tabular-nums opacity-60">{count}</span>
          </button>
        ))}
      </div>

      {/* Label filters */}
      {labels.length > 0 && (
        <div className="px-2 pt-3 pb-1">
          <div className="flex items-center justify-between px-2.5 mb-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Labels</span>
            <IconButton
              onClick={() => setLabelModalOpen(true)}
              variant="ghost"
              size="xs"
              tooltip="Manage labels"
            >
              <Settings size={12} />
            </IconButton>
          </div>
          <div className="space-y-0.5">
            {labels.map((label) => {
              const filterKey = `label:${label.id}` as const
              const isActive = filter === filterKey
              return (
                <button
                  key={label.id}
                  onClick={() => setFilter(filterKey)}
                  className={cn(
                    'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 border border-primary/30 text-primary font-medium'
                      : 'border border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="flex-1 text-left truncate">{label.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Smart Collections */}
      <SmartCollectionsSidebar
        activeFilter={filter}
        onFilterChange={setFilter}
        className="mt-3"
      />

      {/* Sensitive Data */}
      <SensitiveDataSidebar
        activeFilter={filter}
        onFilterChange={setFilter}
        className="mt-3"
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="px-2 py-2 border-t border-border/50 space-y-0.5">
        <button
          onClick={() => setLabelModalOpen(true)}
          className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
        >
          <Settings size={15} />
          <span>Manage Labels</span>
        </button>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <Trash2 size={15} />
          <span>Clear All</span>
        </button>
      </div>

      <LabelManagementModal open={labelModalOpen} onOpenChange={setLabelModalOpen} />
    </div>
  )
}
