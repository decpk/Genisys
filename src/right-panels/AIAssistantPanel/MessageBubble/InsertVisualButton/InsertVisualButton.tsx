import { FileInput } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { VisualBlock } from '../MessageBubble.types'
import type { InsertVisualButtonProps } from './InsertVisualButton.types'

const VISUAL_LABELS: Record<VisualBlock['kind'], string> = {
  mermaid: 'Insert diagram',
  chart: 'Insert chart',
}

export function InsertVisualButton(props: InsertVisualButtonProps): React.JSX.Element {
  const { blocks, onInsert } = props

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {blocks.map((block, idx) => (
        <Button
          key={`${block.kind}-${idx}`}
          variant="ghost"
          size="xs"
          className="h-6 gap-1 text-[10.5px] text-muted-foreground"
          onClick={() => onInsert(block.markdown)}
        >
          <FileInput size={11} />
          {VISUAL_LABELS[block.kind]}
        </Button>
      ))}
    </div>
  )
}
