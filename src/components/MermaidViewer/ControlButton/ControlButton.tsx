import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'

import { controlButtonStyles } from '../MermaidViewer.styles'
import type { ControlButtonProps } from './ControlButton.types'

export function ControlButton({ children, onClick, title }: ControlButtonProps): React.JSX.Element {
  return (
    <IconButton
      onClick={onClick}
      tooltip={title}
      variant="ghost"
      size="xs"
      className={cn(...controlButtonStyles)}
    >
      {children}
    </IconButton>
  )
}
