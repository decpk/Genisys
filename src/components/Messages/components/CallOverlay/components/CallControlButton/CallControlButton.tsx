import { cn } from '@/lib/utils'

import { Tooltip } from '@/components/Tooltip'

import { callControlButtonStyles as s } from './CallControlButton.styles'
import type { CallControlButtonProps } from './CallControlButton.types'

export function CallControlButton(props: CallControlButtonProps): React.JSX.Element {
  const { icon, active, onClick, label, variant } = props

  let variantClass: string = s.default
  if (variant === 'danger') variantClass = s.danger

  return (
    <Tooltip content={label} side="top">
      <button
        type="button"
        className={cn(s.base, variantClass, active && s.active)}
        onClick={onClick}
        aria-label={label}
      >
        {icon}
      </button>
    </Tooltip>
  )
}
