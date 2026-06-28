import { Copy, Check } from 'lucide-react'
import { useState, useCallback } from 'react'

import { Button } from '@/components/ui/button'

interface CopyLineProps {
  text: string
}

export function CopyLine(props: CopyLineProps): React.JSX.Element {
  const { text } = props
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  const Icon = copied ? Check : Copy

  return (
    <div className="flex items-center gap-2 bg-secondary/50 rounded-md px-3 py-2 text-xs">
      <code className="flex-1 break-all">{text}</code>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0"
        onClick={handleCopy}
      >
        <Icon className="size-3" />
      </Button>
    </div>
  );
}
