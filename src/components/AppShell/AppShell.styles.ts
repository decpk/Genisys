import { SIDE_PANEL_SURFACE_CLASS } from '@/lib/panel-classes'

export const appShellStyles = {
  sidebar: SIDE_PANEL_SURFACE_CLASS,
  main: 'flex-1 min-w-0 h-full overflow-hidden flex flex-col',
  mainContent: 'flex-1 min-h-0 min-w-0 overflow-hidden',
} as const
