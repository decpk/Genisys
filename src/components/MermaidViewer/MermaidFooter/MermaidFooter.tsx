import { cn } from '@/lib/utils'

import { footerStyles } from '../MermaidViewer.styles'
import { formatTranslate } from '../MermaidViewer.utils'
import type { MermaidFooterProps } from './MermaidFooter.types'

export function MermaidFooter({ translate }: MermaidFooterProps): React.JSX.Element {
  return (
    <div className={cn(...footerStyles)}>
      <span className="text-[9px] text-muted-foreground/40 font-mono">
        Interactive — scroll to zoom, drag to pan
      </span>
      <span className="text-[9px] text-muted-foreground/40 tabular-nums">
        {formatTranslate(translate.x, translate.y)}
      </span>
    </div>
  );
}
