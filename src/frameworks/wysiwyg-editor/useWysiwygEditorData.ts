import { useRef, useCallback, useEffect, useMemo } from 'react'
import { useEditor } from '@tiptap/react'
import { buildExtensions } from './constants/extensions'
import { WysiwygSlashCommand } from './extensions/slash-command'
import { slashSuggestionOptions } from './extensions/slash-suggestion-options'
import { AiAutocomplete } from './extensions/ai-autocomplete'
import { AiInlineWriter } from './extensions/ai-inline-writer'
import { WikiLink } from './extensions/wiki-link'
import type { WysiwygEditorProps } from './WysiwygEditor.types'

export function useWysiwygEditorData(props: WysiwygEditorProps) {
  const { value, onChange, readOnly, placeholder, autoFocus, enableAIAutocomplete, wikiLink, onEditorReady } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Keep the latest onEditorReady callback in a ref so its identity doesn't
  // gate the `[editor]` effect below (callers usually pass a fresh arrow).
  const onEditorReadyRef = useRef(onEditorReady)
  onEditorReadyRef.current = onEditorReady

  // Track whether the update came from the editor itself to avoid loops
  const isInternalUpdate = useRef(false)

  const handleUpdate = useCallback(
    ({ editor }: { editor: any }) => {
      isInternalUpdate.current = true
      if (onChangeRef.current) {
        const md = editor.storage.markdown.getMarkdown() as string
        onChangeRef.current(md)
      }
      // Reset after a tick so the subsequent useEffect skip works
      requestAnimationFrame(() => {
        isInternalUpdate.current = false
      })
    },
    [],
  )

  const extensions = useMemo(
    () => {
      const base = [
        ...buildExtensions(placeholder),
        WysiwygSlashCommand.configure({
          suggestion: {
            ...WysiwygSlashCommand.options.suggestion,
            ...slashSuggestionOptions(),
          },
        }),
      ]

      if (enableAIAutocomplete) {
        base.push(AiAutocomplete.configure())
        base.push(AiInlineWriter.configure())
      }

      if (wikiLink) {
        base.push(WikiLink.configure(wikiLink))
      }

      return base
    },
    [placeholder, enableAIAutocomplete, wikiLink],
  )

  const editor = useEditor({
    extensions,
    content: value ?? '',
    editable: !readOnly,
    autofocus: autoFocus ? 'end' : false,
    onUpdate: handleUpdate,
  })

  // Keep runtime editability in sync when readOnly changes after mount.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    editor.setEditable(!readOnly)
  }, [editor, readOnly])

  // Sync editor content when value prop changes externally
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    if (isInternalUpdate.current) return

    const currentMd = editor.storage.markdown?.getMarkdown() as string | undefined
    if (currentMd !== value) {
      editor.commands.setContent(value ?? '')
    }
  }, [editor, value])

  // Surface the editor instance to consumers that need a direct handle
  // (e.g. TOC providers). Notifies with `null` on teardown so consumers can
  // detach observers/listeners.
  useEffect(() => {
    onEditorReadyRef.current?.(editor)
    return () => {
      onEditorReadyRef.current?.(null)
    }
  }, [editor])

  return {
    editor,
    containerRef,
  }
}
