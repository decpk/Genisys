import { useState, useEffect, useCallback } from 'react'
import { MOCK_SERVER_EVENTS } from '@/components/MockServer/events'

export function useMockServerSidebarDialogs() {
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showCreateServer, setShowCreateServer] = useState(false)
  const [createServerProjectId, setCreateServerProjectId] = useState<string | null>(null)

  const openCreateProject = useCallback(() => {
    setShowCreateProject(true)
  }, [])

  const openCreateServer = useCallback((projectId: string | null = null) => {
    setCreateServerProjectId(projectId)
    setShowCreateServer(true)
  }, [])

  useEffect(() => {
    const handleCreateServer = () => {
      openCreateServer(null)
    }
    const handleCreateProject = () => {
      openCreateProject()
    }

    window.addEventListener(MOCK_SERVER_EVENTS.createServer, handleCreateServer)
    window.addEventListener(MOCK_SERVER_EVENTS.createProject, handleCreateProject)

    return () => {
      window.removeEventListener(MOCK_SERVER_EVENTS.createServer, handleCreateServer)
      window.removeEventListener(MOCK_SERVER_EVENTS.createProject, handleCreateProject)
    }
  }, [openCreateServer, openCreateProject])

  return {
    showCreateProject,
    setShowCreateProject,
    showCreateServer,
    setShowCreateServer,
    createServerProjectId,
    openCreateProject,
    openCreateServer,
  }
}
