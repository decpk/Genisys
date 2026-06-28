import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

export const LIBRARY_ACTIONS_SHORTCUTS: ShortcutDef[] = [
  {
    id: 'library.toggleRead',
    label: 'Mark as Read / Unread',
    description: 'Toggle the read status of the current chapter',
    scope: 'library',
    defaultKeys: 'Mod+Shift+M',
    category: 'Library',
  },
  {
    id: 'library.toggleDistractionFree',
    label: 'Distraction-Free Reading',
    description: 'Toggle distraction-free reading mode',
    scope: 'library',
    defaultKeys: 'Mod+Shift+F',
    category: 'Library',
  },
  {
    id: 'library.editChapter',
    label: 'Edit Chapter',
    description: 'Open the chapter editor',
    scope: 'library',
    defaultKeys: 'Mod+Shift+E',
    category: 'Library',
  },
]

export const NOTES_ACTIONS_SHORTCUTS: ShortcutDef[] = [
  {
    id: 'notes.toggleFullScreen',
    label: 'Notes: Full Screen',
    description: 'Toggle distraction-free / full screen in Notes',
    scope: 'notes',
    defaultKeys: 'Mod+Shift+F',
    category: 'Notes',
  },
  {
    id: 'notes.toggleLabels',
    label: 'Toggle Labels',
    description: 'Show or hide labels on notes',
    scope: 'notes',
    defaultKeys: 'Mod+Shift+L',
    category: 'Notes',
  },
]
