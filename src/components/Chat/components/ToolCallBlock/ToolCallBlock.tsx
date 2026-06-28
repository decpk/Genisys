import { memo, useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'

import {
  ToolActivityRenderer,
  type ToolActivity,
  type ToolActivityRendererMode,
} from '@/lib/chat-ui'

import type { ToolCall } from '../../hooks/useChatStream'
import { getToolIcon, getToolLabel, formatArgs } from './ToolCallBlock.constants'

/**
 * Backward-compatible adapter: maps Chat's `ToolCall[]` to the shared
 * `ToolActivityRenderer`.
 *
 * `mode` defaults to `'steps'` (VS Code-style numbered timeline) so existing
 * call-sites stay unchanged. The parent message bubble passes `'expandable'`
 * when an `ai-plan` fence is present so the tool list becomes the secondary,
 * collapsed audit trail beneath the plan-progress card.
 */
export const ToolCallBlock = memo(function ToolCallBlock(props: {
  toolCalls: ToolCall[]
  mode?: ToolActivityRendererMode
}): React.JSX.Element | null {
  const { toolCalls, mode = 'steps' } = props
  const activities = useMemo<ToolActivity[]>(
    () =>
      toolCalls.map((tc, i) => ({
        id: `${tc.toolName}-${i}`,
        toolName: tc.toolName,
        label: getToolLabel(tc.toolName),
        argSummary: formatArgs(tc.toolName, tc.args),
        status: tc.status === 'running' ? 'running' : 'done',
        result: tc.result,
        icon: getToolIcon(tc.toolName) as LucideIcon,
      })),
    [toolCalls],
  )
  return <ToolActivityRenderer activities={activities} mode={mode} />
})
