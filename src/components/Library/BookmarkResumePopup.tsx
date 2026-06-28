import { useState, useEffect, useCallback, useRef } from 'react'
import { Bookmark } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useBookmarkStore, type BookmarkWithContext } from '@/store/bookmark-store'

interface BookmarkResumePopupProps {
  chapterId: string
}

function scrollAndBlink(highlightId: string): void {
  const el = document.getElementById(highlightId)
  if (!el) return

  el.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // Wait for scroll to settle, then blink
  let rafId: number
  const startTime = performance.now()

  const checkScrollDone = (): void => {
    // Give scroll ~600ms to finish
    if (performance.now() - startTime < 600) {
      rafId = requestAnimationFrame(checkScrollDone)
      return
    }
    el.classList.add('bookmark-blink')
    el.addEventListener('animationend', () => {
      el.classList.remove('bookmark-blink')
    }, { once: true })
  }

  rafId = requestAnimationFrame(checkScrollDone)
  // Safety cleanup if component unmounts (unlikely but safe)
  setTimeout(() => cancelAnimationFrame(rafId), 2000)
}

export function BookmarkResumePopup({ chapterId }: BookmarkResumePopupProps): React.JSX.Element | null {
  const [lastBookmark, setLastBookmark] = useState<BookmarkWithContext | null>(null)
  const [open, setOpen] = useState(false)
  const pendingScrollId = useRef<string | null>(null)
  const getChapterBookmarks = useBookmarkStore((s) => s.getChapterBookmarks)

  useEffect(() => {
    setLastBookmark(null)

    let cancelled = false
    getChapterBookmarks(chapterId).then((items) => {
      if (cancelled) return
      const bookmarks = items as BookmarkWithContext[]
      if (bookmarks.length === 0) return
      const sorted = [...bookmarks].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setLastBookmark(sorted[0])
      setTimeout(() => {
        if (!cancelled) setOpen(true)
      }, 500)
    })
    return () => { cancelled = true }
  }, [chapterId, getChapterBookmarks])

  const handleGoToBookmark = useCallback(() => {
    if (!lastBookmark) return
    pendingScrollId.current = lastBookmark.highlightId
    setOpen(false)
  }, [lastBookmark])

  const handleCloseAutoFocus = useCallback((e: Event) => {
    e.preventDefault()
    const id = pendingScrollId.current
    pendingScrollId.current = null
    if (id) {
      requestAnimationFrame(() => scrollAndBlink(id))
    }
  }, [])

  if (!lastBookmark) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[320px] p-0 rounded-xl border-border/60 bg-popover/95 backdrop-blur-lg shadow-lg gap-0"
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bookmark size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Continue where you left off?
              </h3>
              <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2">
                {lastBookmark.label}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 pb-5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setOpen(false)}
          >
            Dismiss
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs gap-1.5"
            onClick={handleGoToBookmark}
          >
            <Bookmark size={12} />
            Go to bookmark
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
