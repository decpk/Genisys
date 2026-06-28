import { FileJson, FolderTree, Send, Variable } from 'lucide-react'

import { cn } from '@/lib/utils'
import { COLLECTION_IMPORT_FORMATS } from '../../../utils/collection-import/collection-import.constants'
import type { CollectionImportPreviewData } from '../ImportCollectionDialog.types'

interface CollectionImportPreviewCardProps {
  preview: CollectionImportPreviewData
}

function findFormatLabel(format: CollectionImportPreviewData['format']): string {
  const meta = COLLECTION_IMPORT_FORMATS.find((entry) => entry.key === format)
  if (!meta) return format
  return meta.label
}

export function CollectionImportPreviewCard(
  props: CollectionImportPreviewCardProps,
): React.JSX.Element {
  const { preview } = props
  const { collection, format, folderCount } = preview
  const formatLabel = findFormatLabel(format)

  const stats = [
    { key: 'requests', label: 'requests', value: collection.requests.length, icon: Send },
    { key: 'folders', label: 'folders', value: folderCount, icon: FolderTree },
    { key: 'variables', label: 'variables', value: collection.variables.length, icon: Variable },
  ]

  return (
    <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary shrink-0">
          <FileJson size={15} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{collection.name}</p>
          <p className="text-2xs text-muted-foreground">Detected {formatLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.key}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5',
                'rounded-md border border-border bg-background py-2',
              )}
            >
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                <Icon size={12} className="text-muted-foreground" />
                {stat.value}
              </span>
              <span className="text-2xs text-muted-foreground">{stat.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
