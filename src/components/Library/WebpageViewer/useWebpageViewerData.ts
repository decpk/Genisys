import { useState, useEffect, useCallback, useMemo } from 'react'

import { useWebpageStore } from '@/store/webpage-store'
import { useThemeStore } from '@/store/theme-store'
import { THEMES } from '@/themes'
import { isHtmlWebpage } from '@/store/utils/isHtmlWebpage'
import type { ThemeOverride } from './utils/injectDarkTheme'

import { parseMhtml } from './utils/parseMhtml'

export function useWebpageViewerData(webpageId: string) {
  const [rawContent, setRawContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const webpages = useWebpageStore((s) => s.webpages)
  const updateWebpage = useWebpageStore((s) => s.updateWebpage)
  const removeWebpage = useWebpageStore((s) => s.removeWebpage)
  const selectWebpage = useWebpageStore((s) => s.selectWebpage)

  const activeThemeId = useThemeStore((s) => s.activeThemeId)

  const themeOverride = useMemo((): ThemeOverride | null => {
    const theme = THEMES.find((t) => t.id === activeThemeId)
    if (!theme) return null
    const c = theme.colors
    return {
      background: c.background,
      foreground: c.foreground,
      muted: c.muted,
      mutedForeground: c['muted-foreground'],
      border: c.border,
      card: c.card,
      cardForeground: c['card-foreground'],
      isDark: theme.isDark,
    }
  }, [activeThemeId])

  const webpage = webpages.find((w) => w.id === webpageId) ?? null

  useEffect(() => {
    let cancelled = false

    async function loadContent() {
      setIsLoading(true)
      try {
        const content = await window.api.loadWebpageContent(webpageId)
        if (cancelled) return
        setRawContent(content)
      } catch (e) {
        if (!cancelled) {
          console.error('[WebpageViewer] Failed to load content:', e)
          setRawContent(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadContent()
    return () => {
      cancelled = true
    }
  }, [webpageId])

  // Re-derive when theme changes. HTML pages are self-contained documents and
  // render exactly as authored (browser-faithful) so their own styling is
  // preserved; MHTML pages go through the parser + theme override.
  const htmlContent = useMemo(() => {
    if (!rawContent) return null
    if (webpage && isHtmlWebpage(webpage)) {
      return rawContent
    }
    return parseMhtml(rawContent, themeOverride)
  }, [rawContent, themeOverride, webpage])

  const handleUpdate = useCallback(async () => {
    setIsUpdating(true)
    try {
      await updateWebpage(webpageId)
      const content = await window.api.loadWebpageContent(webpageId)
      setRawContent(content)
    } catch (e) {
      console.error('[WebpageViewer] Failed to update webpage:', e)
    } finally {
      setIsUpdating(false)
    }
  }, [webpageId, updateWebpage])

  const handleDelete = useCallback(async () => {
    await removeWebpage(webpageId)
    selectWebpage(null)
  }, [webpageId, removeWebpage, selectWebpage])

  const handleOpenExternal = useCallback(() => {
    if (webpage?.url) {
      window.open(webpage.url, '_blank')
    }
  }, [webpage])

  return {
    webpage,
    htmlContent,
    isLoading,
    isUpdating,
    handleUpdate,
    handleDelete,
    handleOpenExternal,
  }
}
