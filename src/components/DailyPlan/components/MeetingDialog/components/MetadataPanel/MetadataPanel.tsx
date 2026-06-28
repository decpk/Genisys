import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { FormSelect } from '../FormSelect'
import {
  MEETING_STATUS_OPTIONS,
  MEETING_TYPE_OPTIONS,
  MEETING_PRIORITY_OPTIONS,
} from '../../MeetingDialog.types'
import { metadataPanelStyles as styles } from './MetadataPanel.styles'
import type { MetadataPanelProps } from './MetadataPanel.types'

export function MetadataPanel(props: MetadataPanelProps): React.JSX.Element {
  const { formData, onFieldChange, parseDate, parseTime, formatTime } = props

  const showCancelReason = formData.status === 'cancelled' || formData.status === 'postponed'
  const cancelReasonLabel = formData.status === 'cancelled' ? 'Cancellation Reason' : 'Postponement Reason'
  const cancelReasonPlaceholder = formData.status === 'cancelled' ? 'Why was it cancelled...' : 'Why was it postponed...'

  const cancelReasonField = showCancelReason ? (
    <div className={styles.fieldGroup}>
      <label htmlFor="meeting-cancel-reason" className={styles.label}>
        {cancelReasonLabel}
      </label>
      <textarea
        id="meeting-cancel-reason"
        value={formData.cancelReason}
        onChange={(e) => onFieldChange('cancelReason', e.target.value)}
        placeholder={cancelReasonPlaceholder}
        className={styles.textarea}
        rows={2}
      />
    </div>
  ) : null

  return (
    <div className={styles.root}>
      {/* Title */}
      <div className={styles.fieldGroup}>
        <label htmlFor="meeting-title" className={styles.label}>
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="meeting-title"
          value={formData.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          placeholder="Meeting title"
          required
          autoFocus
        />
      </div>

      {/* Status / Type / Priority */}
      <div className={styles.selectRow}>
        <FormSelect
          label="Status"
          options={MEETING_STATUS_OPTIONS}
          value={formData.status}
          onSelect={(v) => onFieldChange('status', v)}
        />
        <FormSelect
          label="Type"
          options={MEETING_TYPE_OPTIONS}
          value={formData.meetingType}
          onSelect={(v) => onFieldChange('meetingType', v)}
        />
        <FormSelect
          label="Priority"
          options={MEETING_PRIORITY_OPTIONS}
          value={formData.priority}
          onSelect={(v) => onFieldChange('priority', v)}
        />
      </div>

      {/* Date + Reminder */}
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Date</label>
          <DatePicker
            value={parseDate(formData.scheduledDate)}
            onChange={(date) => {
              if (date) onFieldChange('scheduledDate', format(date, 'yyyy-MM-dd'))
            }}
            className="w-full"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Reminder</label>
          <DateTimePicker
            value={formData.reminderAt ? new Date(formData.reminderAt) : undefined}
            onChange={(date) => onFieldChange('reminderAt', date ? date.toISOString() : null)}
            placeholder="Set reminder"
            className="w-full"
          />
        </div>
      </div>

      {/* Start / End Time */}
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Start Time <span className="text-destructive">*</span>
          </label>
          <TimePicker
            value={parseTime(formData.startTime)}
            onChange={(date) => onFieldChange('startTime', formatTime(date))}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            End Time <span className="text-destructive">*</span>
          </label>
          <TimePicker
            value={parseTime(formData.endTime)}
            onChange={(date) => onFieldChange('endTime', formatTime(date))}
          />
        </div>
      </div>

      {/* Location + Meeting Link */}
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor="meeting-location" className={styles.label}>Location</label>
          <Input
            id="meeting-location"
            value={formData.location}
            onChange={(e) => onFieldChange('location', e.target.value)}
            placeholder="Office, Room 3A..."
          />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="meeting-link" className={styles.label}>Meeting Link</label>
          <Input
            id="meeting-link"
            type="url"
            value={formData.meetingLink}
            onChange={(e) => onFieldChange('meetingLink', e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Attendees */}
      <div className={styles.fieldGroup}>
        <label htmlFor="meeting-attendees" className={styles.label}>Attendees</label>
        <Input
          id="meeting-attendees"
          value={formData.attendees}
          onChange={(e) => onFieldChange('attendees', e.target.value)}
          placeholder="John, Jane, Alex..."
        />
      </div>

      {/* Description */}
      <div className={styles.fieldGroup}>
        <label htmlFor="meeting-description" className={styles.label}>Description</label>
        <textarea
          id="meeting-description"
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Optional description..."
          className={styles.textarea}
          rows={3}
        />
      </div>

      {/* Cancel Reason - conditional */}
      {cancelReasonField}
    </div>
  )
}
