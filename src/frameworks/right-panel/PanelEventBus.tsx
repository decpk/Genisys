import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// ── Types ────────────────────────────────────────────────────────

type EventMap = Record<string, unknown>
type Handler<T = unknown> = (payload: T) => void

interface EventBusAPI<TEvents extends EventMap> {
  emit: <K extends keyof TEvents & string>(event: K, payload: TEvents[K]) => void
  on: <K extends keyof TEvents & string>(event: K, handler: Handler<TEvents[K]>) => () => void
  off: <K extends keyof TEvents & string>(event: K, handler: Handler<TEvents[K]>) => void
}

interface PanelEventBusResult<TEvents extends EventMap> {
  /** Provider that scopes the event bus to a RightPanelTabs instance */
  Provider: React.ComponentType<{ children: React.ReactNode }>
  /** Hook to subscribe to a specific event. Handler is auto-cleaned on unmount. */
  usePanelEvent: <K extends keyof TEvents & string>(
    event: K,
    handler: Handler<TEvents[K]>,
  ) => void
  /** Hook to get the emit function for sending events */
  useEmit: () => <K extends keyof TEvents & string>(event: K, payload: TEvents[K]) => void
  /** Hook to get the full event bus API (emit, on, off) for imperative use */
  useEventBus: () => EventBusAPI<TEvents>
}

// ── Internal bus implementation ──────────────────────────────────

function createBus<TEvents extends EventMap>(): EventBusAPI<TEvents> {
  const listeners = new Map<string, Set<Handler>>()

  return {
    emit(event, payload) {
      listeners.get(event)?.forEach((fn) => fn(payload))
    },
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event)!.add(handler as Handler)
      return () => listeners.get(event)?.delete(handler as Handler)
    },
    off(event, handler) {
      listeners.get(event)?.delete(handler as Handler)
    },
  }
}

// ── Factory ──────────────────────────────────────────────────────

/**
 * Creates a typed, scoped event bus for cross-panel communication.
 *
 * ```ts
 * const { Provider, usePanelEvent, useEmit } = createPanelEventBus<{
 *   'citation:click': { id: string; url: string }
 *   'source:select': { sourceId: string }
 * }>()
 * ```
 *
 * Events are scoped per Provider — two different `RightPanelTabs` instances
 * with separate Providers don't leak events to each other.
 */
export function createPanelEventBus<
  TEvents extends EventMap,
>(displayName?: string): PanelEventBusResult<TEvents> {
  const Context = createContext<EventBusAPI<TEvents> | null>(null)
  Context.displayName = displayName ?? 'PanelEventBus'

  function Provider({ children }: { children: React.ReactNode }) {
    const [bus] = useState(() => createBus<TEvents>())

    return <Context.Provider value={bus}>{children}</Context.Provider>
  }

  Provider.displayName = `${Context.displayName}.Provider`

  function useEventBus(): EventBusAPI<TEvents> {
    const bus = useContext(Context)
    if (!bus) {
      throw new Error(
        `useEventBus() must be used inside <${Context.displayName}.Provider>. ` +
        `Add the event bus Provider as a "wrapper" on your RightPanelTabs.`,
      )
    }
    return bus
  }

  function usePanelEvent<K extends keyof TEvents & string>(
    event: K,
    handler: Handler<TEvents[K]>,
  ): void {
    const bus = useEventBus()
    const handlerRef = useRef(handler)

    useEffect(() => {
      handlerRef.current = handler
    })

    useEffect(() => {
      const stableHandler: Handler<TEvents[K]> = (payload) => handlerRef.current(payload)
      return bus.on(event, stableHandler)
    }, [bus, event])
  }

  function useEmit() {
    const bus = useEventBus()
    return useCallback(
      <K extends keyof TEvents & string>(event: K, payload: TEvents[K]) => {
        bus.emit(event, payload)
      },
      [bus],
    )
  }

  return { Provider, usePanelEvent, useEmit, useEventBus }
}
