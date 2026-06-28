export async function toggleNotePin(noteId: string): Promise<void> {
  const result = (await window.api.toggleNotePin(noteId)) as { success: boolean }
  if (!result.success) throw new Error('Failed to toggle note pin')
}
