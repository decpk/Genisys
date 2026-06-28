import type { Note } from '@/store/notes-store'

export async function saveNote(note: Note): Promise<void> {
  const result = (await window.api.saveNote(note)) as { success: boolean }
  if (!result.success) throw new Error('Failed to save note')
}
