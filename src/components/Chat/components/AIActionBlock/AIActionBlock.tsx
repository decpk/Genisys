import { memo, useCallback } from 'react'
import { Bot, Pencil, X, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/Tooltip'

import { DEFAULT_IMPLEMENT_PROMPT } from '@/prompts/chatDefaultImplementPrompt'
import { DEFAULT_REFINE_PROMPT } from '@/prompts/chatDefaultRefinePrompt'
import type {
  AIActionBlockProps,
  AIActionHandler,
  AIActionId,
} from './AIActionBlock.types'

interface ActionButtonSpec {
  id: AIActionId
  label: string
  tooltip: string
  variant: 'default' | 'outline' | 'ghost'
  icon: typeof Bot
  resolvedIcon?: typeof Check
  resolvedLabel?: string
  resolvedClass?: string
}

const ACTION_BUTTONS: ActionButtonSpec[] = [
  {
    id: 'implement',
    label: 'Implement',
    tooltip:
      'Switches to Agent mode and runs the plan end-to-end — destructive tool calls are auto-approved for this run.',
    variant: 'default',
    icon: Bot,
    resolvedIcon: Check,
    resolvedLabel: 'Implementing',
    resolvedClass: 'bg-primary/80 text-primary-foreground',
  },
  {
    id: 'refine',
    label: 'Refine plan',
    tooltip: 'Stay in this mode and ask the assistant to refine the plan above.',
    variant: 'outline',
    icon: Pencil,
    resolvedIcon: Check,
    resolvedLabel: 'Refining',
    resolvedClass: 'border-primary/40 text-primary',
  },
  {
    id: 'cancel',
    label: 'Cancel',
    tooltip: 'Dismiss these actions and keep the plan as-is.',
    variant: 'ghost',
    icon: X,
    resolvedLabel: 'Cancelled',
    resolvedClass: 'text-muted-foreground',
  },
]

export const AIActionBlock = memo(function AIActionBlock({
  directive,
  isResolved,
  resolvedAction,
  onAction,
}: AIActionBlockProps): React.JSX.Element | null {
  const implementPrompt =
    directive.implementPrompt ?? DEFAULT_IMPLEMENT_PROMPT
  const refinePrompt = directive.refinePrompt ?? DEFAULT_REFINE_PROMPT
  const hidden = new Set(directive.hide ?? [])

  const visibleButtons = ACTION_BUTTONS.filter((b) => !hidden.has(b.id))
  if (visibleButtons.length === 0) return null

  const handleClick: AIActionHandler = useCallback(
    (id, opts) => {
      if (isResolved) return
      onAction(id, opts)
    },
    [isResolved, onAction],
  )

  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/20 pt-3"
      data-ai-action-block
      role="group"
      aria-label="Plan follow-up actions"
    >
      {visibleButtons.map((btn) => {
        const isThisResolved = isResolved && resolvedAction === btn.id
        const isOtherResolved = isResolved && resolvedAction !== btn.id

        let prompt: string | undefined
        if (btn.id === 'implement') prompt = implementPrompt
        else if (btn.id === 'refine') prompt = refinePrompt

        const Icon = isThisResolved && btn.resolvedIcon ? btn.resolvedIcon : btn.icon
        const label = isThisResolved && btn.resolvedLabel ? btn.resolvedLabel : btn.label

        const button = (
          <Button
            key={btn.id}
            type="button"
            size="xs"
            variant={btn.variant}
            disabled={isResolved}
            aria-pressed={isThisResolved}
            data-action={btn.id}
            className={isThisResolved ? btn.resolvedClass : undefined}
            onClick={() => handleClick(btn.id, { prompt })}
          >
            <Icon size={12} aria-hidden />
            <span>{label}</span>
          </Button>
        )

        // While the row is interactive, wrap in a tooltip. Once resolved we
        // drop the tooltip to avoid stale hint copy on a frozen button.
        if (isResolved) {
          // Faded so other-resolved buttons read as inert.
          return (
            <span
              key={btn.id}
              className={isOtherResolved ? 'opacity-40' : undefined}
            >
              {button}
            </span>
          )
        }

        return (
          <Tooltip key={btn.id} content={btn.tooltip} side="top">
            {button}
          </Tooltip>
        )
      })}
    </div>
  )
})
