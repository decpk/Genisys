import { memo } from 'react'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'

import { Tooltip } from '@/components/Tooltip'
import { contextScopePillStyles as styles } from '../AIAssistantPanel.styles'
import type { AIContextScope } from '../AIAssistantPanel.types'

interface ContextScopePillProps {
  scopes: AIContextScope[]
  selectedId: string | undefined
  onChange: (scopeId: string) => void
}

export const ContextScopePill = memo(function ContextScopePill({
  scopes,
  selectedId,
  onChange,
}: ContextScopePillProps): React.JSX.Element | null {
  // Render nothing for 0 or 1 scopes — a single-option pill has no value.
  if (!scopes || scopes.length < 2) return null

  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={selectedId ?? ''}
      onValueChange={(value) => {
        // ToggleGroup with type="single" can emit '' when the user clicks
        // the already-active item. Ignore that to keep a scope always-on.
        if (!value) return
        onChange(value)
      }}
      className={styles.root}
      aria-label="Context scope"
    >
      {scopes.map((scope) => {
        const Icon = scope.icon
        const tooltip = scope.description ?? scope.label
        return (
          <Tooltip key={scope.id} content={tooltip} side="top">
            <ToggleGroupPrimitive.Item
              value={scope.id}
              disabled={scope.disabled}
              className={styles.item}
              aria-label={tooltip}
            >
              {Icon ? <Icon size={12} /> : <span className={styles.label}>{scope.label}</span>}
            </ToggleGroupPrimitive.Item>
          </Tooltip>
        )
      })}
    </ToggleGroupPrimitive.Root>
  )
})
