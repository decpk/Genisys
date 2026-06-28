import { createContext, useContext, useMemo } from 'react'

interface PanelInstanceValue {
  panelId: string
  instanceId: string
  isActive: boolean
}

const PanelInstanceContext = createContext<PanelInstanceValue | null>(null)

/**
 * Returns identity and visibility info for the current panel.
 *
 * - `panelId` — the `PanelDef.id` of this panel
 * - `instanceId` — unique per `RightPanelTabs` instance (supports multi-instance)
 * - `isActive` — whether this panel tab is currently visible
 */
export function usePanelInstance(): PanelInstanceValue {
  const ctx = useContext(PanelInstanceContext)
  if (!ctx) {
    throw new Error('usePanelInstance() must be used inside a panel rendered by RightPanelTabs.')
  }
  return ctx
}

export function PanelInstanceProvider({
  panelId,
  instanceId,
  isActive,
  children,
}: PanelInstanceValue & { children: React.ReactNode }): React.JSX.Element {
  const value = useMemo(
    () => ({ panelId, instanceId, isActive }),
    [panelId, instanceId, isActive],
  )

  return (
    <PanelInstanceContext.Provider value={value}>
      {children}
    </PanelInstanceContext.Provider>
  )
}
