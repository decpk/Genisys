export interface TerminalProps {
  /** Optional class for the outer panel container. */
  className?: string
}

export interface TerminalSurfaceProps {
  sessionId: string
  visible: boolean
}

export interface TerminalTabProps {
  id: string
  title: string
  active: boolean
  exited: boolean
  exitCode: number | null
  /** Pinned tabs survive bulk closes (Close All / Close Pane). */
  pinned?: boolean
  onActivate: (id: string) => void
  onClose: (id: string) => void
  /** When provided, enables the pin affordance (button + right-click menu). */
  onTogglePin?: (id: string) => void
  /** When provided, enables renaming (double-click + right-click menu item). */
  onRename?: (id: string) => void
  /** Per-tab terminal color scheme id (drives the tab tint + active menu state). */
  themeId?: string
  /** Per-tab xterm font-family override (drives the active font menu state). */
  fontFamily?: string | null
  /** When provided, enables the per-tab terminal theme picker submenu. */
  onSetTheme?: (id: string, themeId: string | null) => void
  /** When provided, enables the per-tab font picker submenu. */
  onSetFont?: (id: string, fontFamily: string | null) => void
}

export interface TerminalTabBarProps {
  className?: string
}

export interface TerminalHeaderProps {
  className?: string
}

export interface TerminalEmptyProps {
  className?: string
}

export interface TerminalDockHandleProps {
  className?: string
}
