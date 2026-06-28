import { create } from 'zustand'

import type { AppView } from '@/components/ActivityBar'
import { useTimerStore } from '@/store/timer-store'

export interface PendingQuickNote {
  title: string
  content: string
  source: {
    appId: string
    label: string
    contextId?: string
    contextLabel?: string
  }
}

interface NavigationState {
  pendingConversationId: string | null
  pendingLibraryBookId: string | null
  pendingQuickNote: PendingQuickNote | null
  pendingChatPromptContent: string | null
  pendingDailyPlanTaskId: string | null
  pendingApiClientRequestId: string | null
  pendingTerminalCommand: string | null
  pendingAppStoreDetailId: AppView | null
}

interface NavigationActions {
  openConversation: (conversationId: string) => void
  consumeConversation: () => void
  openLibraryBook: (bookId: string) => void
  consumeLibraryBook: () => void
  addToNote: (title: string, content: string, source: PendingQuickNote['source']) => void
  consumeQuickNote: () => void
  openChatWithPrompt: (content: string) => void
  consumeChatPrompt: () => void
  openTimerForTask: (dailyPlanTaskId: string, taskName?: string) => void
  openDailyPlanTask: (taskId: string) => void
  consumeDailyPlanTask: () => void
  openApiClientRequest: (requestId: string) => void
  consumeApiClientRequest: () => void
  openTerminalWithCommand: (command: string) => void
  consumeTerminalCommand: () => void
  openAppStoreDetail: (appId: AppView) => void
  consumeAppStoreDetail: () => void
  setActiveApp: (app: AppView) => void
}

type NavigationStore = NavigationState & NavigationActions

let _setActiveApp: ((app: AppView) => void) | null = null

export function bindSetActiveApp(fn: (app: AppView) => void): void {
  _setActiveApp = fn
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  pendingConversationId: null,
  pendingLibraryBookId: null,
  pendingQuickNote: null,
  pendingApiClientRequestId: null,
  pendingChatPromptContent: null,
  pendingDailyPlanTaskId: null,
  pendingTerminalCommand: null,
  pendingAppStoreDetailId: null,

  openConversation: (conversationId) => {
    set({ pendingConversationId: conversationId })
    _setActiveApp?.('chat')
  },

  consumeConversation: () => set({ pendingConversationId: null }),

  openLibraryBook: (bookId) => {
    set({ pendingLibraryBookId: bookId })
    _setActiveApp?.('library')
  },

  consumeLibraryBook: () => set({ pendingLibraryBookId: null }),

  addToNote: (title, content, source) => {
    set({ pendingQuickNote: { title, content, source } })
    _setActiveApp?.('notes')
  },

  consumeQuickNote: () => set({ pendingQuickNote: null }),

  openChatWithPrompt: (content) => {
    set({ pendingChatPromptContent: content })
    _setActiveApp?.('chat')
  },

  consumeChatPrompt: () => set({ pendingChatPromptContent: null }),

  openTimerForTask: (dailyPlanTaskId, taskName) => {
    const timerStore = useTimerStore.getState()
    const existing = timerStore.instances.find(
      (i) => i.dailyPlanTaskId === dailyPlanTaskId,
    )
    if (existing) {
      timerStore.setPrimary(existing.id)
    } else {
      timerStore.createInstance({
        mode: 'pomodoro',
        dailyPlanTaskId,
        name: taskName ?? 'Task timer',
      })
    }
    _setActiveApp?.('timer')
  },

  // TODO: deep DailyPlan focus integration — for now just navigate to DailyPlan
  // and surface the pending task id so DailyPlan can opt-in to focus it.
  openDailyPlanTask: (taskId) => {
    set({ pendingDailyPlanTaskId: taskId })
    _setActiveApp?.('dailyplan')
  },

  consumeDailyPlanTask: () => set({ pendingDailyPlanTaskId: null }),
openApiClientRequest: (requestId) => {
    set({ pendingApiClientRequestId: requestId })
    _setActiveApp?.('apiclient')
  },

  consumeApiClientRequest: () => set({ pendingApiClientRequestId: null }),

  openTerminalWithCommand: (command) => {
    set({ pendingTerminalCommand: command })
    _setActiveApp?.('terminal')
  },

  consumeTerminalCommand: () => set({ pendingTerminalCommand: null }),

  openAppStoreDetail: (appId) => {
    set({ pendingAppStoreDetailId: appId })
    _setActiveApp?.('appstore')
  },

  consumeAppStoreDetail: () => set({ pendingAppStoreDetailId: null }),

  setActiveApp: (app) => {
    _setActiveApp?.(app)
  },
}))
