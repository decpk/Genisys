import { Copy, Pencil, Trash2 } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'

import type { CustomThemeListItemProps } from '../../CustomThemeManagerSetting.types'

export function CustomThemeListItem(props: CustomThemeListItemProps): React.JSX.Element {
  const { theme, isActive, onEdit, onDuplicate, onDelete, onApply } = props

  let activeBadge: React.ReactNode = null
  if (isActive) {
    activeBadge = (
      <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
        Active
      </span>
    )
  }

  let categoryHint: string
  if (theme.isDark) {
    categoryHint = 'Dark'
  } else {
    categoryHint = 'Light'
  }

  return (
    <li className="flex items-center gap-3 px-3 py-2 rounded-md border border-border/40 bg-card/30 hover:bg-card/50 transition-colors">
      <button
        type="button"
        onClick={() => onApply(theme)}
        className="flex items-center gap-2 min-w-0 flex-1 text-left"
        title="Apply this theme"
      >
        <span className="flex items-center -space-x-1 shrink-0">
          <span
            className="size-4 rounded-full border border-border/60"
            style={{ backgroundColor: theme.colors.primary }}
          />
          <span
            className="size-4 rounded-full border border-border/60"
            style={{ backgroundColor: theme.colors.background }}
          />
          <span
            className="size-4 rounded-full border border-border/60"
            style={{ backgroundColor: theme.colors.accent }}
          />
        </span>
        <span className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-foreground truncate flex items-center gap-2">
            <span className="truncate">{theme.name}</span>
            {activeBadge}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {categoryHint} · {theme.id}
          </span>
        </span>
      </button>
      <div className="flex items-center gap-0.5 shrink-0">
        <Tooltip content="Edit">
          <IconButton variant="ghost" size="sm" onClick={() => onEdit(theme)} aria-label="Edit theme">
            <Pencil size={14} />
          </IconButton>
        </Tooltip>
        <Tooltip content="Duplicate">
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(theme)}
            aria-label="Duplicate theme"
          >
            <Copy size={14} />
          </IconButton>
        </Tooltip>
        <Tooltip content="Delete">
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => onDelete(theme)}
            aria-label="Delete theme"
          >
            <Trash2 size={14} />
          </IconButton>
        </Tooltip>
      </div>
    </li>
  )
}
