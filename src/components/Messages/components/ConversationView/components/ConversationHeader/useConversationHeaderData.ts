import { useCallback } from 'react'

import { useMessagesStore } from '@/store/messages-store'
import { useSettingsStore } from '@/store/settings-store'

import type { ConversationHeaderData } from './ConversationHeader.types'

export function useConversationHeaderData(): ConversationHeaderData {
  const rightPanelOpen = useMessagesStore((s) => s.rightPanelOpen)
  const setRightPanelOpen = useMessagesStore((s) => s.setRightPanelOpen)
  const contentWidth = useSettingsStore((s) => s.messagesContentWidth)
  const setContentWidth = useSettingsStore((s) => s.setMessagesContentWidth)

  const toggleInfo = useCallback(() => {
    setRightPanelOpen(!rightPanelOpen)
  }, [rightPanelOpen, setRightPanelOpen])

  return { rightPanelOpen, toggleInfo, contentWidth, setContentWidth }
}
