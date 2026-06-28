import { createContext, useContext, useMemo, useRef } from 'react'

// ── Types ────────────────────────────────────────────────────────

type ActionName<TActions> = keyof TActions & string

export type PanelMiddleware<TActions> = <K extends ActionName<TActions>>(
  actionName: K,
  payload: TActions[K] extends (...args: infer P) => unknown ? P : never,
  next: (...args: TActions[K] extends (...args: infer P) => unknown ? P : never) => void,
) => void

interface PanelDataContextValue<TData, TActions> {
  data: TData
  actions: TActions
}

interface PanelDataProviderProps<TData, TActions> {
  data: TData
  actions: TActions
  middleware?: PanelMiddleware<TActions>
  children: React.ReactNode
}

interface PanelDataContextResult<TData, TActions> {
  /** Provider that wraps the panel, supplying data and actions */
  Provider: React.ComponentType<PanelDataProviderProps<TData, TActions>>
  /** Hook to consume panel data and actions inside a panel component */
  usePanelData: () => PanelDataContextValue<TData, TActions>
  /** Hook to consume only the read-only data (skip actions subscription) */
  useData: () => TData
  /** Hook to consume only the actions (stable reference) */
  useActions: () => TActions
}

// ── Factory ──────────────────────────────────────────────────────

/**
 * Creates a typed data context for a panel.
 *
 * Each panel type defines its own data shape and actions:
 * ```ts
 * const { Provider, usePanelData } = createPanelDataContext<
 *   { sources: Source[]; activeCitation: Citation | null },
 *   { selectSource: (id: string) => void; clearCitation: () => void }
 * >()
 * ```
 *
 * **Host side** wraps the panel with `<Provider data={...} actions={...}>`.
 * **Panel side** calls `usePanelData()` to access typed data and actions.
 */
export function createPanelDataContext<
  TData,
  TActions extends Record<string, (...args: never[]) => void> = Record<string, never>,
>(displayName?: string): PanelDataContextResult<TData, TActions> {
  const Context = createContext<PanelDataContextValue<TData, TActions> | null>(null)
  Context.displayName = displayName ?? 'PanelDataContext'

  function Provider({ data, actions, middleware, children }: PanelDataProviderProps<TData, TActions>) {
    const middlewareRef = useRef(middleware)
    middlewareRef.current = middleware

    // Wrap actions with middleware if provided
    const wrappedActions = useMemo(() => {
      if (!middleware) return actions

      const wrapped = {} as Record<string, unknown>
      for (const key of Object.keys(actions) as ActionName<TActions>[]) {
        const original = actions[key]
        if (typeof original !== 'function') {
          wrapped[key] = original
          continue
        }

        wrapped[key] = (...args: unknown[]) => {
          const currentMiddleware = middlewareRef.current
          const fn = original as unknown as (...p: unknown[]) => void
          if (currentMiddleware) {
            currentMiddleware(
              key,
              args as never,
              ((...a: unknown[]) => fn(...a)) as never,
            )
          } else {
            fn(...args)
          }
        }
      }

      return wrapped as TActions
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actions, !!middleware])

    const value = useMemo(
      () => ({ data, actions: wrappedActions }),
      [data, wrappedActions],
    )

    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  Provider.displayName = `${Context.displayName}.Provider`

  function usePanelData(): PanelDataContextValue<TData, TActions> {
    const ctx = useContext(Context)
    if (!ctx) {
      throw new Error(
        `usePanelData() must be used inside <${Context.displayName}.Provider>. ` +
        `Did you forget to add a "wrapper" to your PanelDef?`,
      )
    }
    return ctx
  }

  function useData(): TData {
    return usePanelData().data
  }

  function useActions(): TActions {
    return usePanelData().actions
  }

  return { Provider, usePanelData, useData, useActions }
}
