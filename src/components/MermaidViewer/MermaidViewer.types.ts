export interface MermaidViewerProps {
  chart: string
  className?: string
}

export interface Point {
  x: number
  y: number
}

export interface PanState {
  isPanning: boolean
  translate: Point
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
}

export interface ZoomState {
  scale: number
  zoomPercent: number
  isZooming: boolean
  svgContainerRef: React.RefObject<HTMLDivElement | null>
  handleZoomIn: () => void
  handleZoomOut: () => void
  handleReset: () => void
}

export interface RenderState {
  svg: string
  error: string | null
}

export interface ActionsState {
  copied: boolean
  expanded: boolean
  handleCopy: () => void
  handleDownloadSvg: () => Promise<void>
  toggleExpanded: () => void
}

export interface MermaidViewerState extends PanState, ZoomState, RenderState, ActionsState {
  containerRef: React.RefObject<HTMLDivElement | null>
}
