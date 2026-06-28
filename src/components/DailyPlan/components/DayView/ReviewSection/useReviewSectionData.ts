import { useState } from 'react'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPReview } from '../../../DailyPlan.types'
import { generateId } from '../../../utils/generateId'
import { getReviewsSubtitle } from './utils/getReviewsSubtitle'
import { computeReviewProgressPct } from './utils/computeReviewProgressPct'
import { formatReviewCountLabel } from './utils/formatReviewCountLabel'
import {
  readSectionCollapsed,
  writeSectionCollapsed,
} from "../shared/utils/sectionCollapseStorage";

interface UseReviewSectionDataArgs {
  reviews: DPReview[]
  defaultCollapsed: boolean
}

interface UseReviewSectionDataReturn {
  isCollapsed: boolean
  toggleCollapsed: () => void
  subtitle: string
  countLabel: string
  progressPct: number
  showProgressBar: boolean
  quickAddValue: string
  setQuickAddValue: (value: string) => void
  handleQuickAddKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  editingReview: DPReview | null
  reviewDialogOpen: boolean
  handleEditReview: (review: DPReview) => void
  handleReviewDialogClose: (open: boolean) => void
}

/**
 * Orchestrator hook for `ReviewSection`. Owns collapse state, derived
 * subtitle / count / progress, quick-add input state + keyboard handler, and
 * the edit-dialog state. The view layer only renders the returned values.
 */
export function useReviewSectionData(args: UseReviewSectionDataArgs): UseReviewSectionDataReturn {
  const { reviews, defaultCollapsed } = args

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() =>
    readSectionCollapsed("reviews", defaultCollapsed),
  );
  const [quickAddValue, setQuickAddValue] = useState<string>('')
  const [editingReview, setEditingReview] = useState<DPReview | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false)

  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const saveReview = useDailyPlanStore((s) => s.saveReview)

  const completedCount = reviews.filter((r) => r.status === 'completed').length
  const activeCount = reviews.length - completedCount
  const progressPct = computeReviewProgressPct(reviews.length, completedCount)

  const subtitle = getReviewsSubtitle(activeCount, completedCount)
  const countLabel = formatReviewCountLabel({ totalCount: reviews.length, completedCount })
  const showProgressBar = reviews.length > 0 && !isCollapsed

  function toggleCollapsed() {
    setIsCollapsed((prev) => {
      const next = !prev;
      writeSectionCollapsed("reviews", next);
      return next;
    });
  }

  function handleQuickAddKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const trimmed = quickAddValue.trim()
    if (!trimmed) return

    const now = new Date().toISOString()
    const newReview: DPReview = {
      id: generateId('review'),
      title: trimmed,
      description: '',
      status: 'todo',
      priority: 'medium',
      reviewType: 'general',
      link: '',
      authorName: '',
      authorAvatarUrl: '',
      scheduledDate: selectedDate,
      scheduledTime: null,
      durationMinutes: 30,
      reminderAt: null,
      sortOrder: reviews.length,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    }

    saveReview(newReview)
    setQuickAddValue('')
  }

  function handleEditReview(review: DPReview) {
    setEditingReview(review)
    setReviewDialogOpen(true)
  }

  function handleReviewDialogClose(open: boolean) {
    setReviewDialogOpen(open)
    if (!open) setEditingReview(null)
  }

  return {
    isCollapsed,
    toggleCollapsed,
    subtitle,
    countLabel,
    progressPct,
    showProgressBar,
    quickAddValue,
    setQuickAddValue,
    handleQuickAddKeyDown,
    editingReview,
    reviewDialogOpen,
    handleEditReview,
    handleReviewDialogClose,
  }
}
