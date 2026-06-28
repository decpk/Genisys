import { forwardRef } from 'react'
import { Sparkles } from 'lucide-react'

import { promptPickerStyles } from '../../PromptPicker.styles'

export interface PromptPickerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string
}

/**
 * Default trigger for `PromptPicker`. Visually paired with the ModelSelector
 * icon-button so the two compose neatly in a Chat input toolbar.
 *
 * Implemented with `forwardRef` so Radix `Popover.Trigger asChild` can attach
 * its ref and click handler directly to the underlying `<button>`. Wrapping
 * this in a custom Tooltip component breaks that composition because Tooltip
 * does not forward refs or click handlers; we therefore use the native
 * `title` attribute for the hover hint.
 */
export const PromptPickerTrigger = forwardRef<HTMLButtonElement, PromptPickerTriggerProps>(
  function PromptPickerTrigger(props, ref) {
    const { tooltip = 'Insert prompt', className, ...rest } = props
    return (
      <button
        ref={ref}
        type="button"
        title={tooltip}
        aria-label={tooltip}
        className={className ?? promptPickerStyles.trigger}
        {...rest}
      >
        <Sparkles size={14} />
      </button>
    )
  },
)
