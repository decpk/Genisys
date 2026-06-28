// Module-scoped event bus: routes PTY output / exit events from a single
// global Tauri listener to per-session subscribers (one xterm instance each).
//
// Kept out of Zustand on purpose — high-frequency byte streams must not
// trigger React renders.

type OutputHandler = (data: Uint8Array) => void
type ExitHandler = (code: number | null) => void

const outputSubs = new Map<string, Set<OutputHandler>>()
const exitSubs = new Map<string, Set<ExitHandler>>()

export const terminalOutputBus = {
  subscribeOutput(id: string, handler: OutputHandler): () => void {
    let set = outputSubs.get(id)
    if (!set) {
      set = new Set()
      outputSubs.set(id, set)
    }
    set.add(handler)
    return () => {
      const s = outputSubs.get(id)
      if (!s) return
      s.delete(handler)
      if (s.size === 0) outputSubs.delete(id)
    }
  },

  publishOutput(id: string, data: Uint8Array): void {
    const set = outputSubs.get(id)
    if (!set) return
    set.forEach((h) => {
      try { h(data) } catch { /* swallow per-subscriber errors */ }
    })
  },

  subscribeExit(id: string, handler: ExitHandler): () => void {
    let set = exitSubs.get(id)
    if (!set) {
      set = new Set()
      exitSubs.set(id, set)
    }
    set.add(handler)
    return () => {
      const s = exitSubs.get(id)
      if (!s) return
      s.delete(handler)
      if (s.size === 0) exitSubs.delete(id)
    }
  },

  publishExit(id: string, code: number | null): void {
    const set = exitSubs.get(id)
    if (!set) return
    set.forEach((h) => {
      try { h(code) } catch { /* swallow */ }
    })
  },
}
