import { useState, useMemo, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('daily-plan')
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatDailyStatus } from '../../utils/formatStatus'
import type { DPStatusFormat } from '../../DailyPlan.types'

interface StatusShareProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FORMAT_OPTIONS: { value: DPStatusFormat; label: string }[] = [
  { value: 'plain', label: 'Plain Text' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
]

export function StatusShare({ open, onOpenChange }: StatusShareProps): React.JSX.Element {
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const dailyEntries = useDailyPlanStore((s) => s.dailyEntries)

  const [format, setFormat] = useState<DPStatusFormat>('plain')
  const [copied, setCopied] = useState(false)

  const entry = dailyEntries[selectedDate]

  const formattedStatus = useMemo(() => {
    if (!entry) return 'No status entry for this date.'
    return formatDailyStatus(entry.statusContent, entry.yesterdayReview, format)
  }, [entry, format])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formattedStatus)
      setCopied(true)
      toast.success('Status copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [formattedStatus])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Daily Status</DialogTitle>
          <DialogDescription>
            Preview and copy your daily status in your preferred format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format selector */}
          <div className="flex gap-2">
            {FORMAT_OPTIONS.map((opt) => {
              const isActive = format === opt.value

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormat(opt.value)}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                    isActive && 'bg-primary text-primary-foreground border-primary',
                    !isActive && 'border-border text-muted-foreground hover:bg-accent',
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Preview */}
          <pre className="min-h-[200px] max-h-[400px] overflow-y-auto rounded-md border bg-muted/50 p-3 text-sm whitespace-pre-wrap font-mono">
            {formattedStatus}
          </pre>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleCopy}>
            {copied && <Check className="size-4 mr-1.5" />}
            {!copied && <Copy className="size-4 mr-1.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
