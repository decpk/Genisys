import type { NoteProject } from '../../note-projects-store'

type Get = () => any
type Set = (partial: any) => void

interface Appearance {
  color?: string | null
  emoji?: string | null
}

/**
 * Update a project's color OR emoji. Mutually exclusive — setting one
 * clears the other so a project never shows both icon glyphs at once.
 */
export async function setProjectAppearanceAction(
  get: Get,
  set: Set,
  id: string,
  appearance: Appearance,
): Promise<void> {
  const state = get()
  const existing = state.projects.find((p: NoteProject) => p.id === id)
  if (!existing) return

  let nextColor = existing.color
  let nextEmoji = existing.emoji

  if ('emoji' in appearance) {
    nextEmoji = appearance.emoji ?? null
    if (nextEmoji) nextColor = null
  }
  if ('color' in appearance) {
    nextColor = appearance.color ?? null
    if (nextColor) nextEmoji = null
  }

  const updated: NoteProject = {
    ...existing,
    color: nextColor,
    emoji: nextEmoji,
    updatedAt: new Date().toISOString(),
  }

  set({
    projects: state.projects.map((p: NoteProject) => (p.id === id ? updated : p)),
  })

  try {
    await window.api.saveNoteProject(updated)
  } catch (err) {
    console.error('[note-projects] setProjectAppearance failed', err)
  }
}
