import { useEffect, useRef } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'

/**
 * Root data hook for the Previewer app. Loads all folders + saved previews
 * from the backend exactly once on mount. Guarded with both a ref and the
 * store's `isLoaded` flag so a re-render (or a fast remount) never re-fires the
 * load. Returns nothing — consumers just call it for the side effect.
 */
export function useWebLinksData(): void {
  const isLoaded = useWebLinksStore((state) => state.isLoaded)
  const loadAll = useWebLinksStore((state) => state.loadAll)

  const didLoad = useRef(false)

  useEffect(() => {
    if (didLoad.current || isLoaded) return;
    didLoad.current = true;
    void loadAll();
  }, [isLoaded, loadAll]);
}
