import { useCallback, useState } from 'react'
import { getCarryOverDismissedDate } from '../utils/getCarryOverDismissedDate'
import { setCarryOverDismissedDate } from '../utils/setCarryOverDismissedDate'
import { isDismissedForToday } from '../utils/isDismissedForToday'

export function useCarryOverDismiss(today: string): { dismissed: boolean; dismiss: () => void } {
  const [dismissed, setDismissed] = useState(() =>
    isDismissedForToday(getCarryOverDismissedDate(), today)
  )

  const dismiss = useCallback(() => {
    setCarryOverDismissedDate(today)
    setDismissed(true)
  }, [today])

  return { dismissed, dismiss }
}
