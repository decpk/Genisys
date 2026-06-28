import { useEffect, useRef } from 'react'
import { Plus, Unplug } from 'lucide-react'
import { useMockServerStore, readActiveEndpointId } from '@/store/mock-server-store'
import { Button } from '@/components/ui/button'

import { ServerConfigPanel } from '../ServerConfigPanel'
import { EndpointTabBar } from '../EndpointTabBar'
import { EndpointEditor } from '../EndpointEditor'

export function MockServerMainContent(): React.JSX.Element {
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const activeEndpointTabId = useMockServerStore((s) => s.activeEndpointTabId)
  const openEndpointTabs = useMockServerStore((s) => s.openEndpointTabs)
  const loadEndpoints = useMockServerStore((s) => s.loadEndpoints)
  const serverEndpoints = useMockServerStore((s) =>
    selectedServerId ? s.endpoints[selectedServerId] : undefined
  )
  const restoredServerId = useRef<string | null>(null)

  useEffect(() => {
    if (selectedServerId) {
      loadEndpoints(selectedServerId)
    }
  }, [selectedServerId, loadEndpoints])

  // Restore the last opened endpoint tab once endpoints have loaded for the
  // selected server (only on first visit per server, when nothing is open yet).
  useEffect(() => {
    if (!selectedServerId) return
    if (restoredServerId.current === selectedServerId) return
    if (!serverEndpoints) return // endpoints not loaded yet

    restoredServerId.current = selectedServerId

    const state = useMockServerStore.getState()
    if (state.openEndpointTabs.length === 0) {
      const lastEndpointId = readActiveEndpointId()
      if (lastEndpointId && serverEndpoints.some((e) => e.id === lastEndpointId)) {
        state.openEndpointTab(lastEndpointId)
      }
    }
  }, [selectedServerId, serverEndpoints])

  const hasOpenTabs = openEndpointTabs.length > 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ServerConfigPanel />
      <EndpointTabBar />
      {hasOpenTabs && activeEndpointTabId ? (
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden" key={activeEndpointTabId}>
          <EndpointEditor />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40">
            <Unplug className="h-6 w-6 opacity-50" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-foreground/70">No endpoints open</p>
            <p className="text-xs text-muted-foreground">Click <span className="font-medium">+</span> to create a new endpoint</p>
          </div>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => window.dispatchEvent(new Event('mockserver:create-endpoint'))}
          >
            <Plus className="h-3.5 w-3.5" />
            Create endpoint
          </Button>
        </div>
      )}
    </div>
  )
}
