import type { HttpMethodOption } from './components/MethodSelect'

export interface RequestLogFiltersProps {
  /** Optional className passthrough for the filter bar container. */
  className?: string
}

export interface RequestLogFiltersState {
  method: HttpMethodOption
  status: string
  pathContains: string
}
