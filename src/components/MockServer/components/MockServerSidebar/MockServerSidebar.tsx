import { Server, Square, Plus } from 'lucide-react'
import { IconButton } from '@/components/ui/icon-button'
import { Button } from '@/components/ui/button'
import { PanelHeading } from '@/components/ui/panel-heading'
import { SearchInput } from '@/components/ui/search-input'
import { EmptyState } from '@/components/ui/empty-state'
import { useMockServerSidebarData } from './hooks/useMockServerSidebarData'
import { RunningServersSection } from './RunningServersSection'
import { ProjectItem } from './ProjectItem'
import { SidebarAddMenu } from './components/SidebarAddMenu'
import { CreateProjectDialog } from '../CreateProjectDialog'
import { CreateServerDialog } from '../CreateServerDialog'

export function MockServerSidebar(): React.JSX.Element {
  const {
    servers,
    serversByProject,
    selectedServerId,
    runningServerIds,
    hasRunning,
    handleStopAll,
    handleStopServer,
    handleSelectServer,
    filter,
    setFilter,
    expandedProjects,
    toggleProject,
    filteredProjects,
    filteredRunningServers,
    filteredServersByProject,
    showCreateProject,
    setShowCreateProject,
    showCreateServer,
    setShowCreateServer,
    createServerProjectId,
    openCreateProject,
    openCreateServer,
  } = useMockServerSidebarData()

  const hasRunningResults = filteredRunningServers.length > 0
  const hasProjects = filteredProjects.length > 0

  const emptyMessage = filter
    ? 'No servers match your search'
    : 'No projects yet — create one to get started'

  const createFirstServerAction = filter ? null : (
    <Button size="sm" onClick={() => openCreateServer(null)}>
      <Plus size={14} strokeWidth={2.5} />
      Create your first server
    </Button>
  )

  const projectsContent = hasProjects ? (
    <div className="space-y-0.5">
      {filteredProjects.map((project) => (
        <ProjectItem
          key={project.id}
          project={project}
          servers={filteredServersByProject[project.id] ?? serversByProject[project.id] ?? []}
          isExpanded={expandedProjects.has(project.id)}
          onToggle={() => toggleProject(project.id)}
          selectedServerId={selectedServerId}
          runningServerIds={runningServerIds}
          onSelectServer={handleSelectServer}
          onAddServer={() => openCreateServer(project.id)}
        />
      ))}
    </div>
  ) : (
    <EmptyState
      icon={Server}
      message={emptyMessage}
      className="py-12"
      action={createFirstServerAction}
    />
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <PanelHeading icon={Server} title="Mock Server" count={servers.length} className="px-3 h-9">
        {hasRunning && (
          <IconButton
            variant="destructive"
            size="sm"
            tooltip="Stop all servers"
            onClick={handleStopAll}
          >
            <Square size={12} strokeWidth={2.5} />
          </IconButton>
        )}
        <SidebarAddMenu onNewServer={() => openCreateServer(null)} onNewProject={openCreateProject} />
      </PanelHeading>

      {/* Search */}
      <div className="px-2.5 pt-2 pb-1.5">
        <SearchInput placeholder="Search servers…" value={filter} onChange={setFilter} />
      </div>

      {/* Projects section label */}
      <div className="flex items-center justify-between px-2.5 pb-1.5">
        <span className="text-2xs uppercase tracking-wider text-muted-foreground/40 font-medium">
          Projects
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/20 mx-2.5" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1.5">
        {/* Running servers section */}
        <RunningServersSection
          runningServers={filteredRunningServers}
          selectedServerId={selectedServerId}
          onSelectServer={handleSelectServer}
          onStopServer={handleStopServer}
        />

        {/* Divider when running servers exist */}
        {hasRunningResults && <div className="h-px bg-border/20 mx-2.5 my-1.5" />}

        {/* Projects list */}
        {projectsContent}
      </div>

      {/* Dialogs */}
      <CreateProjectDialog open={showCreateProject} onOpenChange={setShowCreateProject} />
      <CreateServerDialog
        open={showCreateServer}
        onOpenChange={setShowCreateServer}
        defaultProjectId={createServerProjectId}
      />
    </div>
  )
}
