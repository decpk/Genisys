import { Workflow } from 'lucide-react'

import { cn } from '@/lib/utils'

import { errorStyles } from '../MermaidViewer.styles'
import type { MermaidErrorProps } from './MermaidError.types'

export function MermaidError({ error, chart, className }: MermaidErrorProps): React.JSX.Element {
  return (
    <div className={cn(errorStyles.container, className)}>
      <div className={errorStyles.header}>
        <Workflow size={12} className="text-destructive/60" />
        <span className="text-[10px] uppercase tracking-wider text-destructive/60">
          Mermaid — Error
        </span>
      </div>
      <div className={errorStyles.body}>
        <pre className={errorStyles.message}>{error}</pre>
        <details className="mt-2">
          <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            View source
          </summary>
          <pre className={errorStyles.source}>{chart}</pre>
        </details>
      </div>
    </div>
  );
}
