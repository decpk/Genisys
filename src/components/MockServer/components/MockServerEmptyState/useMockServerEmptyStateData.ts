import { useCallback } from 'react'

import { emitCreateServer, emitCreateProject } from '@/components/MockServer/events'

export function useMockServerEmptyStateData() {
  const handleCreateServer = useCallback(() => {
    emitCreateServer()
  }, [])

  const handleCreateProject = useCallback(() => {
    emitCreateProject()
  }, [])

  return { handleCreateServer, handleCreateProject }
}
