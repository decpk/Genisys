import { useEffect, useRef } from 'react'
import { useMockServerStore, readSelectedServerId } from '@/store/mock-server-store'
import type { RequestLogEntry } from './MockServer.types'

export function useMockServerData() {
  const isLoaded = useMockServerStore((s) => s.isLoaded)
  const loadProjects = useMockServerStore((s) => s.loadProjects)
  const loadServers = useMockServerStore((s) => s.loadServers)
  const refreshRunningServers = useMockServerStore((s) => s.refreshRunningServers)
  const addRequestLog = useMockServerStore((s) => s.addRequestLog)
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const initCalled = useRef(false)

  // Load data on mount
  useEffect(() => {
    if (isLoaded || initCalled.current) return
    initCalled.current = true

    const timeout = setTimeout(() => {
      useMockServerStore.setState({ isLoaded: true })
    }, 5000)

    Promise.allSettled([
      loadProjects().catch(() => {}),
      loadServers().catch(() => {}),
      refreshRunningServers().catch(() => {}),
    ]).finally(() => {
      clearTimeout(timeout)
      useMockServerStore.setState({ isLoaded: true })

      // Restore the last opened server if it still exists and nothing is selected
      const state = useMockServerStore.getState()
      if (!state.selectedServerId) {
        const lastServerId = readSelectedServerId()
        if (lastServerId && state.servers.some((s) => s.id === lastServerId)) {
          state.setSelectedServerId(lastServerId)
        }
      }
    })
  }, [isLoaded, loadProjects, loadServers, refreshRunningServers])

  // Listen for mock server request log events
  useEffect(() => {
    let unlisten: (() => void) | null = null

    async function setupListener() {
      try {
        const { listen } = await import('@tauri-apps/api/event')
        const fn = await listen<RequestLogEntry>('mock-server-request-log', (event) => {
          addRequestLog(event.payload)
        })
        unlisten = fn
      } catch {
        // Tauri APIs not available (e.g. in browser dev mode)
      }
    }

    setupListener()

    return () => {
      unlisten?.()
    }
  }, [addRequestLog])

  return {
    isLoaded,
    selectedServerId,
  }
}
