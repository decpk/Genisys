import { memo, useMemo } from 'react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'

import {
  messageActionBarStyles as wrapperStyles,
  messageActionStyles as buttonStyles,
} from './MessageActionBar.styles'
import type {
  MessageAction,
  MessageActionBarProps,
  MessageActionBarVariant,
} from './MessageActionBar.types'

/** Pick the per-button class for the current variant. */
function getButtonClass(variant: MessageActionBarVariant): string {
  if (variant === 'labeled') return buttonStyles.labeledButton
  return buttonStyles.iconOnlyButton
}

/** Render one action — either its custom node or a styled button. */
function renderAction(action: MessageAction, variant: MessageActionBarVariant): React.JSX.Element | null {
  if (action.hidden) return null

  if (action.node) {
    return <span key={action.key}>{action.node}</span>
  }

  const tooltipText = action.tooltip ?? action.label ?? action.key
  const showLabel = variant === 'labeled' && action.label
  const buttonClass = getButtonClass(variant)

  let labelNode: React.ReactNode = null
  if (showLabel) labelNode = action.label

  const button = (
    <button
      key={action.key}
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      className={buttonClass}
      aria-label={tooltipText}
    >
      {action.icon}
      {labelNode}
    </button>
  )

  if (variant === 'iconOnly') {
    return (
      <Tooltip key={action.key} content={tooltipText}>
        {button}
      </Tooltip>
    )
  }

  if (action.tooltip) {
    return (
      <Tooltip key={action.key} content={action.tooltip}>
        {button}
      </Tooltip>
    )
  }

  return button
}

/**
 * Shared horizontal bar of message actions (copy, speak, resend, add-to-library, …).
 * Used by both the full Chat app and every AI Assistant right-panel surface.
 *
 * The parent owns each action's state (e.g. the "Copied!" flash) and just hands
 * the current `icon` + `label` down per render.
 */
export const MessageActionBar = memo(function MessageActionBar(
  props: MessageActionBarProps,
): React.JSX.Element | null {
  const { actions, variant = 'iconOnly', visibility = 'hover', className } = props

  const visibleActions = useMemo(() => actions.filter((a) => !a.hidden), [actions])
  if (visibleActions.length === 0) return null

  let visibilityClass: string = wrapperStyles.wrapperAlways
  if (visibility === 'hover') visibilityClass = wrapperStyles.wrapperHover

  return (
    <div className={cn(wrapperStyles.wrapperBase, visibilityClass, className)}>
      {visibleActions.map((a) => renderAction(a, variant))}
    </div>
  )
})
