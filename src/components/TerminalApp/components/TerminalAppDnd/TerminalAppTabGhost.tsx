import type { TermTab } from '@/store/terminal-app-store/types'

import { TerminalAppTab } from '../TerminalAppTab'

const noop = (): void => {}

/**
 * Floating preview rendered in the dnd-kit `<DragOverlay>` while a terminal tab
 * is dragged. Reuses `TerminalAppTab` for a pixel-faithful look; `onTogglePin`
 * is intentionally omitted so the ghost renders without the context-menu
 * wrapper.
 */
export function TerminalAppTabGhost({ tab }: { tab: TermTab }) {
  return (
    <div className="flex rounded-md border border-border bg-background opacity-95 shadow-lg">
      <TerminalAppTab
        id={tab.id}
        title={tab.title}
        active
        exited={tab.exited}
        exitCode={tab.exitCode}
        pinned={tab.pinned}
        onActivate={noop}
        onClose={noop}
      />
    </div>
  )
}
