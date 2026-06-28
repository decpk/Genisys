import { useCallback, useRef, useState } from 'react'
import type { GitCommit } from '../GitPanel.types'
import { COMMITS_PER_PAGE } from '../GitPanel.constants'

interface UseGitLogReturn {
  commits: GitCommit[]
  totalCount: number | null
  isLoading: boolean
  isFetchingMore: boolean
  hasMore: boolean
  error: string | null
  fetch: () => void
  fetchMore: () => void
}

export function useGitLog(rootPath: string): UseGitLogReturn {
  const [commits, setCommits] = useState<GitCommit[]>([])
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchingRef = useRef(false)
  const commitsRef = useRef<GitCommit[]>([])

  const fetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setHasMore(true)

    window.api
      .getGitCommitCount({ rootPath })
      .then((result) => {
        if (result.success && typeof result.data === 'number') {
          setTotalCount(result.data)
        } else {
          setTotalCount(null)
        }
      })
      .catch(() => {
        setTotalCount(null)
      })

    window.api
      .getGitLog({ rootPath, maxCount: COMMITS_PER_PAGE, skip: 0 })
      .then((result) => {
        if (result.success && result.data) {
          setCommits(result.data)
          commitsRef.current = result.data
          setHasMore(result.data.length >= COMMITS_PER_PAGE)
        } else {
          setError(result.error ?? 'Failed to get git log')
          setCommits([])
          commitsRef.current = []
        }
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to get git log')
        setCommits([])
        commitsRef.current = []
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [rootPath])

  const fetchMore = useCallback(() => {
    if (fetchingRef.current || !hasMore) return
    fetchingRef.current = true
    setIsFetchingMore(true)

    const skip = commitsRef.current.length

    window.api
      .getGitLog({ rootPath, maxCount: COMMITS_PER_PAGE, skip })
      .then((result) => {
        if (result.success && result.data) {
          const existingHashes = new Set(commitsRef.current.map((c) => c.hash))
          const newCommits = result.data.filter((c) => !existingHashes.has(c.hash))
          const merged = [...commitsRef.current, ...newCommits]
          setCommits(merged)
          commitsRef.current = merged
          setHasMore(result.data.length >= COMMITS_PER_PAGE)
        }
      })
      .catch(() => {
        setHasMore(false)
      })
      .finally(() => {
        setIsFetchingMore(false)
        fetchingRef.current = false
      })
  }, [rootPath, hasMore])

  return { commits, totalCount, isLoading, isFetchingMore, hasMore, error, fetch, fetchMore }
}
