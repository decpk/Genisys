import {
  TERMINAL_GIT_PANEL_MAX_WIDTH,
  TERMINAL_GIT_PANEL_MIN_WIDTH,
} from '../TerminalGitPanel.constants'

/** Clamps a panel width to the allowed min/max range. */
export function clampGitPanelWidth(width: number): number {
  return Math.max(
    TERMINAL_GIT_PANEL_MIN_WIDTH,
    Math.min(TERMINAL_GIT_PANEL_MAX_WIDTH, width),
  )
}
