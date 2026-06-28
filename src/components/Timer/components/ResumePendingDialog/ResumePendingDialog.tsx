import { useState } from 'react'
import { Play, Timer as TimerIcon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import { formatTimerDisplay } from '../../utils/formatTimerDisplay'
import { getThemeById } from '../../utils/getThemeById'

import type { ResumePendingDialogProps } from './ResumePendingDialog.types'

export function ResumePendingDialog(props: ResumePendingDialogProps): React.JSX.Element {
  const { pending, onResume, onDismiss } = props
  const [selected, setSelected] = useState<Set<string>>(() => new Set(pending.map((p) => p.id)))

  const isOpen = pending.length > 0
  const allIds = pending.map((p) => p.id)
  const selectedIds = allIds.filter((id) => selected.has(id))
  const noneSelected = selectedIds.length === 0

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) onDismiss()
  }

  const handleResume = () => onResume(selectedIds)
  const handleNotNow = () => onDismiss()

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TimerIcon size={18} />
            </div>
            <div>
              <DialogTitle>Resume timers?</DialogTitle>
              <DialogDescription className="mt-1">
                {pending.length === 1
                  ? '1 timer was running when Genisys last closed.'
                  : `${pending.length} timers were running when Genisys last closed.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 max-h-72 overflow-auto -mx-1 px-1">
          {pending.map((inst) => {
            const checked = selected.has(inst.id)
            const theme = getThemeById(inst.themeId)
            const ringColor = theme?.ringColor ?? '#0ea5e9'
            const showRemaining = inst.mode !== 'stopwatch'
            const display = showRemaining ? inst.remainingSec : inst.elapsedSec
            return (
              <label
                key={inst.id}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 hover:bg-card px-3 py-2 cursor-pointer transition-colors"
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(inst.id)} />
                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: ringColor }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{inst.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {inst.mode}
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums shrink-0">
                  {formatTimerDisplay(display)}
                </span>
              </label>
            )
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleNotNow}>
            Not now
          </Button>
          <Button onClick={handleResume} disabled={noneSelected}>
            <Play size={14} />
            <span className="ml-1">
              {noneSelected
                ? 'Resume'
                : selectedIds.length === allIds.length
                  ? 'Resume all'
                  : `Resume ${selectedIds.length}`}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
