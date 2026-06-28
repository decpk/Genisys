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
import { useMeetingDialogData } from './useMeetingDialogData'
import { styles } from './MeetingDialog.styles'
import { MetadataPanel } from './components/MetadataPanel'
import { MeetingEditorSections } from './components/MeetingEditorSections'
import type { MeetingDialogProps } from './MeetingDialog.types'

export function MeetingDialog(props: MeetingDialogProps): React.JSX.Element {
  const { open, onOpenChange } = props

  const {
    formData,
    isEditing,
    handleFieldChange,
    handleSubmit,
    parseDate,
    parseTime,
    formatTime,
  } = useMeetingDialogData(props)

  const dialogTitle = isEditing ? 'Edit Meeting' : 'New Meeting'
  const dialogDescription = isEditing ? 'Update the meeting details below.' : 'Schedule a new meeting.'
  const submitLabel = isEditing ? 'Save Changes' : 'Create Meeting'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.body}>
            <MetadataPanel
              formData={formData}
              onFieldChange={handleFieldChange}
              parseDate={parseDate}
              parseTime={parseTime}
              formatTime={formatTime}
            />
            <MeetingEditorSections
              formData={formData}
              onFieldChange={handleFieldChange}
            />
          </div>

          <DialogFooter className={styles.footer}>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
