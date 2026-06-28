import { useEffect, useMemo, useState } from 'react'

import { useMockServerStore } from '@/store/mock-server-store'

import type { HttpMethodOption } from './components/MethodSelect'
import { PATH_DEBOUNCE_MS } from './RequestLogFilters.styles'

interface UseRequestLogFiltersData {
  method: HttpMethodOption
  status: string
  pathContains: string
  isDisabled: boolean
  setMethod: (method: HttpMethodOption) => void
  setStatus: (status: string) => void
  setPathContains: (pathContains: string) => void
}

function toStatusNumber(status: string): number | undefined {
  const trimmed = status.trim()
  if (trimmed === '') return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function useRequestLogFiltersData(): UseRequestLogFiltersData {
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const loadRequestLogs = useMockServerStore((s) => s.loadRequestLogs)

  const [method, setMethod] = useState<HttpMethodOption>('ALL')
  const [status, setStatus] = useState('')
  const [pathContains, setPathContains] = useState('')
  const [debouncedPath, setDebouncedPath] = useState('')

  // Debounce free-text path input; method/status apply immediately.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPath(pathContains), PATH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [pathContains])

  // Sole loader: runs on mount, on server change, and on every applied filter change.
  useEffect(() => {
    if (selectedServerId === null) return
    const methodParam = method === 'ALL' ? undefined : method
    const statusParam = toStatusNumber(status)
    const trimmedPath = debouncedPath.trim()
    const pathParam = trimmedPath === '' ? undefined : trimmedPath
    void loadRequestLogs({
      serverId: selectedServerId,
      method: methodParam,
      status: statusParam,
      pathContains: pathParam,
    })
  }, [selectedServerId, method, status, debouncedPath, loadRequestLogs])

  const isDisabled = useMemo(() => selectedServerId === null, [selectedServerId])

  return {
    method,
    status,
    pathContains,
    isDisabled,
    setMethod,
    setStatus,
    setPathContains,
  }
}
