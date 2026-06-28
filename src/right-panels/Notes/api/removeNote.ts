export async function removeNote(noteId: string): Promise<void> {
  const result = (await window.api.removeNote(noteId)) as { success: boolean }
  if (!result.success) throw new Error('Failed to remove note')
}
