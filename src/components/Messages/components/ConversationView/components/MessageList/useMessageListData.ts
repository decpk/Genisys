import { useCallback, useEffect, useRef } from 'react'

import type { MessageListData } from './MessageList.types'

// Treat the view as "pinned" when the user is within this many px of the end.
const NEAR_BOTTOM_PX = 140

// Keep the conversation pinned to the latest message / typing indicator, and
// re-pin when async media (images) finish loading and grow the layout height —
// but only when the user hasn't scrolled up to read history.
export function useMessageListData(
  count: number,
  isPeerTyping: boolean
): MessageListData {
  const rootRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const nearBottomRef = useRef(true)

  const scrollToBottom = useCallback((smooth: boolean) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end',
    })
  }, [])

  const handleScroll = useCallback(() => {
    const el = rootRef.current
    if (!el) return
    nearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
  }, [])

  const handleMediaLoad = useCallback(() => {
    if (nearBottomRef.current) scrollToBottom(false)
  }, [scrollToBottom])

  useEffect(() => {
    nearBottomRef.current = true
    scrollToBottom(true)
  }, [count, isPeerTyping, scrollToBottom])

  return { rootRef, bottomRef, handleScroll, handleMediaLoad }
}
