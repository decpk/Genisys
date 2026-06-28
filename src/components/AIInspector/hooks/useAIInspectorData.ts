import { useCallback, useDeferredValue, useMemo, useRef, useState } from 'react'

import { useAIInspectorStore } from '@/store/ai-inspector-store'
import type { AIRequestStatus } from '@/store/ai-inspector-store'

import type { AIInspectorStats, AISortField, AISortDirection } from '../AIInspector.types'

export function useAIInspectorData() {
  const requests = useAIInspectorStore((s) => s.requests)
  const isIntercepting = useAIInspectorStore((s) => s.isIntercepting)
  const clearRequests = useAIInspectorStore((s) => s.clearRequests)
  const toggleIntercepting = useAIInspectorStore((s) => s.toggleIntercepting)

  const [statusFilter, setStatusFilter] = useState<AIRequestStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [originFilter, setOriginFilter] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<AISortField>('time')
  const [sortDirection, setSortDirection] = useState<AISortDirection>('desc')

  const deferredSearchQuery = useDeferredValue(searchQuery)

  const filteredRequests = useMemo(() => {
    let filtered = requests

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    if (originFilter !== 'All') {
      filtered = filtered.filter((r) => r.originApp === originFilter)
    }

    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase()
      filtered = filtered.filter((r) =>
        r.channel.toLowerCase().includes(query) ||
        r.model.toLowerCase().includes(query) ||
        r.originApp.toLowerCase().includes(query) ||
        r.userMessage.toLowerCase().includes(query)
      )
    }

    if (sortField !== 'time' || sortDirection !== 'desc') {
      filtered = [...filtered].sort((a, b) => {
        let cmp = 0
        if (sortField === 'time') {
          cmp = a.startedAt - b.startedAt
        } else if (sortField === 'duration') {
          cmp = (a.duration ?? 0) - (b.duration ?? 0)
        } else if (sortField === 'channel') {
          cmp = a.channel.localeCompare(b.channel)
        }
        return sortDirection === 'asc' ? cmp : -cmp
      })
    }

    return filtered
  }, [requests, statusFilter, originFilter, deferredSearchQuery, sortField, sortDirection])

  const selectedRequest = useMemo(() => {
    if (!selectedId) return null
    return requests.find((r) => r.id === selectedId) ?? null
  }, [requests, selectedId])

  const prevStatsRef = useRef<AIInspectorStats | null>(null)
  const stats: AIInspectorStats = useMemo(() => {
    const total = requests.length
    let pending = 0
    let streaming = 0
    let success = 0
    let error = 0
    let durationSum = 0
    let durationCount = 0

    for (const r of requests) {
      if (r.status === 'pending') pending++
      else if (r.status === 'streaming') streaming++
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
      prev.streaming === streaming &&
      prev.success === success &&
      prev.error === error &&
      prev.avgDuration === avgDuration
    ) {
      return prev
    }

    const next = { total, pending, streaming, success, error, avgDuration }
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

  return {
    requests,
    filteredRequests,
    selectedRequest,
    statusFilter,
    searchQuery,
    originFilter,
    selectedId,
    isIntercepting,
    stats,
    sortField,
    sortDirection,
    setStatusFilter,
    setSearchQuery,
    setOriginFilter,
    selectRequest,
    navigateRequest,
    handleClear,
    toggleIntercepting,
    setSortField,
    setSortDirection,
  }
}
