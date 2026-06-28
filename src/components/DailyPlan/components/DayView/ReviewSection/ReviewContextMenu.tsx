import { Pencil, Copy, Flag, Tag, Trash2, MoreVertical } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPReview, DPPriority, DPReviewType } from '../../../DailyPlan.types'
import { PRIORITY_CONFIG } from '../../../constants'
import { generateId } from '../../../utils/generateId'
import { DeleteConfirmationDialog } from '../../dialogs/DeleteConfirmationDialog'
import { useDailyPlanConfirmation } from '@/hooks/useDailyPlanConfirmation'

const PRIORITIES: DPPriority[] = ['urgent', 'high', 'medium', 'low']

const PRIORITY_DOT: Record<DPPriority, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
}

const REVIEW_TYPES: Array<{ value: DPReviewType; label: string; dot: string }> = [
  { value: 'code', label: 'Code', dot: 'bg-violet-500' },
  { value: 'design', label: 'Design', dot: 'bg-pink-500' },
  { value: 'document', label: 'Document', dot: 'bg-amber-500' },
  { value: 'pr', label: 'PR', dot: 'bg-indigo-500' },
  { value: 'general', label: 'General', dot: 'bg-slate-400' },
]

interface MenuItemsProps {
  review: DPReview
  onEdit: () => void
  onDuplicate: () => void
  onChangePriority: (p: DPPriority) => void
  onChangeType: (t: DPReviewType) => void
  onDelete: () => void
  variant: 'context' | 'dropdown'
}

function ReviewMenuItems(props: MenuItemsProps): React.JSX.Element {
  const { review, onEdit, onDuplicate, onChangePriority, onChangeType, onDelete, variant } = props
  const Item = variant === 'context' ? ContextMenuItem : DropdownMenuItem
  const Separator = variant === 'context' ? ContextMenuSeparator : DropdownMenuSeparator
  const Sub = variant === 'context' ? ContextMenuSub : DropdownMenuSub
  const SubTrigger = variant === 'context' ? ContextMenuSubTrigger : DropdownMenuSubTrigger
  const SubContent = variant === 'context' ? ContextMenuSubContent : DropdownMenuSubContent

  return (
    <>
      <Item onClick={onEdit}>
        <Pencil size={15} />
        Edit
      </Item>
      <Item onClick={onDuplicate}>
        <Copy size={15} />
        Duplicate
      </Item>

      <Separator />

      <Sub>
        <SubTrigger>
          <Flag size={15} />
          Priority
        </SubTrigger>
        <SubContent>
          {PRIORITIES.map((p) => {
            const cfg = PRIORITY_CONFIG[p]
            const isActive = review.priority === p
            return (
              <Item
                key={p}
                onClick={() => onChangePriority(p)}
                className={isActive ? 'font-semibold' : ''}
              >
                <span className={`size-2 rounded-full shrink-0 ${PRIORITY_DOT[p]}`} />
                {cfg.label}
                {isActive && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
              </Item>
            )
          })}
        </SubContent>
      </Sub>

      <Sub>
        <SubTrigger>
          <Tag size={15} />
          Type
        </SubTrigger>
        <SubContent>
          {REVIEW_TYPES.map((t) => {
            const isActive = review.reviewType === t.value
            return (
              <Item
                key={t.value}
                onClick={() => onChangeType(t.value)}
                className={isActive ? 'font-semibold' : ''}
              >
                <span className={`size-2 rounded-full shrink-0 ${t.dot}`} />
                {t.label}
                {isActive && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
              </Item>
            )
          })}
        </SubContent>
      </Sub>

      <Separator />

      <Item onClick={onDelete} className="text-destructive">
        <Trash2 size={15} className="text-destructive" />
        Delete
      </Item>
    </>
  )
}

function useReviewActions(
  review: DPReview,
  saveReview: (r: DPReview) => void,
  onEdit: () => void,
  onDelete: () => void,
) {
  return {
    onEdit,
    onDuplicate() {
      const now = new Date().toISOString()
      saveReview({
        ...review,
        id: generateId('review'),
        title: `${review.title} (copy)`,
        status: 'todo',
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      })
    },
    onChangePriority(priority: DPPriority) {
      saveReview({ ...review, priority, updatedAt: new Date().toISOString() })
    },
    onChangeType(reviewType: DPReviewType) {
      saveReview({ ...review, reviewType, updatedAt: new Date().toISOString() })
    },
    onDelete,
  }
}

interface ReviewContextMenuProps {
  review: DPReview
  children: React.ReactNode
  onEdit: (review: DPReview) => void
}

export function ReviewContextMenu(props: ReviewContextMenuProps): React.JSX.Element {
  const { review, children, onEdit } = props
  const saveReview = useDailyPlanStore((s) => s.saveReview)
  const removeReview = useDailyPlanStore((s) => s.removeReview)

  const confirmation = useDailyPlanConfirmation()

  const handleDeleteClick = () => {
    confirmation.openConfirmation(
      'Delete Review',
      'Are you sure you want to delete',
      review.title,
      async () => {
        await removeReview(review.id, review.scheduledDate)
      },
      [],
    )
  }

  const actions = useReviewActions(review, saveReview, () => onEdit(review), handleDeleteClick)

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
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ReviewMenuItems review={review} variant="context" {...actions} />
        </ContextMenuContent>
      </ContextMenu>
    </>
  )
}

interface ReviewDropdownMenuProps {
  review: DPReview
  onEdit: (review: DPReview) => void
  className?: string
}

export function ReviewDropdownMenu(props: ReviewDropdownMenuProps): React.JSX.Element {
  const { review, onEdit, className } = props
  const saveReview = useDailyPlanStore((s) => s.saveReview)
  const removeReview = useDailyPlanStore((s) => s.removeReview)

  const confirmation = useDailyPlanConfirmation()

  const handleDeleteClick = () => {
    confirmation.openConfirmation(
      'Delete Review',
      'Are you sure you want to delete',
      review.title,
      async () => {
        await removeReview(review.id, review.scheduledDate)
      },
      [],
    )
  }

  const actions = useReviewActions(review, saveReview, () => onEdit(review), handleDeleteClick)

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={className} onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <ReviewMenuItems review={review} variant="dropdown" {...actions} />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
