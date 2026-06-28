import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Tooltip, type TooltipSide } from '@/components/Tooltip'

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 disabled:pointer-events-none disabled:opacity-30 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      size: {
        xs: 'p-0.5',
        sm: 'p-1',
        md: 'p-1.5',
        lg: 'p-2 size-9',
      },
      variant: {
        default:
          'text-muted-foreground hover:bg-secondary hover:text-foreground',
        outlined:
          'border border-border text-muted-foreground hover:bg-secondary hover:text-foreground',
        ghost: 'text-muted-foreground hover:text-foreground',
        destructive:
          'text-destructive/70 hover:bg-destructive/10 hover:text-destructive',
        subtle:
          'text-primary/70 hover:bg-primary/10 hover:text-primary',
        success:
          'text-success/70 hover:bg-success/10 hover:text-success',
        warning:
          'text-warning/70 hover:bg-warning/10 hover:text-warning',
      },
      showOnHover: {
        true: 'opacity-0 group-hover:opacity-100',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      showOnHover: false,
    },
  }
)

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof iconButtonVariants> & {
    tooltip?: string
    tooltipSide?: TooltipSide
    tooltipDisabled?: boolean
    shortcut?: string
  }

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      size,
      variant,
      showOnHover,
      tooltip,
      tooltipSide = 'bottom',
      tooltipDisabled,
      shortcut,
      children,
      ...props
    },
    ref
  ) => {
    const button = (
      <button
        ref={ref}
        className={cn(iconButtonVariants({ size, variant, showOnHover, className }))}
        {...props}
      >
        {children}
      </button>
    )

    if (tooltip) {
      return (
        <Tooltip content={tooltip} side={tooltipSide} shortcut={shortcut} disabled={tooltipDisabled}>
          {button}
        </Tooltip>
      )
    }

    return button
  }
)

IconButton.displayName = 'IconButton'

export { IconButton, iconButtonVariants }
export type { IconButtonProps }
