import { useEffect, useState } from 'react'

import type { BrowserApp } from '@/tauri-api-bridge'

import { listInstalledBrowsers } from './api/listInstalledBrowsers'

// Session-level cache: the installed-browser list is static, so fetch it once.
let cachedBrowsers: BrowserApp[] | null = null

/**
 * Return the installed browsers Genisys can open URLs in. Fetches once and caches
 * at module scope; returns an empty array until loaded (and on non-macOS).
 */
export function useInstalledBrowsers(): BrowserApp[] {
  const [browsers, setBrowsers] = useState<BrowserApp[]>(cachedBrowsers ?? [])

  useEffect(() => {
    if (cachedBrowsers) return
    let active = true
    void listInstalledBrowsers().then((list) => {
      cachedBrowsers = list
      if (active) setBrowsers(list)
    })
    return () => {
      active = false
    }
  }, [])

  return browsers
}
