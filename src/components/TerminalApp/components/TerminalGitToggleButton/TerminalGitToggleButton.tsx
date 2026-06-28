import { GitBranch } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'

import { terminalAppStyles } from '../../TerminalApp.styles'
import type { TerminalGitToggleButtonProps } from './TerminalGitToggleButton.types'
import { useTerminalGitToggleButtonData } from './useTerminalGitToggleButtonData'

/**
 * Pane-toolbar button that toggles THIS pane's git changes panel. Visibility is
 * per-pane and hidden by default — each pane is toggled independently. Active
 * (primary-tinted) while this pane's panel is shown.
 */
export function TerminalGitToggleButton(props: TerminalGitToggleButtonProps) {
  const { leafId } = props
  const data = useTerminalGitToggleButtonData(leafId)

  return (
    <Tooltip content={data.label}>
      <button
        type="button"
        className={cn(
          terminalAppStyles.actionBtn,
          data.visible && 'text-primary bg-primary/10',
        )}
        onClick={data.toggle}
        aria-label="Toggle git changes panel"
        aria-pressed={data.visible}
      >
        <GitBranch className="w-3.5 h-3.5" />
      </button>
    </Tooltip>
  )
}
