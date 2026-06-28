export async function terminalKill(id: string): Promise<void> {
  const res = await (window as any).api.terminalKill(id)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to kill terminal session')
  }
}
