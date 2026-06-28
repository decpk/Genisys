export async function terminalResize(id: string, cols: number, rows: number): Promise<void> {
  const res = await (window as any).api.terminalResize(id, cols, rows)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to resize terminal')
  }
}
