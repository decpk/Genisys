import { createContext, useContext } from 'react'

const PanelActiveContext = createContext(true)

/**
 * Returns whether the current panel tab is active (visible).
 *
 * Use this inside a `keepAlive` panel to skip expensive computations,
 * data fetches, or heavy renders when the panel is hidden.
 *
 * For non-keepAlive panels this always returns `true` since
 * the component is unmounted when inactive.
 */
export function usePanelActive(): boolean {
  return useContext(PanelActiveContext)
}

export function PanelActiveProvider({
  isActive,
  children,
}: {
  isActive: boolean
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <PanelActiveContext.Provider value={isActive}>
      {children}
    </PanelActiveContext.Provider>
  )
}
