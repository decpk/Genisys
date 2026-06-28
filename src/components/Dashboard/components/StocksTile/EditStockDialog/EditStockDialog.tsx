import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import type { EditStockDialogProps } from './EditStockDialog.types'

function toNumberOrNull(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const n = Number.parseFloat(trimmed)
  return Number.isFinite(n) ? n : null
}

export function EditStockDialog({
  isOpen,
  item,
  onClose,
  onSave,
}: EditStockDialogProps): React.JSX.Element {
  const [label, setLabel] = useState('')
  const [alertAbove, setAlertAbove] = useState('')
  const [alertBelow, setAlertBelow] = useState('')
  const [customUrl, setCustomUrl] = useState('')

  useEffect(() => {
    if (!item) return
    setLabel(item.shortName ?? '')
    setAlertAbove(item.alertAbove !== null && item.alertAbove !== undefined ? String(item.alertAbove) : '')
    setAlertBelow(item.alertBelow !== null && item.alertBelow !== undefined ? String(item.alertBelow) : '')
    setCustomUrl(item.customPriceUrl ?? '')
  }, [item])

  if (!item) {
    return (
      <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <DialogContent />
      </Dialog>
    )
  }

  const handleSave = (): void => {
    onSave(item.id, {
      shortName: label.trim() === '' ? item.symbol : label.trim(),
      alertAbove: toNumberOrNull(alertAbove),
      alertBelow: toNumberOrNull(alertBelow),
      customPriceUrl: customUrl.trim() === '' ? null : customUrl.trim(),
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Edit {item.symbol}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Customize the display label, price alerts, and an optional custom price feed URL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Display label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={item.symbol}
              className="h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Alert above</label>
              <Input
                value={alertAbove}
                onChange={(e) => setAlertAbove(e.target.value)}
                placeholder="e.g. 200"
                inputMode="decimal"
                className="h-8 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Alert below</label>
              <Input
                value={alertBelow}
                onChange={(e) => setAlertBelow(e.target.value)}
                placeholder="e.g. 150"
                inputMode="decimal"
                className="h-8 text-sm tabular-nums"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Custom price URL <span className="opacity-50">(returns JSON, optional)</span>
            </label>
            <Input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://api.example.com/price.json"
              className="h-8 text-sm font-mono"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
