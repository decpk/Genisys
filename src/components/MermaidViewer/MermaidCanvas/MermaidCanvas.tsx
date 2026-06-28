import { cn } from '@/lib/utils'
import { AppLoaderGlyph } from '@/components/AppLoader'

import { canvasGridStyles, svgContainerStyles } from '../MermaidViewer.styles'
import type { MermaidCanvasProps } from './MermaidCanvas.types'

export function MermaidCanvas({
  svg,
  expanded,
  isPanning,
  isZooming,
  scale,
  translate,
  svgContainerRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: MermaidCanvasProps): React.JSX.Element {
  const cursorClass = isPanning ? 'cursor-grabbing' : 'cursor-grab'
  const heightClass = expanded ? 'flex-1' : 'max-h-[500px]'
  const minHeightClass = expanded ? 'min-h-full' : 'min-h-[200px]'

  const isInteracting = isPanning || isZooming

  const transformStyle = {
    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
    transformOrigin: 'center center' as const,
    transition: isInteracting ? 'none' : 'transform 0.2s ease-out',
    willChange: isInteracting ? 'transform' as const : 'auto' as const,
  }

  const loadingIndicator = (
    <div className="flex items-center gap-2 text-muted-foreground/40">
      <AppLoaderGlyph size={16} />
      <span className="text-xs font-medium">Rendering diagram…</span>
    </div>
  )

  const svgContent = svg
    ? <div className={cn(...svgContainerStyles)} dangerouslySetInnerHTML={{ __html: svg }} />
    : loadingIndicator

  return (
    <div
      ref={svgContainerRef}
      className={cn('relative overflow-hidden', heightClass, cursorClass)}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={canvasGridStyles}
      />

      <div
        className={cn('flex items-center justify-center p-8 select-none', minHeightClass)}
        style={transformStyle}
      >
        {svgContent}
      </div>
    </div>
  )
}
