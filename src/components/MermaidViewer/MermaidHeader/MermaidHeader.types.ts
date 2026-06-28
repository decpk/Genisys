export interface MermaidHeaderProps {
  zoomPercent: number
  copied: boolean
  expanded: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onDownload: () => void
  onCopy: () => void
  onToggleExpand: () => void
}
