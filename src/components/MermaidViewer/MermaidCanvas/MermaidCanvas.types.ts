import type { Point } from '../MermaidViewer.types'

export interface MermaidCanvasProps {
  svg: string
  expanded: boolean
  isPanning: boolean
  isZooming: boolean
  scale: number
  translate: Point
  svgContainerRef: React.RefObject<HTMLDivElement | null>
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
}
