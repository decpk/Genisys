import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LabelBadgeProps } from './LabelBadge.types'
import { badgeBaseStyles, badgeSizeStyles, removeButtonStyles } from './LabelBadge.styles'

export function LabelBadge(props: LabelBadgeProps): React.JSX.Element {
  const { name, color, onRemove, size = 'sm' } = props

  const bgStyle = { backgroundColor: `${color}20`, color, borderColor: `${color}30` }

  return (
    <span
      className={cn(badgeBaseStyles, badgeSizeStyles[size])}
      style={bgStyle}
    >
      <span
        className="size-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="truncate">{name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className={removeButtonStyles}
          type="button"
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
}
