import { memo, useState, useEffect } from 'react'

import { getHighlighter } from './highlighter'

interface HighlightedCodeProps {
  code: string
  lang: string
}

export const HighlightedCode = memo(function HighlightedCode({
  code,
  lang,
}: HighlightedCodeProps): React.JSX.Element {
  const [html, setHtml] = useState<string>('')
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return
        const supported = highlighter.getLoadedLanguages()
        const useLang = supported.includes(lang) ? lang : 'text'
        if (useLang === 'text') return
        const result = highlighter.codeToHtml(code, {
          lang: useLang,
          theme: isDark ? 'one-dark-pro' : 'github-light',
        })
        if (!cancelled) setHtml(result)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [code, lang, isDark])

  if (!html) {
    return (
      <pre className="overflow-x-auto p-4 !m-0 !bg-transparent !border-0 !rounded-none">
        <code className="text-sm leading-6">{code}</code>
      </pre>
    )
  }

  return (
    <div
      className="overflow-x-auto [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:p-4 [&>pre]:!rounded-none [&_code]:!text-sm [&_code]:!leading-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
})
