import { useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle2, ChevronDown, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { AppLoaderGlyph } from '@/components/AppLoader/AppLoaderGlyph'
import { useMockServerStore } from '@/store/mock-server-store'

interface CreateServerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string | null
}

export function CreateServerDialog({ open, onOpenChange, defaultProjectId }: CreateServerDialogProps) {
  const createServer = useMockServerStore((s) => s.createServer)
  const projects = useMockServerStore((s) => s.projects)

  const [name, setName] = useState('')
  const [portStr, setPortStr] = useState('3000')
  const [projectId, setProjectId] = useState('')
  const [portAvailable, setPortAvailable] = useState<boolean | null>(null)
  const [isCheckingPort, setIsCheckingPort] = useState(false)
  const portCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const portNum = portStr === '' ? null : Number(portStr)
  const isPortEmpty = portStr.trim() === ''
  const isPortInvalid = portNum !== null && (isNaN(portNum) || portNum < 1024 || portNum > 65535)

  useEffect(() => {
    if (open) {
      setName('')
      setPortStr('3000')
      setProjectId(defaultProjectId ?? projects[0]?.id ?? '')
      setPortAvailable(null)
    }
  }, [open, defaultProjectId, projects])

  // Port availability checking
  useEffect(() => {
    if (!open) return
    if (isPortEmpty || isPortInvalid || portNum === null) {
      setPortAvailable(null)
      setIsCheckingPort(false)
      return
    }

    setIsCheckingPort(true)
    if (portCheckTimer.current) clearTimeout(portCheckTimer.current)

    portCheckTimer.current = setTimeout(async () => {
      try {
        const result = await window.api.mockCheckPort(portNum)
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
  }, [portStr, open])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!name.trim() || !projectId || portNum === null || isPortInvalid) return
      if (portAvailable === false) return
      await createServer(projectId, name.trim(), portNum)
      handleClose()
    },
    [name, portNum, isPortInvalid, portAvailable, projectId, createServer, handleClose]
  )

  const showAvailable = !isCheckingPort && portAvailable === true && !isPortEmpty && !isPortInvalid
  const showUnavailable = !isCheckingPort && portAvailable === false && !isPortEmpty && !isPortInvalid

  const portStatusIcon = isCheckingPort ? (
    <AppLoaderGlyph size={16} className="text-muted-foreground" />
  ) : showAvailable ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
  ) : showUnavailable ? (
    <XCircle className="h-4 w-4 text-red-500" />
  ) : (isPortInvalid || isPortEmpty) ? (
    <XCircle className="h-4 w-4 text-red-500" />
  ) : null

  const hasPortError = isPortEmpty || isPortInvalid || showUnavailable
  const canSubmit = name.trim() && projectId && portAvailable === true && !isCheckingPort && !isPortEmpty && !isPortInvalid

  const projectItems: DropdownItem[] = projects.map((p) => ({
    key: p.id,
    label: p.name,
    active: p.id === projectId,
    onSelect: () => setProjectId(p.id),
  }))

  const selectedProjectName =
    projects.find((p) => p.id === projectId)?.name ?? 'Select a project'

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Server</DialogTitle>
          <DialogDescription>
            Create a mock API server with custom endpoints.
          </DialogDescription>
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
                    value={portStr}
                    onChange={(e) => setPortStr(e.target.value)}
                    placeholder="3000"
                    className={cn(
                      "h-9 w-full rounded-md border bg-background px-3 pr-9 text-sm text-foreground outline-none focus:border-input focus:ring-1 focus:ring-ring/20",
                      hasPortError
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
                {isPortEmpty && (
                  <span className="text-xs text-red-500">Port is required</span>
                )}
                {isPortInvalid && (
                  <span className="text-xs text-red-500">
                    Port must be between 1024–65535
                  </span>
                )}
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Create Server
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
