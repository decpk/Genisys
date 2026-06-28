import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import type { NewsInterest } from '@/store/news-tile-store'
import { getCategoryEntry } from './news-categories'

interface EditInterestDialogProps {
  isOpen: boolean
  interest: NewsInterest | null
  onClose: () => void
  onSave: (id: string, patch: { label: string; customPrompt: string; resolvedUrl: string | null }) => void
}

export function EditInterestDialog({
  isOpen,
  interest,
  onClose,
  onSave,
}: EditInterestDialogProps): React.JSX.Element {
  const [label, setLabel] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [resolvedUrl, setResolvedUrl] = useState('')
  const [resetUrl, setResetUrl] = useState(false)

  useEffect(() => {
    if (isOpen && interest) {
      setLabel(interest.label)
      setCustomPrompt(interest.customPrompt)
      setResolvedUrl(interest.resolvedUrl ?? '')
      setResetUrl(false)
    }
  }, [isOpen, interest])

  const handleSave = (): void => {
    if (!interest || !label.trim()) return
    onSave(interest.id, {
      label: label.trim(),
      customPrompt: customPrompt.trim(),
      resolvedUrl: resetUrl ? null : (resolvedUrl.trim() || null),
    })
    onClose()
  }

  const category = interest ? getCategoryEntry(interest.categoryKey) : null
  const Icon = category?.icon

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            {Icon && <Icon size={16} className="text-primary" />}
            Edit Interest
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Adjust the label, prompt, or source URL for this interest.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Refinement prompt
            </label>
            <Input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Leave empty for general news"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Source URL (leave empty to let AI pick)
            </label>
            <Input
              value={resolvedUrl}
              onChange={(e) => {
                setResolvedUrl(e.target.value)
                setResetUrl(false)
              }}
              placeholder="https://..."
              className="h-8 text-sm font-mono"
            />
            {interest?.resolvedUrl && (
              <Button
                onClick={() => {
                  setResolvedUrl('')
                  setResetUrl(true)
                }}
                variant="link"
                size="xs"
                className="mt-1 h-auto p-0"
              >
                Let AI re-discover source URL
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm" disabled={!label.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
