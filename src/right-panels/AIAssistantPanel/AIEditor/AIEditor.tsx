import {
  useEditor,
  EditorContent,
  type Editor,
  Extension,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from 'react'
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'

import { AIMention, AIMentionPluginKey } from './extensions/mention-extension'
import { MentionPickerMenu } from './MentionPickerMenu'
import type { AIEditorHandle, AIEditorProps, AIMentionItem } from './AIEditor.types'

// ── Types ────────────────────────────────────────────────────

interface SuggestionState {
  items: AIMentionItem[]
  command: ((props: { id: string; label: string }) => void) | null
  clientRect: (() => DOMRect | null) | null
}

// ── Suggestion renderer factory ──────────────────────────────

function createMentionSuggestionRenderer(
  setMenuStateRef: React.MutableRefObject<React.Dispatch<React.SetStateAction<SuggestionState | null>>>,
  keyDownHandlerRef: React.MutableRefObject<((props: SuggestionKeyDownProps) => boolean) | null>,
) {
  return {
    onStart(props: SuggestionProps<AIMentionItem>) {
      setMenuStateRef.current({
        items: props.items,
        command: props.command as SuggestionState['command'],
        clientRect: props.clientRect ?? null,
      })
    },
    onUpdate(props: SuggestionProps<AIMentionItem>) {
      setMenuStateRef.current({
        items: props.items,
        command: props.command as SuggestionState['command'],
        clientRect: props.clientRect ?? null,
      })
    },
    onExit() {
      setMenuStateRef.current(null)
    },
    onKeyDown(props: SuggestionKeyDownProps) {
      if (keyDownHandlerRef.current) {
        return keyDownHandlerRef.current(props)
      }
      return false
    },
  }
}

// ── Enter-to-submit extension ────────────────────────────────

function createSubmitExtension(onSubmit: (intent: 'send' | 'queue') => void) {
  return Extension.create({
    name: 'submitOnEnter',
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          onSubmit('send')
          return true
        },
        // ⌥/Alt+Enter queues the message to run after the current turn.
        'Alt-Enter': () => {
          onSubmit('queue')
          return true
        },
      }
    },
  })
}

// ── Component ────────────────────────────────────────────────

export const AIEditor = forwardRef<AIEditorHandle, AIEditorProps>(
  function AIEditor({ onSubmit, isDisabled, placeholder, mentionConfig }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)

    // Suggestion menu state
    const [menuState, setMenuState] = useState<SuggestionState | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const keyDownHandlerRef = useRef<((props: SuggestionKeyDownProps) => boolean) | null>(null)

    // Stable refs
    const submitRef = useRef(onSubmit)
    submitRef.current = onSubmit
    const isDisabledRef = useRef(isDisabled)
    isDisabledRef.current = isDisabled
    const mentionConfigRef = useRef(mentionConfig)
    mentionConfigRef.current = mentionConfig

    const handleEditorSubmit = useCallback((intent: 'send' | 'queue') => {
      if (isDisabledRef.current) return
      requestAnimationFrame(() => submitRef.current(intent))
    }, [])

    const setMenuStateRef = useRef(setMenuState)
    setMenuStateRef.current = setMenuState

    const triggerChar = mentionConfig?.char ?? '@'

    const extensions = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const base: any[] = [
        StarterKit.configure({
          heading: false,
          blockquote: false,
          codeBlock: false,
          horizontalRule: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
        }),
        Placeholder.configure({
          placeholder: placeholder || 'Type a message…',
        }),
        createSubmitExtension(handleEditorSubmit),
      ]

      if (mentionConfig) {
        base.push(
          AIMention.configure({
            suggestion: {
              char: triggerChar,
              pluginKey: AIMentionPluginKey,
              command: ({ editor: ed, range, props }: { editor: any; range: any; props: any }) => {
                const nodeAfter = ed.view.state.selection.$to.nodeAfter
                const overrideSpace = nodeAfter?.text?.startsWith(' ')
                if (overrideSpace) {
                  range.to += 1
                }
                ed.chain()
                  .focus()
                  .insertContentAt(range, [
                    { type: 'aiMention', attrs: props },
                    { type: 'text', text: ' ' },
                  ])
                  .run()
                window.getSelection()?.collapseToEnd()
              },
              items: async ({ query }: { query: string }) => {
                const cfg = mentionConfigRef.current
                if (!cfg) return []
                return cfg.fetchItems(query)
              },
              render: () =>
                createMentionSuggestionRenderer(setMenuStateRef, keyDownHandlerRef),
            },
          }),
        )
      }

      return base
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleEditorSubmit, triggerChar, !!mentionConfig])

    const editor = useEditor({
      extensions,
      editorProps: {
        attributes: {
          class:
            'explorer-ai-editor block relative w-full resize-none bg-transparent px-1.5 py-1.5 text-[11.5px] leading-[1rem] text-foreground focus:outline-none min-h-[28px] max-h-[260px] overflow-y-auto',
        },
      },
      onUpdate: () => {
        requestAnimationFrame(() => {
          const el = containerRef.current?.querySelector('.ProseMirror')
          if (el instanceof HTMLElement) {
            el.style.height = 'auto'
            el.style.height = `${Math.min(el.scrollHeight, 260)}px`
            el.style.overflow = el.scrollHeight > 260 ? 'auto' : 'hidden'
          }
        })
      },
    })

    // Keyboard handler for the picker menu
    keyDownHandlerRef.current = useCallback(
      (props: SuggestionKeyDownProps): boolean => {
        if (!menuState) return false

        if (props.event.key === 'ArrowDown') {
          props.event.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, menuState.items.length - 1))
          return true
        }
        if (props.event.key === 'ArrowUp') {
          props.event.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          return true
        }
        if (props.event.key === 'Enter' || props.event.key === 'Tab') {
          props.event.preventDefault()
          const item = menuState.items[selectedIndex]
          if (item && menuState.command) {
            menuState.command({ id: item.id, label: item.label })
          }
          return true
        }
        if (props.event.key === 'Escape') {
          props.event.preventDefault()
          setMenuState(null)
          return true
        }
        return false
      },
      [menuState, selectedIndex],
    )

    // Reset selected index when items change
    useEffect(() => {
      setSelectedIndex(0)
    }, [menuState?.items])

    // Auto-focus when not disabled
    useEffect(() => {
      if (!isDisabled) editor?.commands.focus()
    }, [isDisabled, editor])

    // Scroll the ProseMirror element back to the top after a prompt has
    // been injected. tiptap's `focus()` calls `scrollIntoView` against the
    // cursor (which `insertContent` parks at the END of the inserted text),
    // so without this the user lands at the bottom of a long prompt and has
    // to mouse-wheel up inside the 260px editor to read the start. Double
    // rAF waits for both the height-cap rAF in `onUpdate` and the browser
    // layout flush from focus's scrollIntoView.
    const scrollEditorToTop = useCallback((): void => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = containerRef.current?.querySelector('.ProseMirror')
          if (el instanceof HTMLElement) el.scrollTop = 0
        })
      })
    }, [])

    // Imperative handle
    useImperativeHandle(
      ref,
      () => ({
        focus: () => editor?.commands.focus(),
        clear: () => {
          editor?.commands.clearContent(true)
          requestAnimationFrame(() => {
            const el = containerRef.current?.querySelector('.ProseMirror')
            if (el instanceof HTMLElement) {
              el.style.height = 'auto'
            }
          })
        },
        getText: () => {
          if (!editor) return ''
          return getPlainText(editor)
        },
        insertText: (text: string) => {
          editor?.commands.focus('end')
          editor?.commands.insertContent(text)
          // Show the start of the inserted text (cursor stays at end so
          // typing still appends to the prompt — see `scrollEditorToTop`).
          scrollEditorToTop()
        },
        insertContent: (text: string) => {
          if (!editor) return
          editor.commands.insertContent(text)
          // Focus the editor without letting tiptap's scroll-into-view leave
          // the user looking at the tail of a long prompt: snap back to the
          // top after the height-cap rAF in `onUpdate` has settled. Cursor
          // stays at the end so typing still appends.
          editor.commands.focus()
          scrollEditorToTop()
        },
        getMentions: () => {
          if (!editor) return []
          return extractMentions(editor)
        },
        isEmpty: () => editor?.isEmpty ?? true,
      }),
      [editor, scrollEditorToTop],
    )

    return (
      <div ref={containerRef} className="flex-1 relative min-w-0 flex items-center">
        <EditorContent editor={editor} className="w-full" />

        {menuState && menuState.items.length > 0 && (
          <MentionPickerMenu
            items={menuState.items}
            selectedIndex={selectedIndex}
            menuLabel={mentionConfig?.menuLabel}
            onSelect={(item) => {
              if (menuState.command) {
                menuState.command({ id: item.id, label: item.label })
              }
              setMenuState(null)
            }}
            onClose={() => setMenuState(null)}
          />
        )}
      </div>
    )
  },
)

// ── Helpers ──────────────────────────────────────────────────

function getPlainText(editor: Editor): string {
  const json = editor.getJSON()
  if (!json.content) return ''
  const lines: string[] = []
  for (const block of json.content) {
    if (!block.content) {
      lines.push('')
      continue
    }
    let line = ''
    for (const inline of block.content) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const node = inline as any
      if (node.type === 'text') {
        line += node.text ?? ''
      } else if (node.type === 'aiMention') {
        line += `@${node.attrs?.label ?? node.attrs?.id ?? ''}`
      }
    }
    lines.push(line)
  }
  return lines.join('\n')
}

function extractMentions(editor: Editor): string[] {
  const json = editor.getJSON()
  if (!json.content) return []
  const ids: string[] = []
  for (const block of json.content) {
    if (!block.content) continue
    for (const inline of block.content) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const node = inline as any
      if (node.type === 'aiMention' && node.attrs?.id) {
        ids.push(node.attrs.id)
      }
    }
  }
  return ids
}
