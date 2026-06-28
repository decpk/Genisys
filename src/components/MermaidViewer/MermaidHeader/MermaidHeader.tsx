import {
  Check,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  Workflow,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { ControlButton } from '../ControlButton'
import { actionsGroupStyles, headerStyles, zoomControlsStyles } from '../MermaidViewer.styles'
import type { MermaidHeaderProps } from './MermaidHeader.types'

export function MermaidHeader({
  zoomPercent,
  copied,
  expanded,
  onZoomIn,
  onZoomOut,
  onReset,
  onDownload,
  onCopy,
  onToggleExpand,
}: MermaidHeaderProps): React.JSX.Element {
  const copyTitle = copied ? 'Copied!' : 'Copy source'
  const copyIcon = copied
    ? <Check size={11} className="text-success" />
    : <Copy size={11} />

  const expandTitle = expanded ? 'Collapse' : 'Expand'
  const expandIcon = expanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />

  return (
    <div className={cn(...headerStyles)}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-info/10">
          <Workflow size={10} className="text-info" />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
          Mermaid
        </span>
      </div>

      <div className="flex items-center gap-0.5">
        <div className={cn(...zoomControlsStyles)}>
          <ControlButton onClick={onZoomOut} title="Zoom out">
            <ZoomOut size={11} />
          </ControlButton>
          <span className="text-[9px] text-muted-foreground/60 min-w-[32px] text-center tabular-nums">
            {zoomPercent}%
          </span>
          <ControlButton onClick={onZoomIn} title="Zoom in">
            <ZoomIn size={11} />
          </ControlButton>
          <div className="w-px h-3 bg-border/40 mx-0.5" />
          <ControlButton onClick={onReset} title="Reset view">
            <RotateCcw size={10} />
          </ControlButton>
        </div>

        <div className={actionsGroupStyles}>
          <ControlButton onClick={onDownload} title="Download SVG">
            <Download size={11} />
          </ControlButton>
          <ControlButton onClick={onCopy} title={copyTitle}>
            {copyIcon}
          </ControlButton>
          <ControlButton onClick={onToggleExpand} title={expandTitle}>
            {expandIcon}
          </ControlButton>
        </div>
      </div>
    </div>
  );
}
