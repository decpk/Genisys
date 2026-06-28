import { MonitorApprovalDialog } from './MonitorApprovalDialog'
import { MonitorSharePanel } from './MonitorSharePanel'
import { useMonitorShareHostData } from '../hooks/useMonitorShareHostData'

/**
 * Mounts the Monitor Share panel and the approval prompt, and wires the
 * backend event listeners (via `useMonitorShareHostData`). Rendered once inside
 * the Monitor app.
 */
export function MonitorShareHost() {
  useMonitorShareHostData()

  return (
    <>
      <MonitorSharePanel />
      <MonitorApprovalDialog />
    </>
  )
}
