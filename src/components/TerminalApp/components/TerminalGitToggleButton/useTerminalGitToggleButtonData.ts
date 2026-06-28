import { useTerminalGitPanelStore } from '@/store/terminal-git-panel-store'

/** State + action for a pane's git-panel visibility toggle (per-pane). */
export function useTerminalGitToggleButtonData(leafId: string) {
  const visible = useTerminalGitPanelStore((s) => s.visibleByLeaf[leafId] ?? false)
  const toggle = useTerminalGitPanelStore((s) => s.toggle)
  const label = visible ? 'Hide git changes' : 'Show git changes'

  return {
    visible,
    label,
    toggle: () => toggle(leafId),
  }
}
