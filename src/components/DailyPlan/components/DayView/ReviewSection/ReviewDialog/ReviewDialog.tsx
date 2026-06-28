import { useState, useCallback, useEffect } from 'react'
import { format, parse } from 'date-fns'
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
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { cn } from '@/lib/utils'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { generateId } from '../../../../utils/generateId'
import { PRIORITY_CONFIG } from '../../../../constants'
import type { DPReview, DPPriority, DPReviewType, DPReviewFormData } from '../../../../DailyPlan.types'
import { getDefaultReviewFormData } from './utils/getDefaultReviewFormData'

interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editReview?: DPReview | null
}

const PRIORITIES: DPPriority[] = ['low', 'medium', 'high', 'urgent']

const REVIEW_TYPES: Array<{ value: DPReviewType; label: string }> = [
  { value: 'code', label: 'Code' },
  { value: 'design', label: 'Design' },
  { value: 'document', label: 'Document' },
  { value: 'pr', label: 'PR' },
  { value: 'general', label: 'General' },
]

export function ReviewDialog(props: ReviewDialogProps): React.JSX.Element {
  const { open, onOpenChange, editReview } = props
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const saveReview = useDailyPlanStore((s) => s.saveReview)

  const [formData, setFormData] = useState<DPReviewFormData>(() =>
    getDefaultReviewFormData(selectedDate),
  )

  useEffect(() => {
    if (open && editReview) {
      setFormData({
        title: editReview.title,
        description: editReview.description,
        priority: editReview.priority,
        reviewType: editReview.reviewType,
        link: editReview.link,
        authorName: editReview.authorName,
        authorAvatarUrl: editReview.authorAvatarUrl,
        scheduledDate: editReview.scheduledDate,
        scheduledTime: editReview.scheduledTime,
        durationMinutes: editReview.durationMinutes,
        reminderAt: editReview.reminderAt,
      })
    } else if (open) {
      setFormData(getDefaultReviewFormData(selectedDate))
    }
  }, [open, editReview, selectedDate])

  const handleFieldChange = useCallback(
    (field: keyof DPReviewFormData, value: string | number | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.title.trim()) return

      const now = new Date().toISOString()
      const review: DPReview = {
        id: editReview?.id ?? generateId('review'),
        title: formData.title.trim(),
        description: formData.description,
        status: editReview?.status ?? 'todo',
        priority: formData.priority,
        reviewType: formData.reviewType,
        link: formData.link,
        authorName: formData.authorName,
        authorAvatarUrl: formData.authorAvatarUrl,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        durationMinutes: formData.durationMinutes,
        reminderAt: formData.reminderAt,
        sortOrder: editReview?.sortOrder ?? 0,
        completedAt: editReview?.completedAt ?? null,
        createdAt: editReview?.createdAt ?? now,
        updatedAt: now,
      }

      saveReview(review)
      onOpenChange(false)
    },
    [formData, editReview, saveReview, onOpenChange],
  )

  const isEditing = !!editReview

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Review' : 'New Review'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the review details below.' : 'Add a new review to your daily plan.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="review-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="review-title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Review title"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="review-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="review-description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Optional description..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60 resize-none"
              rows={3}
            />
          </div>

          {/* Review type */}
          <div className="space-y-1.5">
            <label htmlFor="review-type" className="text-sm font-medium">
              Type
            </label>
            <select
              id="review-type"
              value={formData.reviewType}
              onChange={(e) => handleFieldChange('reviewType', e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60"
            >
              {REVIEW_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Link */}
          <div className="space-y-1.5">
            <label htmlFor="review-link" className="text-sm font-medium">
              Link
            </label>
            <Input
              id="review-link"
              type="url"
              value={formData.link}
              onChange={(e) => handleFieldChange('link', e.target.value)}
              placeholder="https://github.com/org/repo/pull/123"
            />
          </div>

          {/* PR author + avatar (only for PR reviews) */}
          {formData.reviewType === 'pr' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="review-author" className="text-sm font-medium">
                  Author
                </label>
                <Input
                  id="review-author"
                  value={formData.authorName}
                  onChange={(e) => handleFieldChange('authorName', e.target.value)}
                  placeholder="Whose PR is this?"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="review-author-avatar" className="text-sm font-medium">
                  Avatar URL
                </label>
                <Input
                  id="review-author-avatar"
                  type="url"
                  value={formData.authorAvatarUrl}
                  onChange={(e) => handleFieldChange('authorAvatarUrl', e.target.value)}
                  placeholder="https://…/avatar.png"
                />
              </div>
            </div>
          )}

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => {
                const cfg = PRIORITY_CONFIG[p]
                const isActive = formData.priority === p

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleFieldChange('priority', p)}
                    className={cn(
                      'flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive && cfg.bgColor,
                      isActive && cfg.color,
                      isActive && 'border-current',
                      !isActive && 'border-border text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date and Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date</label>
              <DatePicker
                value={parse(formData.scheduledDate, 'yyyy-MM-dd', new Date())}
                onChange={(date) => {
                  if (date) handleFieldChange('scheduledDate', format(date, 'yyyy-MM-dd'))
                }}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Time</label>
              <TimePicker
                value={formData.scheduledTime ? parse(formData.scheduledTime, 'HH:mm', new Date()) : undefined}
                onChange={(date) => handleFieldChange('scheduledTime', format(date, 'HH:mm'))}
              />
            </div>
          </div>

          {/* Duration and Reminder row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="review-duration" className="text-sm font-medium">
                Duration (min)
              </label>
              <Input
                id="review-duration"
                type="number"
                min={5}
                step={5}
                value={formData.durationMinutes}
                onChange={(e) =>
                  handleFieldChange('durationMinutes', parseInt(e.target.value, 10) || 30)
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reminder</label>
              <DateTimePicker
                value={formData.reminderAt ? new Date(formData.reminderAt) : undefined}
                onChange={(date) => handleFieldChange('reminderAt', date ? date.toISOString() : null)}
                placeholder="Set reminder"
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Create Review'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
