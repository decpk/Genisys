import { useMockServerSidebarProjects } from './useMockServerSidebarProjects'
import { useMockServerSidebarFilter } from './useMockServerSidebarFilter'
import { useMockServerSidebarDialogs } from './useMockServerSidebarDialogs'

export function useMockServerSidebarData() {
  const projectsData = useMockServerSidebarProjects()
  const filterData = useMockServerSidebarFilter({
    projects: projectsData.projects,
    serversByProject: projectsData.serversByProject,
    runningServers: projectsData.runningServers,
  })
  const dialogs = useMockServerSidebarDialogs()

  const hasRunning = projectsData.runningServers.length > 0

  return {
    ...projectsData,
    ...filterData,
    ...dialogs,
    hasRunning,
  }
}
