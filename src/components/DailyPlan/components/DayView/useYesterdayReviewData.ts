import { useCallback, useState } from 'react'
import { getToday } from '../../utils/formatDate'
import { getDismissedDateForKey } from '../../utils/getDismissedDateForKey'
import { setDismissedDateForKey } from '../../utils/setDismissedDateForKey'
import { YESTERDAY_REVIEW_DISMISSED_KEY } from './YesterdayReview.constants'

export function useYesterdayReviewData(completedCount: number): {
  visible: boolean
  isExpanded: boolean
  toggleExpanded: () => void
  dismiss: () => void
} {
  const today = getToday()
  const [isExpanded, setIsExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(
    () => getDismissedDateForKey(YESTERDAY_REVIEW_DISMISSED_KEY) === today
  )

  const toggleExpanded = useCallback(() => setIsExpanded((v) => !v), [])

  const dismiss = useCallback(() => {
    setDismissedDateForKey(YESTERDAY_REVIEW_DISMISSED_KEY, today)
    setDismissed(true)
  }, [today])

  const visible = completedCount > 0 && !dismissed

  return { visible, isExpanded, toggleExpanded, dismiss }
}
