import {
  BookOpen,
  CalendarPlus,
  ClipboardList,
  ListPlus,
  NotebookPen,
  Plus,
  Send,
  Server,
  Sparkles,
  Timer,
} from 'lucide-react'

import { useNavigationStore } from '@/store/navigation-store'
import { useSettingsStore } from '@/store/settings-store'

import { safeRun } from '../utils/safeRun'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

/**
 * Each entry switches to the relevant app and dispatches a CustomEvent
 * that the owning app listens for to actually open its create flow.
 *
 * Convention: `<app>:command-palette:create-<entity>`.
 *
 * If a target app does not yet listen for the event, the user is at least
 * navigated to the right app (graceful fallback).
 */
interface CreateEntry {
  entity: string
  title: string
  app: Parameters<ReturnType<typeof useNavigationStore.getState>['setActiveApp']>[0]
  event: string
  icon: PaletteItem['icon']
  keywords?: string[]
}

const CREATE_ENTRIES: CreateEntry[] = [
  {
    entity: "note",
    title: "New Note",
    app: "notes",
    event: "notes:command-palette:create-note",
    icon: NotebookPen,
    keywords: ["create", "add", "new", "note", "notebook", "memo", "write"],
  },
  {
    entity: "book",
    title: "New Book",
    app: "library",
    event: "library:command-palette:create-book",
    icon: BookOpen,
    keywords: [
      "create",
      "add",
      "new",
      "book",
      "library",
      "reading",
      "generate",
    ],
  },
  {
    entity: "task",
    title: "New Task",
    app: "dailyplan",
    event: "dailyplan:command-palette:create-task",
    icon: ListPlus,
    keywords: ["create", "add", "new", "task", "todo", "item", "daily plan"],
  },
  {
    entity: "meeting",
    title: "New Meeting",
    app: "dailyplan",
    event: "dailyplan:command-palette:create-meeting",
    icon: CalendarPlus,
    keywords: [
      "create",
      "add",
      "new",
      "meeting",
      "event",
      "calendar",
      "schedule",
      "appointment",
    ],
  },
  {
    entity: "apirequest",
    title: "New API Request",
    app: "apiclient",
    event: "apiclient:command-palette:create-request",
    icon: Send,
    keywords: [
      "create",
      "add",
      "new",
      "api",
      "request",
      "http",
      "rest",
      "endpoint",
      "curl",
    ],
  },
  {
    entity: "mockendpoint",
    title: "New Mock Endpoint",
    app: "mockserver",
    event: "mockserver:command-palette:create-endpoint",
    icon: Server,
    keywords: [
      "create",
      "add",
      "new",
      "mock",
      "endpoint",
      "route",
      "api",
      "stub",
    ],
  },
  {
    entity: "mockproject",
    title: "New Mock Server",
    app: "mockserver",
    event: "mockserver:command-palette:create-project",
    icon: Server,
    keywords: [
      "create",
      "add",
      "new",
      "mock",
      "server",
      "project",
      "fake",
      "fixture",
    ],
  },
  {
    entity: "prompt",
    title: "New Prompt",
    app: "chat",
    event: "promptmanager:command-palette:create-prompt",
    icon: Sparkles,
    keywords: ["create", "add", "new", "prompt", "template", "ai", "snippet"],
  },
  {
    entity: "timer",
    title: "New Timer",
    app: "timer",
    event: "timer:command-palette:create-timer",
    icon: Timer,
    keywords: [
      "create",
      "add",
      "new",
      "timer",
      "pomodoro",
      "focus",
      "countdown",
      "start",
    ],
  },
  {
    entity: "clipboard",
    title: "Open Clipboard",
    app: "clipboard",
    event: "clipboard:command-palette:open",
    icon: ClipboardList,
    keywords: ["view", "open", "clipboard", "copy", "paste", "history"],
  },
];

void Plus // reserved for future generic-create entries

export const createCommandsSource: PaletteSource = {
  id: 'createCommands',
  kinds: ['command'],
  getItems(): PaletteItem[] {
    const { isAppEnabled } = useSettingsStore.getState()
    return CREATE_ENTRIES.filter((entry) => isAppEnabled(entry.app)).map(
      (entry): PaletteItem => ({
        id: `command:create:${entry.entity}`,
        kind: 'command',
        title: entry.title,
        subtitle: 'Create',
        icon: entry.icon,
        keywords: entry.keywords,
        group: 'create',
        action: () =>
          safeRun(() => {
            useNavigationStore.getState().setActiveApp(entry.app)
            window.dispatchEvent(new CustomEvent(entry.event))
          }),
      }),
    )
  },
}
