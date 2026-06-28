import { X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import type { ExplorerSearchFiltersProps } from './ExplorerSearch.types'

const ITEM_TYPE_OPTIONS = ['All', 'Files only', 'Folders only'] as const
const GIT_TYPE_OPTIONS = ['All', 'blob', 'tree'] as const

export function ExplorerSearchFilters({
  itemType,
  gitObjectType,
  extensions,
  onItemTypeChange,
  onGitObjectTypeChange,
  onExtensionsChange
}: ExplorerSearchFiltersProps): React.JSX.Element {
  return (
    <div className="px-3 pb-2 space-y-2 border-b border-border/20">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide w-14 shrink-0">
          Type
        </span>
        <div className="flex gap-0.5">
          {ITEM_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => onItemTypeChange(opt)}
              className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                itemType === opt
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide w-14 shrink-0">
          Git
        </span>
        <div className="flex gap-0.5">
          {GIT_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => onGitObjectTypeChange(opt)}
              className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                gitObjectType === opt
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide w-14 shrink-0">
          Ext
        </span>
        <div className="relative flex-1">
          <Input
            placeholder=".ts, .tsx, .json"
            value={extensions}
            onChange={(e) => onExtensionsChange(e.target.value)}
            className="h-6 text-[11px] bg-muted/50 pr-6"
          />
          {extensions && (
            <button
              onClick={() => onExtensionsChange('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
