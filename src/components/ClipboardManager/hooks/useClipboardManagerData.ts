import { useEffect } from 'react'
import { useClipboardStore } from '@/store/clipboard-store'
import { useClipboardLabelStore } from "@/store/clipboard-label-store";

// NOTE: Backend event subscriptions (onClipboardNewItem, onClipboardImageAnalyzed,
// onClipboardItemMoved) and the "add once" backend sync live in
// `useClipboardEvents` at the GenisysApp level so they fire regardless of
// whether this component is mounted. The Clipboard app is lazy-mounted, so
// keeping those listeners here would miss screenshots taken while the user
// has not yet opened the Clipboard app this session.
export function useClipboardManagerData() {
  const isLoaded = useClipboardStore((s) => s.isLoaded)
  const loadItems = useClipboardStore((s) => s.loadItems)
  const loadStats = useClipboardStore((s) => s.loadStats);
  const loadLabels = useClipboardLabelStore((s) => s.loadLabels)

  useEffect(() => {
    if (!isLoaded) {
      loadItems(true)
    }
    // Always refresh stats and labels on mount so the sidebar counters and
    // label list recover from any earlier failed/missed load (e.g. backend
    // not ready on first call, or items prepended via app-level events while
    // the Clipboard app was unmounted).
    loadLabels()
    loadStats()
  }, [isLoaded, loadItems, loadStats, loadLabels])

  return { isLoaded }
}
