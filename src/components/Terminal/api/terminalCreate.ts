export async function terminalCreate(params?: {
  cwd?: string
  shell?: string
  args?: string[]
  cols?: number
  rows?: number
  env?: Record<string, string>
}): Promise<{ id: string; shell: string; cwd: string | null }> {
  const res = await (window as any).api.terminalCreate(params)
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to create terminal session')
  }
  return res.data
}
