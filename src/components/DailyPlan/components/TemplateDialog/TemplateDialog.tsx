import { useState, useCallback, useEffect } from 'react'
import { Plus, Minus, Trash2 } from 'lucide-react'
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
import { Tooltip } from '@/components/Tooltip'
import { TimePicker } from '@/components/ui/time-picker'
import { cn } from '@/lib/utils'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { generateId } from '../../utils/generateId'
import { PRIORITY_CONFIG } from '../../constants'
import { DeleteConfirmationDialog } from '../dialogs/DeleteConfirmationDialog'
import { useDailyPlanConfirmation } from '@/hooks/useDailyPlanConfirmation'
import type {
  DPTemplate,
  DPTemplateType,
  DPTemplateContent,
  DPPriority,
} from '../../DailyPlan.types'

interface TemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTemplate?: DPTemplate | null
}

interface TaskRow {
  title: string
  priority: DPPriority
  scheduledTime: string
}

interface MeetingRow {
  title: string
  startTime: string
  endTime: string
}

const TEMPLATE_TYPES: { value: DPTemplateType; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'professional', label: 'Professional' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'custom', label: 'Custom' },
]

const PRIORITIES: DPPriority[] = ['low', 'medium', 'high', 'urgent']

function getDefaultState() {
  return {
    name: '',
    description: '',
    templateType: 'custom' as DPTemplateType,
    taskRows: [{ title: '', priority: 'medium' as DPPriority, scheduledTime: '09:00' }],
    meetingRows: [{ title: '', startTime: '10:00', endTime: '10:30' }],
    statusTemplate: '## Yesterday\n- \n\n## Today\n- \n\n## Blockers\n- None',
  }
}

export function TemplateDialog({
  open,
  onOpenChange,
  editTemplate,
}: TemplateDialogProps): React.JSX.Element {
  const saveTemplate = useDailyPlanStore((s) => s.saveTemplate)
  const removeTemplate = useDailyPlanStore((s) => s.removeTemplate)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [templateType, setTemplateType] = useState<DPTemplateType>('custom')
  const [taskRows, setTaskRows] = useState<TaskRow[]>([
    { title: '', priority: 'medium', scheduledTime: '09:00' },
  ])
  const [meetingRows, setMeetingRows] = useState<MeetingRow[]>([
    { title: '', startTime: '10:00', endTime: '10:30' },
  ])
  const [statusTemplate, setStatusTemplate] = useState(
    '## Yesterday\n- \n\n## Today\n- \n\n## Blockers\n- None',
  )

  const confirmation = useDailyPlanConfirmation()
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  useEffect(() => {
    if (open && editTemplate) {
      setName(editTemplate.name)
      setDescription(editTemplate.description)
      setTemplateType(editTemplate.templateType)

      try {
        const content: DPTemplateContent = JSON.parse(editTemplate.content)
        setTaskRows(
          content.tasks.length > 0
            ? content.tasks.map((t) => ({
                title: t.title,
                priority: t.priority,
                scheduledTime: t.scheduledTime ?? '09:00',
              }))
            : [{ title: '', priority: 'medium', scheduledTime: '09:00' }],
        )
        setMeetingRows(
          content.meetings.length > 0
            ? content.meetings.map((m) => ({
                title: m.title,
                startTime: m.startTime,
                endTime: m.endTime,
              }))
            : [{ title: '', startTime: '10:00', endTime: '10:30' }],
        )
        setStatusTemplate(content.statusTemplate || '')
      } catch {
        setTaskRows([{ title: '', priority: 'medium', scheduledTime: '09:00' }])
        setMeetingRows([{ title: '', startTime: '10:00', endTime: '10:30' }])
        setStatusTemplate('')
      }
    } else if (open) {
      const defaults = getDefaultState()
      setName(defaults.name)
      setDescription(defaults.description)
      setTemplateType(defaults.templateType)
      setTaskRows(defaults.taskRows)
      setMeetingRows(defaults.meetingRows)
      setStatusTemplate(defaults.statusTemplate)
    }
  }, [open, editTemplate])

  const handleDeleteConfirm = async () => {
    if (pendingDelete) {
      await removeTemplate(pendingDelete)
      setPendingDelete(null)
      confirmation.closeConfirmation()
      onOpenChange(false)
    }
  }

  const handleDeleteClick = () => {
    if (editTemplate) {
      setPendingDelete(editTemplate.id)
      confirmation.openConfirmation(
        'Delete Template',
        'Are you sure you want to delete',
        editTemplate.name,
        handleDeleteConfirm,
        []
      )
    }
  }

  // Task row handlers
  const handleAddTaskRow = useCallback(() => {
    setTaskRows((prev) => [...prev, { title: '', priority: 'medium', scheduledTime: '09:00' }])
  }, [])

  const handleRemoveTaskRow = useCallback((index: number) => {
    setTaskRows((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleTaskRowChange = useCallback(
    (index: number, field: keyof TaskRow, value: string) => {
      setTaskRows((prev) =>
        prev.map((row, i) => {
          if (i !== index) return row
          return { ...row, [field]: value }
        }),
      )
    },
    [],
  )

  // Meeting row handlers
  const handleAddMeetingRow = useCallback(() => {
    setMeetingRows((prev) => [...prev, { title: '', startTime: '10:00', endTime: '10:30' }])
  }, [])

  const handleRemoveMeetingRow = useCallback((index: number) => {
    setMeetingRows((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleMeetingRowChange = useCallback(
    (index: number, field: keyof MeetingRow, value: string) => {
      setMeetingRows((prev) =>
        prev.map((row, i) => {
          if (i !== index) return row
          return { ...row, [field]: value }
        }),
      )
    },
    [],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!name.trim()) return

      const contentObj: DPTemplateContent = {
        tasks: taskRows
          .filter((r) => r.title.trim())
          .map((r) => ({
            title: r.title.trim(),
            priority: r.priority,
            scheduledTime: r.scheduledTime || null,
            durationMinutes: 30,
            categoryId: null,
          })),
        meetings: meetingRows
          .filter((r) => r.title.trim())
          .map((r) => ({
            title: r.title.trim(),
            startTime: r.startTime,
            endTime: r.endTime,
            location: '',
          })),
        statusTemplate,
      }

      const now = new Date().toISOString()
      const template: DPTemplate = {
        id: editTemplate?.id ?? generateId('tmpl'),
        name: name.trim(),
        description: description.trim(),
        templateType,
        content: JSON.stringify(contentObj),
        isBuiltIn: false,
        sortOrder: editTemplate?.sortOrder ?? 0,
        createdAt: editTemplate?.createdAt ?? now,
        updatedAt: now,
      }

      saveTemplate(template)
      onOpenChange(false)
    },
    [
      name,
      description,
      templateType,
      taskRows,
      meetingRows,
      statusTemplate,
      editTemplate,
      saveTemplate,
      onOpenChange,
    ],
  )

  const isEditing = !!editTemplate

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={confirmation.isOpen}
        onConfirm={confirmation.handleConfirm}
        onCancel={confirmation.handleCancel}
        title={confirmation.title}
        description={confirmation.description}
        itemName={confirmation.itemName}
        warnings={confirmation.warnings}
        isLoading={confirmation.isLoading}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Template" : "New Template"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your template configuration."
                : "Create a reusable daily plan template."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="tmpl-name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="tmpl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template name"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="tmpl-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="tmpl-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60 resize-none"
                rows={2}
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label htmlFor="tmpl-type" className="text-sm font-medium">
                Type
              </label>
              <select
                id="tmpl-type"
                value={templateType}
                onChange={(e) =>
                  setTemplateType(e.target.value as DPTemplateType)
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60"
              >
                {TEMPLATE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tasks section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Tasks</label>
                <Tooltip content="Add task row">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleAddTaskRow}
                  >
                    <Plus className="size-4" />
                  </Button>
                </Tooltip>
              </div>
              <div className="space-y-2">
                {taskRows.map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={row.title}
                      onChange={(e) =>
                        handleTaskRowChange(index, "title", e.target.value)
                      }
                      placeholder="Task title"
                      className="flex-1"
                    />
                    <select
                      value={row.priority}
                      onChange={(e) =>
                        handleTaskRowChange(index, "priority", e.target.value)
                      }
                      className="h-9 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {PRIORITY_CONFIG[p].label}
                        </option>
                      ))}
                    </select>
                    <TimePicker
                      value={
                        row.scheduledTime
                          ? parse(row.scheduledTime, "HH:mm", new Date())
                          : undefined
                      }
                      onChange={(date) =>
                        handleTaskRowChange(
                          index,
                          "scheduledTime",
                          format(date, "HH:mm"),
                        )
                      }
                    />
                    <Tooltip content="Remove task">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveTaskRow(index)}
                        disabled={taskRows.length <= 1}
                      >
                        <Minus className="size-4" />
                      </Button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>

            {/* Meetings section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Meetings</label>
                <Tooltip content="Add meeting row">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleAddMeetingRow}
                  >
                    <Plus className="size-4" />
                  </Button>
                </Tooltip>
              </div>
              <div className="space-y-2">
                {meetingRows.map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={row.title}
                      onChange={(e) =>
                        handleMeetingRowChange(index, "title", e.target.value)
                      }
                      placeholder="Meeting title"
                      className="flex-1"
                    />
                    <TimePicker
                      value={parse(row.startTime, "HH:mm", new Date())}
                      onChange={(date) =>
                        handleMeetingRowChange(
                          index,
                          "startTime",
                          format(date, "HH:mm"),
                        )
                      }
                    />
                    <TimePicker
                      value={parse(row.endTime, "HH:mm", new Date())}
                      onChange={(date) =>
                        handleMeetingRowChange(
                          index,
                          "endTime",
                          format(date, "HH:mm"),
                        )
                      }
                    />
                    <Tooltip content="Remove meeting">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveMeetingRow(index)}
                        disabled={meetingRows.length <= 1}
                      >
                        <Minus className="size-4" />
                      </Button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Template */}
            <div className="space-y-1.5">
              <label htmlFor="tmpl-status" className="text-sm font-medium">
                Status Template
              </label>
              <textarea
                id="tmpl-status"
                value={statusTemplate}
                onChange={(e) => setStatusTemplate(e.target.value)}
                placeholder="## Yesterday\n- \n\n## Today\n- "
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60 resize-none"
                rows={5}
              />
            </div>

            <DialogFooter className="flex-row gap-2 justify-between sm:justify-between">
              <div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteClick}
                    className="gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Template
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">
                  {isEditing ? "Save Changes" : "Create Template"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
