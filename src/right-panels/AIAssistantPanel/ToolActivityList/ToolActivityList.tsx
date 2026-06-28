import { memo, useMemo } from 'react'

import { ToolActivityRenderer, type ToolActivity } from '@/lib/chat-ui'

import type { ToolActivityListProps } from './ToolActivityList.types'

/**
 * Backward-compatible adapter: renders the AI Assistant panel's per-app tool
 * activities through the shared `ToolActivityRenderer`.
 *
 * `mode` defaults to `'steps'` (VS Code-style numbered timeline). The parent
 * message bubble passes `'expandable'` when an `ai-plan` fence is present so
 * the tool list collapses beneath the plan-progress card.
 */
export const ToolActivityList = memo(function ToolActivityList(
  props: ToolActivityListProps,
): React.JSX.Element {
  const { activities, mode = 'steps' } = props
  const items = useMemo<ToolActivity[]>(
    () =>
      activities.map((a, i) => ({
        id: `${a.toolName}-${i}`,
        toolName: a.toolName,
        label: a.label,
        status: a.status,
      })),
    [activities],
  )
  return <ToolActivityRenderer activities={items} mode={mode} />
})
