import {
  AppWindow,
  Bookmark,
  BotMessageSquare,
  CalendarCheck,
  ClipboardPaste,
  Command,
  FileText,
  ListChecks,
  NotebookPen,
  Palette,
  Send,
  Server,
} from 'lucide-react'

import type { PaletteKind, PaletteKindConfig } from './CommandPalette.types'

// ── Limits ───────────────────────────────────────────────────────────

export const RECENTS_MAX = 50
export const EMPTY_GROUP_LIMIT = 6
export const FUSE_THRESHOLD = 0.35
export const MAX_RESULTS = 200

// ── Fuse.js options ──────────────────────────────────────────────────

export const FUSE_KEYS = [
  { name: 'title', weight: 0.7 },
  { name: 'subtitle', weight: 0.15 },
  { name: 'keywords', weight: 0.15 },
] as const

// ── Kind config registry ─────────────────────────────────────────────

export const KIND_CONFIG: Record<PaletteKind, PaletteKindConfig> = {
  app: {
    kind: 'app',
    label: 'App',
    pluralLabel: 'Apps',
    aliases: ['app', 'apps'],
    icon: AppWindow,
    iconColor: 'text-sky-400',
    inQuickOpen: true,
    inCommands: false,
  },
  note: {
    kind: 'note',
    label: 'Note',
    pluralLabel: 'Notes',
    aliases: ['note', 'notes'],
    icon: NotebookPen,
    iconColor: 'text-amber-400',
    inQuickOpen: true,
    inCommands: false,
  },
  book: {
    kind: 'book',
    label: 'Book',
    pluralLabel: 'Books',
    aliases: ['book', 'books', 'lib', 'library'],
    icon: FileText,
    iconColor: 'text-emerald-400',
    inQuickOpen: true,
    inCommands: false,
  },
  chapter: {
    kind: 'chapter',
    label: 'Chapter',
    pluralLabel: 'Chapters',
    aliases: ['chapter', 'chapters'],
    icon: FileText,
    iconColor: 'text-emerald-300',
    inQuickOpen: true,
    inCommands: false,
  },
  task: {
    kind: 'task',
    label: 'Task',
    pluralLabel: 'Tasks',
    aliases: ['task', 'tasks', 'todo', 'todos'],
    icon: ListChecks,
    iconColor: 'text-rose-400',
    inQuickOpen: true,
    inCommands: false,
  },
  meeting: {
    kind: 'meeting',
    label: 'Meeting',
    pluralLabel: 'Meetings',
    aliases: ['meeting', 'meetings', 'event', 'events'],
    icon: CalendarCheck,
    iconColor: 'text-indigo-400',
    inQuickOpen: true,
    inCommands: false,
  },
  apirequest: {
    kind: 'apirequest',
    label: 'API Request',
    pluralLabel: 'API Requests',
    aliases: ['api', 'request', 'requests'],
    icon: Send,
    iconColor: 'text-cyan-400',
    inQuickOpen: true,
    inCommands: false,
  },
  mockendpoint: {
    kind: 'mockendpoint',
    label: 'Mock Endpoint',
    pluralLabel: 'Mock Endpoints',
    aliases: ['mock', 'mocks', 'endpoint', 'endpoints'],
    icon: Server,
    iconColor: 'text-violet-400',
    inQuickOpen: true,
    inCommands: false,
  },
  bookmark: {
    kind: 'bookmark',
    label: 'Bookmark',
    pluralLabel: 'Bookmarks',
    aliases: ['bookmark', 'bookmarks'],
    icon: Bookmark,
    iconColor: 'text-yellow-400',
    inQuickOpen: true,
    inCommands: false,
  },
  chat: {
    kind: 'chat',
    label: 'Conversation',
    pluralLabel: 'Conversations',
    aliases: ['chat', 'chats', 'conversation', 'conversations'],
    icon: BotMessageSquare,
    iconColor: 'text-fuchsia-400',
    inQuickOpen: true,
    inCommands: false,
  },
  clipboard: {
    kind: 'clipboard',
    label: 'Clipboard',
    pluralLabel: 'Clipboard',
    aliases: ['clip', 'clipboard'],
    icon: ClipboardPaste,
    iconColor: 'text-orange-400',
    inQuickOpen: true,
    inCommands: false,
  },
  command: {
    kind: 'command',
    label: 'Command',
    pluralLabel: 'Commands',
    aliases: ['cmd', 'command', 'commands'],
    icon: Command,
    iconColor: 'text-zinc-300',
    inQuickOpen: false,
    inCommands: true,
  },
  theme: {
    kind: 'theme',
    label: 'Theme',
    pluralLabel: 'Themes',
    aliases: ['theme', 'themes'],
    icon: Palette,
    iconColor: 'text-pink-400',
    inQuickOpen: false,
    inCommands: true,
  },
}

// ── Aliases ──────────────────────────────────────────────────────────

export const KIND_ALIASES: Record<string, PaletteKind> = (() => {
  const map: Record<string, PaletteKind> = {}
  for (const cfg of Object.values(KIND_CONFIG)) {
    for (const alias of cfg.aliases) {
      map[alias.toLowerCase()] = cfg.kind
    }
  }
  return map
})()
