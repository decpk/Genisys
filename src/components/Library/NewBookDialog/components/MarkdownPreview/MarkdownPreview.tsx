import { useState, useEffect } from 'react'

import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

import type { MarkdownPreviewProps } from './MarkdownPreview.types'

export function MarkdownPreview({ value }: MarkdownPreviewProps): React.JSX.Element {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), 300)
    return () => clearTimeout(timer)
  }, [value])

  if (!debouncedValue.trim()) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground/50 select-none">
        Preview will appear here…
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
      <MarkdownRenderer content={debouncedValue} variant="default" />
    </div>
  )
}
