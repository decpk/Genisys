import { cn } from '@/lib/utils'

import type { RequestLogFiltersProps } from './RequestLogFilters.types'
import { requestLogFiltersStyles } from './RequestLogFilters.styles'
import { useRequestLogFiltersData } from './useRequestLogFiltersData'
import { MethodSelect } from './components/MethodSelect'

export function RequestLogFilters(props: RequestLogFiltersProps) {
  const { className } = props
  const {
    method,
    status,
    pathContains,
    isDisabled,
    setMethod,
    setStatus,
    setPathContains,
  } = useRequestLogFiltersData()

  return (
    <div className={cn(requestLogFiltersStyles.container, className)}>
      <MethodSelect value={method} onValueChange={setMethod} disabled={isDisabled} />
      <input
        type="number"
        inputMode="numeric"
        placeholder="Status"
        aria-label="Filter by status code"
        value={status}
        disabled={isDisabled}
        onChange={(e) => setStatus(e.target.value)}
        className={requestLogFiltersStyles.statusInput}
      />
      <input
        type="text"
        placeholder="Path contains"
        aria-label="Filter by path substring"
        value={pathContains}
        disabled={isDisabled}
        onChange={(e) => setPathContains(e.target.value)}
        className={requestLogFiltersStyles.pathInput}
      />
    </div>
  )
}
