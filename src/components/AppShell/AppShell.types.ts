export interface AppShellProps {
  appId?: string
  sidebar: React.ReactNode
  sidebarWidth?: number
  sidebarMinWidth?: number
  sidebarMaxWidth?: number
  rightPanel?: React.ReactNode
  statusBar?: React.ReactNode
  /**
   * Mount the integrated Terminal panel inside this AppShell. Defaults to
   * `false` — only Code and MockServer opt in so that Ctrl/Cmd + ` does not
   * surface a terminal panel in apps where it has no meaning.
   */
  showTerminal?: boolean
  children: React.ReactNode
}
