import { useState, useEffect, useRef, useCallback } from 'react'
import type { ClipboardItem } from '@/store/clipboard-store'

const MULTI_DAY_LIMIT = 500

export function useMultiDayClipboardData(enabled: boolean) {
  const [items, setItems] = useState<ClipboardItem[]>([])
  const [loading, setLoading] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!enabled || loadedRef.current) return

    let cancelled = false
    setLoading(true)

    window.api
      .loadClipboardItems({ limit: MULTI_DAY_LIMIT })
      .then((result) => {
        if (!cancelled) {
          setItems(result.items ?? [])
          loadedRef.current = true
        }
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [enabled])

  const refresh = useCallback(() => {
    loadedRef.current = false
    setLoading(true)

    window.api
      .loadClipboardItems({ limit: MULTI_DAY_LIMIT })
      .then((result) => {
        setItems(result.items ?? [])
        loadedRef.current = true
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return { items, loading, refresh }
}
