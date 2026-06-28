import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getTomorrow } from '@/components/DailyPlan/utils/formatDate'
import { formatDateMenuLabel } from '@/components/DailyPlan/utils/formatDateMenuLabel'

import { pluralizeNoun } from '../../utils/pluralizeNoun'
import { sectionMoveDialogStyles } from './SectionMoveDialog.styles'
import { useSectionMoveDialogData } from './useSectionMoveDialogData'
import type { SectionMoveDialogProps } from './SectionMoveDialog.types'

export function SectionMoveDialog(props: SectionMoveDialogProps): React.JSX.Element {
  const { open, mode, itemCount, itemNoun, sectionTitle, onCancel } = props
  const { selectedDate, setSelectedDate, canConfirm, handleConfirm } =
    useSectionMoveDialogData(props)

  const pluralNoun = pluralizeNoun(itemNoun, itemCount)
  const tomorrowLabel = formatDateMenuLabel(getTomorrow())
  const title = `Move ${itemCount} ${pluralNoun}`
  const confirmLabel = `Move ${itemCount} ${pluralNoun}`

  let bodyNode: React.JSX.Element | null = null
  if (mode === 'tomorrow') {
    bodyNode = (
      <DialogDescription className={sectionMoveDialogStyles.description}>
        This will move {itemCount} {pluralNoun} from {sectionTitle} to tomorrow ({tomorrowLabel}).
      </DialogDescription>
    )
  } else if (mode === 'pick') {
    bodyNode = (
      <div className={sectionMoveDialogStyles.calendarWrap}>
        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
      </div>
    )
  }

  function handleOpenChange(next: boolean): void {
    if (!next) {
      onCancel()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={sectionMoveDialogStyles.content}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className={sectionMoveDialogStyles.body}>{bodyNode}</div>
        <DialogFooter className={sectionMoveDialogStyles.footer}>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={!canConfirm} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
