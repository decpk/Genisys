import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useMonitorStore } from '@/store/monitor-store'

/**
 * One-time approval prompt shown when a new device connects to watch the feed.
 * Allow starts streaming to it; Deny (or Escape) rejects it. Fail-safe:
 * dismissing without choosing denies, and the backend auto-denies after a
 * timeout regardless. Requests are shown one at a time.
 */
export function MonitorApprovalDialog() {
  const approval = useMonitorStore((s) => s.pendingApprovals[0] ?? null)
  const approve = useMonitorStore((s) => s.approve)
  const deny = useMonitorStore((s) => s.deny)

  const open = approval !== null

  // Plain buttons resolve via the store (no auto-close), so this only fires on
  // Escape — which we treat as a deny.
  function handleOpenChange(next: boolean) {
    if (!next && approval) void deny(approval.requestId)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Allow this device to watch & listen?</AlertDialogTitle>
          <AlertDialogDescription>
            {approval ? (
              <>
                A device at <strong>{approval.ip}</strong> wants to view your
                camera and hear your microphone. Only allow devices you
                recognise — they will see and hear your surroundings live.
              </>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => approval && deny(approval.requestId)}
          >
            Deny
          </Button>
          <Button onClick={() => approval && approve(approval.requestId)}>Allow</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
