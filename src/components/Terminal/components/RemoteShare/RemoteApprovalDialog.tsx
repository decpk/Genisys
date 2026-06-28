import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useRemoteTerminalStore } from '@/store/remote-terminal-store'

/**
 * One-time approval prompt shown when a new device connects. Allow attaches the
 * session; Deny (or Escape) rejects it. Fail-safe: dismissing without choosing
 * denies, and the backend auto-denies after a timeout regardless.
 *
 * Requests are shown one at a time; resolving the front of the queue advances
 * to the next pending request, if any.
 */
export function RemoteApprovalDialog() {
  const approval = useRemoteTerminalStore((s) => s.pendingApprovals[0] ?? null)
  const approve = useRemoteTerminalStore((s) => s.approve)
  const deny = useRemoteTerminalStore((s) => s.deny)

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
          <AlertDialogTitle>Allow remote terminal access?</AlertDialogTitle>
          <AlertDialogDescription>
            {approval ? (
              <>
                A device at <strong>{approval.ip}</strong> wants to access your
                terminals. This grants full shell access to all tabs — only allow
                devices you recognise.
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
