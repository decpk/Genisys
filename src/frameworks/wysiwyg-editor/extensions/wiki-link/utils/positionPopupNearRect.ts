/**
 * Position a fixed popup element just below a caret rect, flipping above when
 * it would overflow the viewport bottom and clamping horizontally. Self
 * contained so the wiki-link suggestion does not depend on the slash-command
 * popup internals.
 */
export function positionPopupNearRect(
  popup: HTMLDivElement,
  clientRect: (() => DOMRect | null) | null | undefined,
): void {
  const rect = clientRect?.()
  if (!rect) return

  const gap = 4

  Object.assign(popup.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.bottom + gap}px`,
    zIndex: '9999',
  })

  requestAnimationFrame(() => {
    const popupHeight = popup.offsetHeight
    const popupWidth = popup.offsetWidth
    if (!popupHeight) return

    let top = rect.bottom + gap
    let left = rect.left

    if (top + popupHeight > window.innerHeight) {
      const aboveTop = rect.top - popupHeight - gap
      if (aboveTop >= 0) {
        top = aboveTop
      } else {
        top =
          rect.top > window.innerHeight - rect.bottom
            ? Math.max(0, rect.top - popupHeight - gap)
            : window.innerHeight - popupHeight
      }
    }

    if (left + popupWidth > window.innerWidth) {
      left = window.innerWidth - popupWidth - 8
    }
    left = Math.max(0, left)

    popup.style.top = `${top}px`
    popup.style.left = `${left}px`
  })
}
