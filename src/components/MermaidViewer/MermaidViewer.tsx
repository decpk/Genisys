import { cn } from '@/lib/utils'

import { useMermaidViewer } from './MermaidViewer.hooks'
import { backdropStyles, containerStyles } from './MermaidViewer.styles'
import type { MermaidViewerProps } from './MermaidViewer.types'
import { MermaidCanvas } from './MermaidCanvas'
import { MermaidError } from './MermaidError'
import { MermaidFooter } from './MermaidFooter'
import { MermaidHeader } from './MermaidHeader'

export function MermaidViewer({ chart, className }: MermaidViewerProps): React.JSX.Element {
  const {
    containerRef,
    svgContainerRef,
    svg,
    error,
    scale,
    zoomPercent,
    isZooming,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    isPanning,
    translate,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    copied,
    expanded,
    handleCopy,
    handleDownloadSvg,
    toggleExpanded,
  } = useMermaidViewer(chart)

  if (error) {
    return <MermaidError error={error} chart={chart} className={className} />
  }

  const expandedClass = expanded ? containerStyles.expanded : containerStyles.collapsed
  const backdrop = expanded
    ? <div className={backdropStyles} onClick={toggleExpanded} />
    : null

  return (
    <div
      ref={containerRef}
      className={cn(...containerStyles.base, expandedClass, className)}
    >
      {backdrop}

      <MermaidHeader
        zoomPercent={zoomPercent}
        copied={copied}
        expanded={expanded}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onDownload={handleDownloadSvg}
        onCopy={handleCopy}
        onToggleExpand={toggleExpanded}
      />

      <MermaidCanvas
        svg={svg}
        expanded={expanded}
        isPanning={isPanning}
        isZooming={isZooming}
        scale={scale}
        translate={translate}
        svgContainerRef={svgContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      <MermaidFooter translate={translate} />
    </div>
  )
}
