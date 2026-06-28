import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Server, MoreVertical } from 'lucide-react'
import type { MockProject, MockServer } from '@/components/MockServer/MockServer.types'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMockServerStore } from '@/store/mock-server-store'
import { ServerItem } from './ServerItem'
import { EditProjectDialog } from '../EditProjectDialog'

interface ProjectItemProps {
  project: MockProject
  servers: MockServer[]
  isExpanded: boolean
  onToggle: () => void
  selectedServerId: string | null
  runningServerIds: Set<string>
  onSelectServer: (serverId: string) => void
  onAddServer: () => void
}

export function ProjectItem(props: ProjectItemProps) {
  const { project, servers, isExpanded, onToggle, selectedServerId, runningServerIds, onSelectServer, onAddServer } = props

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const deleteProject = useMockServerStore((s) => s.deleteProject)

  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight

  const handleAddServer = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isExpanded) {
        onToggle()
      }
      onAddServer()
    },
    [isExpanded, onToggle, onAddServer]
  )

  const handleDeleteProject = useCallback(async () => {
    await deleteProject(project.id)
    setShowDeleteConfirm(false)
  }, [deleteProject, project.id])

  const collapsedCount = !isExpanded && servers.length > 0
    ? `(${servers.length})`
    : null

  const handleAddServerAction = useCallback(() => {
    if (!isExpanded) onToggle()
    onAddServer()
  }, [isExpanded, onToggle, onAddServer])

  return (
    <div className="mb-1">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              'group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors',
              'border border-transparent hover:bg-secondary/60'
            )}
            onClick={onToggle}
          >
            <ChevronIcon className="size-3.5 text-muted-foreground/70 shrink-0" />
            <span
              className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/5"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-xs font-medium truncate flex-1">{project.name}</span>
            {collapsedCount && (
              <span className="text-[11px] text-muted-foreground/60 tabular-nums">{collapsedCount}</span>
            )}
            <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity">
              <IconButton
                size="xs"
                variant="ghost"
                tooltip="Add server"
                onClick={handleAddServer}
              >
                <Plus className="size-3.5" />
              </IconButton>
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    tooltip="More actions"
                    tooltipDisabled={menuOpen}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="size-3.5" />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={handleAddServerAction}>
                    <Server />
                    Add Server
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                    <Pencil />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setShowDeleteConfirm(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="text-destructive" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => {
            if (!isExpanded) onToggle()
            onAddServer()
          }}>
            <Server />
            Add Server
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil />
            Edit Project
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => setShowDeleteConfirm(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="text-destructive" />
            Delete Project
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {isExpanded && (
        <div className="ml-5 mt-0.5 border-l border-border/40 pl-1.5">
          {servers.length === 0 && (
            <div className="py-3 text-center text-[11px] text-muted-foreground/30">No servers</div>
          )}
          {servers.map((server) => (
            <ServerItem
              key={server.id}
              server={server}
              isSelected={selectedServerId === server.id}
              isRunning={runningServerIds.has(server.id)}
              onClick={onSelectServer}
            />
          ))}
        </div>
      )}

      <EditProjectDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        project={project}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <span className="font-medium">{project.name}</span> and all its servers?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
