import { useRef, useCallback, useEffect } from 'react'
import type * as monaco from 'monaco-editor'

export function useScrollSync(
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
  previewRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const scrollSourceRef = useRef<'editor' | 'preview' | null>(null)
  const scrollSourceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef(0)

  const clearScrollSource = useCallback(() => {
    if (scrollSourceTimerRef.current) {
      clearTimeout(scrollSourceTimerRef.current)
    }
    scrollSourceTimerRef.current = setTimeout(() => {
      scrollSourceRef.current = null
    }, 50)
  }, [])

  // Editor → Preview sync
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !enabled) return

    const disposable = editor.onDidScrollChange((e) => {
      if (scrollSourceRef.current === 'preview') return
      scrollSourceRef.current = 'editor'
      clearScrollSource()

      const preview = previewRef.current
      if (!preview) return

      const editorScrollHeight = editor.getScrollHeight()
      const editorHeight = editor.getLayoutInfo().height
      const maxEditorScroll = editorScrollHeight - editorHeight
      if (maxEditorScroll <= 0) return

      const fraction = e.scrollTop / maxEditorScroll

      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const maxPreviewScroll = preview.scrollHeight - preview.clientHeight
        if (maxPreviewScroll <= 0) return
        preview.scrollTop = fraction * maxPreviewScroll
      })
    })

    return () => disposable.dispose()
  }, [editorRef, previewRef, clearScrollSource, enabled])

  // Preview → Editor sync
  const handlePreviewScroll = useCallback(() => {
    if (!enabled) return
    if (scrollSourceRef.current === 'editor') return
    scrollSourceRef.current = 'preview'
    clearScrollSource()

    const editor = editorRef.current
    const preview = previewRef.current
    if (!editor || !preview) return

    const maxPreviewScroll = preview.scrollHeight - preview.clientHeight
    if (maxPreviewScroll <= 0) return

    const fraction = preview.scrollTop / maxPreviewScroll

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const editorScrollHeight = editor.getScrollHeight()
      const editorHeight = editor.getLayoutInfo().height
      const maxEditorScroll = editorScrollHeight - editorHeight
      if (maxEditorScroll <= 0) return
      editor.setScrollTop(fraction * maxEditorScroll)
    })
  }, [editorRef, previewRef, clearScrollSource, enabled])

  // Attach preview scroll listener
  useEffect(() => {
    const preview = previewRef.current
    if (!preview) return
    preview.addEventListener('scroll', handlePreviewScroll, { passive: true })
    return () => preview.removeEventListener('scroll', handlePreviewScroll)
  }, [previewRef, handlePreviewScroll])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (scrollSourceTimerRef.current) clearTimeout(scrollSourceTimerRef.current)
    }
  }, [])
}
