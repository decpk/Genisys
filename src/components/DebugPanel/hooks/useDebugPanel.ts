import { useCallback, useDeferredValue, useMemo, useRef, useState } from 'react'

import { useDebugStore } from '@/store/debug-store'
import type { RequestStatus } from '@/store/debug-store'

import type { DebugStats, UseDebugPanelReturn } from './useDebugPanel.types'

export function useDebugPanel(): UseDebugPanelReturn {
  const requests = useDebugStore((s) => s.requests)
  const isIntercepting = useDebugStore((s) => s.isIntercepting)
  const clearRequests = useDebugStore((s) => s.clearRequests)
  const toggleIntercepting = useDebugStore((s) => s.toggleIntercepting)

  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const deferredSearchQuery = useDeferredValue(searchQuery)

  const filteredRequests = useMemo(() => {
    let filtered = requests

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase()
      filtered = filtered.filter((r) => r.channel.toLowerCase().includes(query))
    }

    return filtered
  }, [requests, statusFilter, deferredSearchQuery])

  const selectedRequest = useMemo(() => {
    if (!selectedId) return null
    return requests.find((r) => r.id === selectedId) ?? null
  }, [requests, selectedId])

  const prevStatsRef = useRef<DebugStats | null>(null)
  const stats: DebugStats = useMemo(() => {
    const total = requests.length
    let pending = 0
    let success = 0
    let error = 0
    let durationSum = 0
    let durationCount = 0

    for (const r of requests) {
      if (r.status === 'pending') pending++
      else if (r.status === 'success') success++
      else if (r.status === 'error') error++
      if (r.duration !== null) {
        durationSum += r.duration
        durationCount++
      }
    }

    const avgDuration = durationCount > 0 ? Math.round(durationSum / durationCount) : 0

    const prev = prevStatsRef.current
    if (
      prev &&
      prev.total === total &&
      prev.pending === pending &&
      prev.success === success &&
      prev.error === error &&
      prev.avgDuration === avgDuration
    ) {
      return prev
    }

    const next = { total, pending, success, error, avgDuration }
    prevStatsRef.current = next
    return next
  }, [requests])

  const selectRequest = useCallback((id: string): void => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const navigateRequest = useCallback((direction: 'up' | 'down'): void => {
    if (filteredRequests.length === 0) return

    setSelectedId((prev) => {
      if (!prev) return filteredRequests[0].id

      const currentIndex = filteredRequests.findIndex((r) => r.id === prev)
      if (currentIndex === -1) return filteredRequests[0].id

      const nextIndex = direction === 'up'
        ? Math.max(0, currentIndex - 1)
        : Math.min(filteredRequests.length - 1, currentIndex + 1)

      return filteredRequests[nextIndex].id
    })
  }, [filteredRequests])

  const handleClear = useCallback((): void => {
    clearRequests()
    setSelectedId(null)
  }, [clearRequests])

  const handleOpenInNewWindow = useCallback((): void => {
    void window.api?.openDebugPanel()
  }, [])

  return {
    requests,
    filteredRequests,
    selectedRequest,
    statusFilter,
    searchQuery,
    selectedId,
    isIntercepting,
    stats,
    setStatusFilter,
    setSearchQuery,
    selectRequest,
    navigateRequest,
    handleClear,
    handleOpenInNewWindow,
    toggleIntercepting
  }
}
