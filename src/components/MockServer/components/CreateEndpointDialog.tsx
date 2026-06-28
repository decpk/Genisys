import { useState, useCallback, useEffect, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import { useMockServerStore } from '@/store/mock-server-store'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
const STATUS_PRESETS = [200, 201, 204, 400, 401, 403, 404, 500]

function getStatusDotColor(code: number): string {
  if (code >= 200 && code < 300) return 'bg-emerald-500'
  if (code >= 300 && code < 400) return 'bg-blue-500'
  if (code >= 400 && code < 500) return 'bg-amber-500'
  if (code >= 500) return 'bg-red-500'
  return 'bg-gray-400'
}

function getStatusPillColor(code: number): string {
  if (code >= 200 && code < 300) return 'bg-emerald-500/10 text-emerald-500'
  if (code >= 300 && code < 400) return 'bg-blue-500/10 text-blue-500'
  if (code >= 400 && code < 500) return 'bg-amber-500/10 text-amber-500'
  if (code >= 500) return 'bg-red-500/10 text-red-500'
  return ''
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  POST: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  PUT: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  PATCH: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
  DELETE: 'bg-red-500/15 text-red-500 border-red-500/30',
  OPTIONS: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  HEAD: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

interface CreateEndpointDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEndpointDialog(props: CreateEndpointDialogProps) {
  const { open, onOpenChange } = props

  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const endpoints = useMockServerStore((s) => s.endpoints)
  const createEndpoint = useMockServerStore((s) => s.createEndpoint)
  const setSelectedEndpointId = useMockServerStore((s) => s.setSelectedEndpointId)

  const [method, setMethod] = useState('GET')
  const [path, setPath] = useState('/')
  const [statusCode, setStatusCode] = useState(200)
  const [description, setDescription] = useState('')
  const [delayMs, setDelayMs] = useState(0)

  useEffect(() => {
    if (open) {
      setMethod('GET')
      setPath('/')
      setStatusCode(200)
      setDescription('')
      setDelayMs(0)
    }
  }, [open])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handlePathChange = useCallback((value: string) => {
    const normalized = value.startsWith('/') ? value : '/' + value
    setPath(normalized)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedServerId || !path.trim()) return

      const result = await createEndpoint({
        server_id: selectedServerId,
        method,
        path: path.trim(),
        status_code: statusCode,
        response_headers: '{"Content-Type":"application/json"}',
        response_body: '{}',
        response_type: 'static',
        ai_prompt: '',
        ai_schema: '',
        ai_count: 1,
        delay_ms: delayMs,
        description: description.trim(),
        is_active: true,
      })

      if (result?.id) {
        setSelectedEndpointId(result.id)
      }

      handleClose()
    },
    [selectedServerId, method, path, statusCode, description, delayMs, createEndpoint, setSelectedEndpointId, handleClose]
  )

  const isDuplicate = useMemo(() => {
    if (!selectedServerId) return false
    const serverEndpoints = endpoints[selectedServerId] ?? []
    return serverEndpoints.some(
      (ep) => ep.method === method && ep.path === path.trim()
    )
  }, [selectedServerId, endpoints, method, path])

  const canSubmit = path.trim().length > 0 && !isDuplicate

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Endpoint</DialogTitle>
          <DialogDescription>
            Add a new API endpoint to this server.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            {/* Method */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Method
              </label>
              <div className="flex flex-wrap gap-1.5">
                {METHODS.map((m) => {
                  const colorClass =
                    METHOD_COLORS[m] ??
                    "bg-gray-500/15 text-gray-400 border-gray-500/30";
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide border transition-all",
                        method === m
                          ? cn(colorClass, "ring-1 ring-ring/40")
                          : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Path */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Path
              </label>
              <input
                type="text"
                value={path}
                onChange={(e) => handlePathChange(e.target.value)}
                placeholder="/api/users"
                autoFocus
                className={cn(
                  "h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-input focus:ring-1 focus:ring-ring/20",
                  isDuplicate ? "border-red-500" : "border-transparent",
                )}
              />
              {isDuplicate && (
                <p className="text-xs text-red-500">
                  An endpoint with {method} {path.trim()} already exists
                </p>
              )}
            </div>

            {/* Status Code */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Status Code
              </label>
              <Dropdown
                items={STATUS_PRESETS.map(
                  (code): DropdownItem => ({
                    key: String(code),
                    label: String(code),
                    active: code === statusCode,
                    prefix: (
                      <span
                        className={cn(
                          "inline-block size-2 rounded-full",
                          getStatusDotColor(code),
                        )}
                      />
                    ),
                    onSelect: () => setStatusCode(code),
                  }),
                )}
                openOn="click"
                align="left"
                showCheck
                menuWidth="140px"
                trigger={
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 h-9 px-2.5 text-sm font-medium rounded-md border border-border bg-background cursor-pointer transition-all",
                      getStatusPillColor(statusCode),
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block size-2 rounded-full",
                        getStatusDotColor(statusCode),
                      )}
                    />
                    {statusCode}
                    <ChevronDown size={12} className="opacity-50" />
                  </button>
                }
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Returns a list of users"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Delay */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Response Delay{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <div className="relative w-32">
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={delayMs}
                  onChange={(e) =>
                    setDelayMs(Math.max(0, Number(e.target.value) || 0))
                  }
                  placeholder="0"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-medium pointer-events-none">
                  ms
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Simulate network latency by adding a delay before responding
              </p>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Create Endpoint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
