import { useCallback, useEffect, useRef, useState } from 'react'

export function useDropdown() {
  const [open, setOpen] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getTriggerRect = useCallback((): DOMRect | null => {
    return triggerRef.current?.getBoundingClientRect() ?? null
  }, [])

  const toggle = useCallback(() => setOpen((prev) => !prev), [])
  const close = useCallback(() => {
    setOpen(false)
    setAnchorRect(null)
  }, [])

  const openAt = useCallback((rect: DOMRect) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setAnchorRect(rect)
    setOpen(true)
  }, [])

  const openMenu = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setOpen(true)
  }, [])

  const scheduleClose = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setOpen(false)
      hoverTimeoutRef.current = null
    }, 100)
  }, [])

  const cancelClose = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  return {
    open,
    setOpen,
    anchorRect,
    triggerRef,
    menuRef,
    getTriggerRect,
    toggle,
    close,
    openAt,
    openMenu,
    scheduleClose,
    cancelClose,
  }
}

export function useClickOutside(
  menuRef: React.RefObject<HTMLDivElement | null>,
  triggerRef: React.RefObject<HTMLDivElement | null>,
  open: boolean,
  onClose: () => void
) {
  useEffect(() => {
    if (!open) return

    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const isInsideMenu = menuRef.current?.contains(target)
      const isInsideTrigger = triggerRef.current?.contains(target)
      if (!isInsideMenu && !isInsideTrigger) onClose()
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose, menuRef, triggerRef])
}

/**
 * Auto-closes an open dropdown whenever it can no longer be meaningfully
 * interacted with. The menu is portaled to <body>, so it survives changes to
 * the surrounding app/panel (e.g. switching apps marks the inactive pane
 * `inert`, or a right-panel tab is hidden via display:none). Without this, a
 * dropdown opened in one app keeps floating on top of whatever the user
 * switches to. We also close on viewport scroll/resize and window blur, since
 * the fixed-position menu would otherwise detach from its trigger.
 */
export function useAutoCloseDropdown(
  menuRef: React.RefObject<HTMLDivElement | null>,
  triggerRef: React.RefObject<HTMLDivElement | null>,
  open: boolean,
  onClose: () => void
) {
  useEffect(() => {
    if (!open) return

    // Close when the trigger becomes hidden or part of an inert subtree
    // (e.g. an inactive app pane or a display:none panel tab).
    const isTriggerUnreachable = (): boolean => {
      const el = triggerRef.current
      if (!el) return true
      if (el.offsetParent === null) return true
      return el.closest('[inert]') !== null
    }

    const closeIfUnreachable = (): void => {
      if (isTriggerUnreachable()) onClose()
    }

    const observer = new MutationObserver(closeIfUnreachable)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['inert', 'style', 'class', 'hidden'],
      subtree: true,
    })

    // Scrolling the page (not the menu's own list) detaches the fixed menu
    // from its trigger, so close it. Resizing/blurring does the same.
    const handleScroll = (e: Event): void => {
      const target = e.target as Node | null
      if (target && menuRef.current?.contains(target)) return
      onClose()
    }
    const handleResize = (): void => onClose()
    const handleBlur = (): void => onClose()

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    window.addEventListener('blur', handleBlur)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('blur', handleBlur)
    }
  }, [open, onClose, menuRef, triggerRef])
}
