import { Laptop, Loader2, RefreshCw, Send, Share2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ShareTarget } from '@/components/ContentShare/types'

import { useDevicePickerDialogData } from './useDevicePickerDialogData'

interface DevicePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: ShareTarget | null
}

/**
 * Reusable dialog that lists Genisys devices discovered on the LAN and sends the
 * given `target` (a book or a notes selection) to the chosen device.
 */
export function DevicePickerDialog({ open, onOpenChange, target }: DevicePickerDialogProps) {
  const { devices, deviceName, sendingDeviceId, progress, refreshDevices, handlePick } =
    useDevicePickerDialogData(open, onOpenChange, target)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={18} /> Share to device
          </DialogTitle>
          <DialogDescription>
            Send <span className="font-medium text-foreground">{target?.label}</span> to another
            Genisys device on your network.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            This device: <span className="text-foreground">{deviceName ?? '…'}</span>
          </span>
          <button
            type="button"
            onClick={() => void refreshDevices()}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-accent hover:text-foreground"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        <div className="max-h-72 divide-y overflow-y-auto rounded-lg border">
          {devices.length === 0 ? (
            <div className="p-5 text-center text-sm text-muted-foreground">
              Looking for nearby Genisys devices…
              <div className="mt-1 text-xs">
                Make sure Genisys is open and on the same Wi-Fi on the other device.
              </div>
            </div>
          ) : (
            devices.map((device) => (
              <button
                key={device.deviceId}
                type="button"
                disabled={sendingDeviceId !== null}
                onClick={() => void handlePick(device)}
                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-accent disabled:opacity-60"
              >
                <Laptop size={18} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{device.deviceName}</div>
                  <div className="truncate text-xs text-muted-foreground">{device.host}</div>
                </div>
                {sendingDeviceId === device.deviceId ? (
                  <Loader2 size={16} className="shrink-0 animate-spin text-primary" />
                ) : (
                  <Send size={14} className="shrink-0 text-muted-foreground" />
                )}
              </button>
            ))
          )}
        </div>

        {sendingDeviceId ? (
          progress &&
          progress.deviceId === sendingDeviceId &&
          progress.phase === 'uploading' &&
          progress.total > 0 ? (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Sending…</span>
                <span>{Math.min(100, Math.round((progress.sent / progress.total) * 100))}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((progress.sent / progress.total) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Waiting for the other device to accept…
            </p>
          )
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
