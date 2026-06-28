export interface RightPanelProps {
  appId: string
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  forceCollapsed?: boolean
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}
