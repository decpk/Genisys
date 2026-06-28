export async function terminalWrite(id: string, dataBase64: string): Promise<void> {
  const res = await (window as any).api.terminalWrite(id, dataBase64)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to write to terminal')
  }
}
