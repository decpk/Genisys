import { useEffect, useState } from 'react'
import { getHighlighter } from '@/components/ui/markdown-renderer/highlighter'
import { highlightCache } from '../utils/highlightCache'
import { setCachedHighlight } from '../utils/setCachedHighlight'
import { buildHighlightCacheKey } from '../utils/buildHighlightCacheKey'
import { resolveShikiLanguage } from '../utils/resolveShikiLanguage'

interface UseShikiHighlightArgs {
  code: string
  lang: string
  isDark: boolean
}

interface AsyncResolution {
  key: string
  html: string
}

const EMPTY_RESOLUTION: AsyncResolution = { key: '', html: '' }

/**
 * Resolves Shiki HTML for the given (code, lang, theme) tuple.
 *
 * Cache hits are read **at render time** so the cache-hit path doesn't go
 * through `useState` / `useEffect` (which would otherwise trigger a sync
 * `setState` inside an effect — flagged by `react-hooks/set-state-in-effect`).
 *
 * Misses are resolved asynchronously via the Shiki singleton; once resolved,
 * the result is written to the shared cache and the component re-renders.
 *
 * Returns an empty string while loading or for unsupported languages — the
 * View renders a plain `<pre>` fallback in that case.
 */
export function useShikiHighlight(args: UseShikiHighlightArgs): { html: string } {
  const { code, lang, isDark } = args
  const theme = isDark ? 'one-dark-pro' : 'github-light'
  const key = buildHighlightCacheKey(lang, theme, code)
  const cachedHtml = highlightCache.get(key) ?? ''
  const [resolution, setResolution] = useState<AsyncResolution>(EMPTY_RESOLUTION)

  useEffect(() => {
    if (highlightCache.has(key)) return

    let cancelled = false

    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return
        const supported = highlighter.getLoadedLanguages()
        const useLang = resolveShikiLanguage(lang, supported)
        if (useLang === 'text') return
        const result = highlighter.codeToHtml(code, { lang: useLang, theme })
        if (cancelled) return
        setCachedHighlight(key, result)
        setResolution({ key, html: result })
      })
      .catch(() => {
        // Swallow — fallback <pre> renders below.
      })

    return () => {
      cancelled = true
    }
  }, [code, lang, theme, key])

  let html: string
  if (cachedHtml) {
    html = cachedHtml
  } else if (resolution.key === key) {
    html = resolution.html
  } else {
    html = ''
  }

  return { html }
}
