import { useMemo, useState } from 'react'
import { Pencil, Play, Plus } from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('daily-plan')
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Tooltip } from '@/components/Tooltip'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatDate } from '../../utils/formatDate'
import { TemplateDialog } from '../TemplateDialog/TemplateDialog'
import type { DPTemplate, DPTemplateContent, DPTemplateType } from '../../DailyPlan.types'

const TYPE_BADGE_COLORS: Record<DPTemplateType, string> = {
  student: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  professional: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  freelancer: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  custom: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
}

function parseTemplateContent(template: DPTemplate): DPTemplateContent | null {
  try {
    return JSON.parse(template.content) as DPTemplateContent
  } catch {
    return null
  }
}

export function TemplateList(): React.JSX.Element {
  const templates = useDailyPlanStore((s) => s.templates)
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const applyTemplate = useDailyPlanStore((s) => s.applyTemplate)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<DPTemplate | null>(null)
  const [confirmTemplate, setConfirmTemplate] = useState<DPTemplate | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const confirmContent = useMemo(
    () => (confirmTemplate ? parseTemplateContent(confirmTemplate) : null),
    [confirmTemplate],
  )

  const handleApply = async () => {
    if (!confirmTemplate) return
    setIsApplying(true)
    try {
      const result = await applyTemplate(confirmTemplate.id, selectedDate)
      toast.success(
        `Template "${confirmTemplate.name}" applied — ${result.tasksCreated} tasks, ${result.meetingsCreated} meetings created`,
      )
      setConfirmTemplate(null)
    } catch (err) {
      toast.error(`Failed to apply template: ${(err as Error).message}`)
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Templates
        </span>
        <Tooltip content="Add template">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="size-3" />
          </Button>
        </Tooltip>
      </div>
      <div className="space-y-1">
        {templates.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">No templates available</p>
        )}
        {templates.map((tpl) => (
          <ContextMenu key={tpl.id}>
            <ContextMenuTrigger asChild>
              <button
                onClick={() => setConfirmTemplate(tpl)}
                className="flex items-center justify-between gap-2 w-full rounded-md px-2 py-1.5 text-xs hover:bg-muted/80 transition-colors cursor-pointer text-left"
              >
                <span className="truncate">{tpl.name}</span>
                <span
                  className={cn(
                    'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium capitalize',
                    TYPE_BADGE_COLORS[tpl.templateType] ?? TYPE_BADGE_COLORS.custom,
                  )}
                >
                  {tpl.templateType}
                </span>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => setConfirmTemplate(tpl)}>
                <Play className="size-3.5 mr-2" />
                Apply
              </ContextMenuItem>
              <ContextMenuItem onClick={() => { setEditTemplate(tpl); setDialogOpen(true) }}>
                <Pencil className="size-3.5 mr-2" />
                Edit
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditTemplate(null)
        }}
        editTemplate={editTemplate}
      />

      <AlertDialog open={!!confirmTemplate} onOpenChange={(open) => !open && setConfirmTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Template</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Apply <span className="font-medium text-foreground">"{confirmTemplate?.name}"</span> to{' '}
                  <span className="font-medium text-foreground">{formatDate(selectedDate)}</span>?
                </p>
                {confirmContent && (
                  <p className="text-xs text-muted-foreground">
                    This will create {confirmContent.tasks?.length ?? 0} task{(confirmContent.tasks?.length ?? 0) !== 1 ? 's' : ''} and{' '}
                    {confirmContent.meetings?.length ?? 0} meeting{(confirmContent.meetings?.length ?? 0) !== 1 ? 's' : ''}.
                    Items will be added alongside any existing items.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApplying}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApply} disabled={isApplying}>
              {isApplying ? 'Applying…' : 'Apply'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
