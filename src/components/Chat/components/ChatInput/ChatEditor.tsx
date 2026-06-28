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
} from 'react'
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'

import type { ChatCommand } from '@/store/command-store'
import { useCommandStore } from '@/store/command-store'
import { useNavigationStore } from '@/store/navigation-store'

import { SlashCommand, SlashCommandPluginKey } from './extensions/slash-command'
import { MentionTag } from './extensions/mention-tag'
import { HashTag } from './extensions/hash-tag'
import { CommandMenu } from './CommandMenu'

// ── Types ────────────────────────────────────────────────────

export interface ChatEditorHandle {
  focus: () => void
  clear: () => void
  setText: (text: string) => void
  getText: () => string
  insertText: (text: string) => void
  isEmpty: () => boolean
  getEditor: () => Editor | null
}

interface ChatEditorProps {
  onSubmit: (text: string) => void
  isStreaming: boolean
  /**
   * Called when one or more images are pasted into the editor. Receives a
   * base64 data URL and a best-effort file name for each pasted image.
   * When provided, image paste is intercepted (the image is NOT inserted
   * into the editor text).
   */
  onImagePaste?: (dataUrl: string, name: string) => void
}

// ── Suggestion renderer for slash commands ──────────────────

interface SuggestionState {
  items: ChatCommand[]
  command: ((props: { id: string; label: string }) => void) | null
  clientRect: (() => DOMRect | null) | null
}

function createSlashSuggestionRenderer(
  setMenuStateRef: React.MutableRefObject<React.Dispatch<React.SetStateAction<SuggestionState | null>>>,
  keyDownHandlerRef: React.MutableRefObject<((props: SuggestionKeyDownProps) => boolean) | null>,
) {
  return {
    onStart(props: SuggestionProps<ChatCommand>) {
      setMenuStateRef.current({
        items: props.items,
        command: props.command as SuggestionState['command'],
        clientRect: props.clientRect ?? null,
      })
    },
    onUpdate(props: SuggestionProps<ChatCommand>) {
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

// ── Enter-to-submit extension ───────────────────────────────

function createSubmitExtension(onSubmit: () => void) {
  return Extension.create({
    name: 'submitOnEnter',
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          onSubmit()
          return true
        },
      }
    },
  })
}

// ── Component ───────────────────────────────────────────────

export const ChatEditor = forwardRef<ChatEditorHandle, ChatEditorProps>(
  function ChatEditor({ onSubmit, isStreaming, onImagePaste }, ref) {
    const commands = useCommandStore((s) => s.commands)
    const isCommandsLoaded = useCommandStore((s) => s.isLoaded)
    const loadCommands = useCommandStore((s) => s.loadCommands)
    const containerRef = useRef<HTMLDivElement>(null)

    // Use a ref so the items callback always sees the latest commands
    const commandsRef = useRef(commands)
    commandsRef.current = commands

    // Stable ref so the paste handler (registered once on the editor) always
    // calls the latest image-paste callback.
    const onImagePasteRef = useRef(onImagePaste)
    onImagePasteRef.current = onImagePaste

    useEffect(() => {
      if (!isCommandsLoaded) loadCommands()
    }, [isCommandsLoaded, loadCommands])

    // Suggestion menu state
    const [menuState, setMenuState] = useState<SuggestionState | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const keyDownHandlerRef = useRef<((props: SuggestionKeyDownProps) => boolean) | null>(null)

    // Stable submit callback for the extension
    const submitRef = useRef(onSubmit)
    submitRef.current = onSubmit
    const isStreamingRef = useRef(isStreaming)
    isStreamingRef.current = isStreaming

    const handleEditorSubmit = useCallback(() => {
      if (isStreamingRef.current) return
      // Defer to let tiptap finish processing
      requestAnimationFrame(() => submitRef.current(''))
    }, [])

    // Keep refs for suggestion callbacks so they're never stale
    const setMenuStateRef = useRef(setMenuState)
    setMenuStateRef.current = setMenuState

    const editor = useEditor({
      extensions: [
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
          placeholder: "Type a message… (/ for commands)",
        }),
        createSubmitExtension(handleEditorSubmit),
        SlashCommand.configure({
          suggestion: {
            char: "/",
            pluginKey: SlashCommandPluginKey,
            command: ({
              editor: ed,
              range,
              props,
            }: {
              editor: any;
              range: any;
              props: any;
            }) => {
              const nodeAfter = ed.view.state.selection.$to.nodeAfter;
              const overrideSpace = nodeAfter?.text?.startsWith(" ");
              if (overrideSpace) {
                range.to += 1;
              }
              ed.chain()
                .focus()
                .insertContentAt(range, [
                  { type: "slashCommand", attrs: props },
                  { type: "text", text: " " },
                ])
                .run();
              window.getSelection()?.collapseToEnd();
            },
            items: ({ query }: { query: string }) => {
              return commandsRef.current.filter((c) =>
                c.name.toLowerCase().startsWith(query.toLowerCase()),
              );
            },
            render: () =>
              createSlashSuggestionRenderer(setMenuStateRef, keyDownHandlerRef),
          },
        }),
        MentionTag,
        HashTag,
      ],
      editorProps: {
        attributes: {
          class:
            "chat-editor-content block relative w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-5 text-foreground focus:outline-none min-h-7 max-h-[200px] overflow-y-auto",
          "data-chat-input": "",
        },
        handlePaste: (_view, event) => {
          const handler = onImagePasteRef.current
          if (!handler) return false
          const items = event.clipboardData?.items
          if (!items) return false
          const imageFiles: File[] = []
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (item.kind === "file" && item.type.startsWith("image/")) {
              const file = item.getAsFile()
              if (file) imageFiles.push(file)
            }
          }
          if (imageFiles.length === 0) return false
          // Intercept: read each image as a data URL and hand off to the parent.
          imageFiles.forEach((file, idx) => {
            const reader = new FileReader()
            reader.onload = () => {
              if (typeof reader.result === "string") {
                const name =
                  file.name && file.name.length > 0
                    ? file.name
                    : `pasted-image-${Date.now()}-${idx}.png`
                onImagePasteRef.current?.(reader.result, name)
              }
            }
            reader.readAsDataURL(file)
          })
          return true
        },
      },
      // We handle enter ourselves via the extension
      onUpdate: () => {
        // auto-resize: adjust the container height based on content
        requestAnimationFrame(() => {
          const el = containerRef.current?.querySelector(".ProseMirror");
          if (el instanceof HTMLElement) {
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
            el.style.overflow = el.scrollHeight > 180 ? "auto" : "hidden";
          }
        });
      },
    });

    // Expose the editor globally for external components (snippet insertion, focus, etc.)
    useEffect(() => {
      if (editor) {
        ;(window as unknown as Record<string, unknown>).__chatEditor = editor
      }
      return () => {
        if ((window as unknown as Record<string, unknown>).__chatEditor === editor) {
          delete (window as unknown as Record<string, unknown>).__chatEditor
        }
      }
    }, [editor])

    // Scroll the ProseMirror element back to the top after a prompt has
    // been injected. tiptap's `focus()` calls `scrollIntoView` against the
    // cursor (which `insertContent` parks at the END of the inserted text),
    // so without this the user lands at the bottom of a long prompt and has
    // to mouse-wheel up inside the 180px editor to read the start. Double
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

    // Consume any pending prompt content queued via `openChatWithPrompt(...)`
    // (e.g. from the dashboard Quick Prompts tile). Inserts at the current
    // cursor position and focuses the editor.
    useEffect(() => {
      if (!editor) return
      const pending = useNavigationStore.getState().pendingChatPromptContent
      if (pending) {
        editor.commands.insertContent(pending)
        editor.commands.focus()
        scrollEditorToTop()
        useNavigationStore.getState().consumeChatPrompt()
      }
      const unsubscribe = useNavigationStore.subscribe((state, prev) => {
        const next = state.pendingChatPromptContent
        if (next && next !== prev.pendingChatPromptContent) {
          editor.commands.insertContent(next)
          editor.commands.focus()
          scrollEditorToTop()
          useNavigationStore.getState().consumeChatPrompt()
        }
      })
      return unsubscribe
    }, [editor, scrollEditorToTop])

    // Keyboard handler for the suggestion menu
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
            menuState.command({ id: item.id, label: item.name })
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

    // Auto-focus
    useEffect(() => {
      if (!isStreaming) editor?.commands.focus()
    }, [isStreaming, editor])

    useEffect(() => {
      editor?.commands.focus()
    }, [editor])

    // Imperative handle
    useImperativeHandle(
      ref,
      () => ({
        focus: () => editor?.commands.focus(),
        clear: () => {
          editor?.commands.clearContent(true)
          // Reset height
          requestAnimationFrame(() => {
            const el = containerRef.current?.querySelector('.ProseMirror')
            if (el instanceof HTMLElement) {
              el.style.height = 'auto'
            }
          })
        },
        setText: (text: string) => {
          editor?.commands.setContent(`<p>${text}</p>`)
        },
        getText: () => {
          if (!editor) return ''
          // Extract plain text, preserving chip labels
          return getPlainText(editor)
        },
        insertText: (text: string) => {
          editor?.commands.insertContent(text)
          editor?.commands.focus()
          // Show the start of the inserted text (cursor stays at end so
          // typing still appends to the prompt — see `scrollEditorToTop`).
          scrollEditorToTop()
        },
        isEmpty: () => editor?.isEmpty ?? true,
        getEditor: () => editor,
      }),
      [editor, scrollEditorToTop],
    )

    return (
      <div ref={containerRef} className="flex-1 relative min-w-0">
        <EditorContent editor={editor} />

        {/* Slash command suggestion menu */}
        {menuState && menuState.items.length > 0 && (
          <CommandMenu
            filtered={menuState.items}
            selectedIndex={selectedIndex}
            onSelect={(cmd) => {
              if (menuState.command) {
                menuState.command({ id: cmd.id, label: cmd.name })
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

// ── Helpers ─────────────────────────────────────────────────

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
    for (const node of block.content) {
      if (node.type === 'text') {
        line += node.text ?? ''
      } else if (node.type === 'slashCommand') {
        line += `/${node.attrs?.label ?? node.attrs?.id ?? ''}`
      } else if (node.type === 'mentionTag') {
        line += `@${node.attrs?.label ?? node.attrs?.id ?? ''}`
      } else if (node.type === 'hashTag') {
        line += `#${node.attrs?.label ?? node.attrs?.id ?? ''}`
      }
    }
    lines.push(line)
  }
  return lines.join('\n')
}
