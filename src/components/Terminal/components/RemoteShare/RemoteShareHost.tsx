import { RemoteApprovalDialog } from './RemoteApprovalDialog'
import { RemoteSharePanel } from './RemoteSharePanel'
import { useRemoteShareHostData } from './useRemoteShareHostData'

/**
 * Mounts the remote-terminal Share panel and the approval prompt, and wires the
 * backend event listeners (via `useRemoteShareHostData`). Rendered once inside
 * the Terminal so the controls and approvals live with the terminal UI.
 */
export function RemoteShareHost() {
  useRemoteShareHostData()

  return (
    <>
      <RemoteSharePanel />
      <RemoteApprovalDialog />
    </>
  )
}
