export function onTerminalExit(
  callback: (payload: { id: string; code: number | null }) => void
): () => void {
  return (window as any).api.onTerminalExit(callback)
}
