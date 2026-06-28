import { useState, useRef, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'

interface RawTextDialogProps {
  onSubmit: (name: string, content: string) => void
  onClose: () => void
}

export function RawTextDialog({ onSubmit, onClose }: RawTextDialogProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim() || 'Untitled'
    const trimmedContent = content.trim()
    if (!trimmedContent) return
    onSubmit(trimmedName, trimmedContent)
  }, [name, content, onSubmit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && e.metaKey) handleSubmit()
    },
    [onClose, handleSubmit],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[520px] max-h-[80vh] rounded-2xl border border-border/60 bg-popover shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground">
            Paste Raw Text
          </h3>
          <IconButton variant="ghost" size="xs" tooltip="Close" onClick={onClose}>
            <X size={14} />
          </IconButton>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
              Name
            </label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. API Documentation"
              className="w-full h-8 px-3 text-xs rounded-lg border border-input bg-muted/30 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your text, code, documentation, or notes here…"
              rows={12}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-muted/30 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border/40">
          <Button variant="ghost" size="xs" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" size="xs" onClick={handleSubmit} disabled={!content.trim()}>
            Add Source
          </Button>
        </div>
      </div>
    </div>
  );
}
