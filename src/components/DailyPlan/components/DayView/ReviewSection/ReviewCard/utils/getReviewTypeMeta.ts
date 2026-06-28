import type { DPReviewType } from '../../../../../DailyPlan.types'

interface ReviewTypeMeta {
  label: string
  pillClass: string
}

const REVIEW_TYPE_META: Record<DPReviewType, ReviewTypeMeta> = {
  code: { label: 'Code', pillClass: 'bg-violet-500/12 text-violet-400 ring-violet-500/25' },
  design: { label: 'Design', pillClass: 'bg-pink-500/12 text-pink-400 ring-pink-500/25' },
  document: { label: 'Doc', pillClass: 'bg-amber-500/12 text-amber-400 ring-amber-500/25' },
  pr: { label: 'PR', pillClass: 'bg-indigo-500/12 text-indigo-400 ring-indigo-500/25' },
  general: { label: 'General', pillClass: 'bg-slate-500/12 text-slate-300 ring-slate-400/25' },
}

/** Pure: returns the display label + pill classes for a review type. */
export function getReviewTypeMeta(reviewType: DPReviewType): ReviewTypeMeta {
  return REVIEW_TYPE_META[reviewType] ?? REVIEW_TYPE_META.general
}
