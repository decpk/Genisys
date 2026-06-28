import type { Note } from '@/store/notes-store'

export async function fetchNotes(appId: string, scopeType: string, scopeId: string): Promise<Note[]> {
  return (await window.api.loadNotes(appId, scopeType, scopeId)) as Note[]
}
