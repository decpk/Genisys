import { useState, useCallback, useEffect, useRef } from 'react'
import { Trash2, CheckCircle2, ChevronDown, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { AppLoaderGlyph } from '@/components/AppLoader/AppLoaderGlyph'
import { useMockServerStore } from '@/store/mock-server-store'
import type { MockServer } from '@/components/MockServer/MockServer.types'

interface EditServerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  server: MockServer
}

export function EditServerDialog({ open, onOpenChange, server }: EditServerDialogProps) {
  const updateServer = useMockServerStore((s) => s.updateServer)
  const deleteServer = useMockServerStore((s) => s.deleteServer)
  const projects = useMockServerStore((s) => s.projects)
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const setSelectedServerId = useMockServerStore((s) => s.setSelectedServerId)

  const [name, setName] = useState(server.name)
  const [port, setPort] = useState(server.port)
  const [projectId, setProjectId] = useState(server.project_id)
  const [portAvailable, setPortAvailable] = useState<boolean | null>(null)
  const [isCheckingPort, setIsCheckingPort] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const portCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      setName(server.name)
      setPort(server.port)
      setProjectId(server.project_id)
      setPortAvailable(null)
    }
  }, [open, server])

  // Port availability checking
  useEffect(() => {
    if (!open) return
    if (port === server.port) {
      setPortAvailable(null)
      return
    }
    if (port < 1024 || port > 65535) {
      setPortAvailable(false)
      return
    }

    setIsCheckingPort(true)
    if (portCheckTimer.current) clearTimeout(portCheckTimer.current)

    portCheckTimer.current = setTimeout(async () => {
      try {
        const result = await window.api.mockCheckPort(port)
        setPortAvailable(result.available)
      } catch {
        setPortAvailable(false)
      } finally {
        setIsCheckingPort(false)
      }
    }, 300)

    return () => {
      if (portCheckTimer.current) clearTimeout(portCheckTimer.current)
    }
  }, [port, open, server.port])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!name.trim() || !projectId) return
      await updateServer(server.id, name.trim(), port, projectId)
      handleClose()
    },
    [name, port, projectId, server.id, updateServer, handleClose]
  )

  const handleDelete = useCallback(async () => {
    if (selectedServerId === server.id) {
      setSelectedServerId(null)
    }
    await deleteServer(server.id)
    setShowDeleteConfirm(false)
    handleClose()
  }, [server.id, selectedServerId, deleteServer, setSelectedServerId, handleClose])

  const showAvailable = !isCheckingPort && portAvailable === true
  const showUnavailable = !isCheckingPort && portAvailable === false

  const portStatusIcon = isCheckingPort ? (
    <AppLoaderGlyph size={16} className="text-muted-foreground" />
  ) : showAvailable ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
  ) : showUnavailable ? (
    <XCircle className="h-4 w-4 text-red-500" />
  ) : null

  const canSubmit = name.trim() && projectId && portAvailable !== false && !isCheckingPort

  const projectItems: DropdownItem[] = projects.map((p) => ({
    key: p.id,
    label: p.name,
    active: p.id === projectId,
    onSelect: () => setProjectId(p.id),
  }))

  const selectedProjectName =
    projects.find((p) => p.id === projectId)?.name ?? 'Select a project'

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) handleClose();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Server</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Server Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My API Server"
                  autoFocus
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-medium text-foreground">
                    Port
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1024}
                      max={65535}
                      value={port}
                      onChange={(e) => setPort(Number(e.target.value))}
                      className={cn(
                        "h-9 w-full rounded-md border bg-background px-3 pr-9 text-sm text-foreground outline-none focus:border-input focus:ring-1 focus:ring-ring/20",
                        showUnavailable
                          ? "border-red-500 focus:ring-red-500/40"
                          : showAvailable
                            ? "border-emerald-500 focus:ring-emerald-500/40"
                            : "border-transparent",
                      )}
                    />
                    {portStatusIcon && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {portStatusIcon}
                      </div>
                    )}
                  </div>
                  {showUnavailable && (
                    <span className="text-xs text-red-500">
                      Port is unavailable
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-medium text-foreground">
                    Project
                  </label>
                  <Dropdown
                    items={projectItems}
                    openOn="click"
                    align="left"
                    showCheck
                    fill
                    menuWidth="trigger"
                    trigger={
                      <button
                        type="button"
                        className="inline-flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
                      >
                        <span className="truncate">{selectedProjectName}</span>
                        <ChevronDown size={13} className="opacity-60" />
                      </button>
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mr-auto"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Server</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{server.name}&rdquo;? This
              will remove all endpoints within this server. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete Server
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
