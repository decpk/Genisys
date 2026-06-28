export function onTerminalOutput(
  callback: (payload: { id: string; data: string }) => void
): () => void {
  return (window as any).api.onTerminalOutput(callback)
}
