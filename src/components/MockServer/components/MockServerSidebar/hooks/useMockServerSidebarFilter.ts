import { useState, useMemo, useCallback } from 'react'
import type { MockServer, MockProject, RunningServerInfo } from '@/components/MockServer/MockServer.types'

interface UseMockServerSidebarFilterArgs {
  projects: MockProject[]
  serversByProject: Record<string, MockServer[]>
  runningServers: RunningServerInfo[]
}

export function useMockServerSidebarFilter(args: UseMockServerSidebarFilterArgs) {
  const { projects, serversByProject, runningServers } = args

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(() => {
    return new Set(projects.map((p) => p.id))
  })
  const [filter, setFilter] = useState('')

  const filteredProjects = useMemo(() => {
    if (!filter) return projects
    const q = filter.toLowerCase()
    return projects.filter((p) => {
      if (p.name.toLowerCase().includes(q)) return true
      const pServers = serversByProject[p.id] ?? []
      return pServers.some(
        (s) => s.name.toLowerCase().includes(q) || String(s.port).includes(q)
      )
    })
  }, [projects, serversByProject, filter])

  const filteredRunningServers = useMemo(() => {
    if (!filter) return runningServers
    const q = filter.toLowerCase()
    return runningServers.filter(
      (rs) => rs.name.toLowerCase().includes(q) || String(rs.port).includes(q)
    )
  }, [runningServers, filter])

  const filteredServersByProject = useMemo(() => {
    if (!filter) return serversByProject
    const q = filter.toLowerCase()
    const result: Record<string, MockServer[]> = {}
    for (const project of filteredProjects) {
      const pServers = serversByProject[project.id] ?? []
      result[project.id] = pServers.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          String(s.port).includes(q) ||
          project.name.toLowerCase().includes(q)
      )
    }
    return result
  }, [serversByProject, filteredProjects, filter])

  const toggleProject = useCallback((projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }, [])

  return {
    filter,
    setFilter,
    expandedProjects,
    toggleProject,
    filteredProjects,
    filteredRunningServers,
    filteredServersByProject,
  }
}
