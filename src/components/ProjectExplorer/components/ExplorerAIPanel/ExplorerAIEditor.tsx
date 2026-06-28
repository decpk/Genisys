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
import Fuse from 'fuse.js'

import { FileMention, FileMentionPluginKey } from './extensions/file-mention'
import { FilePickerMenu, type FileItem } from './FilePickerMenu'

// ── Types ────────────────────────────────────────────────────

export interface ExplorerAIEditorHandle {
  focus: () => void
  clear: () => void
  getText: () => string
  setText: (text: string) => void
  insertContent: (text: string) => void
  getFileMentions: () => string[]
  isEmpty: () => boolean
}

interface ExplorerAIEditorProps {
  rootPath: string
  currentPath: string
  onSubmit: () => void
  isDisabled: boolean
  placeholder?: string
}

// ── File fetching with cache ─────────────────────────────────

const fileCache = new Map<string, { items: FileItem[]; timestamp: number }>()
const CACHE_TTL = 30_000 // 30s
const MAX_FILES = 2000
const MAX_DEPTH = 5

async function fetchAllFiles(rootPath: string, currentPath: string): Promise<FileItem[]> {
  const cacheKey = `${rootPath}::${currentPath}`
  const cached = fileCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.items
  }

  const results: FileItem[] = []
  const queue: { path: string; depth: number }[] = [{ path: currentPath || '/', depth: 0 }]
  const basePath = currentPath && currentPath !== '/' ? currentPath : ''

  while (queue.length > 0 && results.length < MAX_FILES) {
    const current = queue.shift()!
    if (current.depth > MAX_DEPTH) continue

    try {
      const res = await window.api.getLocalRepoItems({
        rootPath,
        path: current.path,
        showHidden: false,
      })
      const data = (res as { data?: { path: string; isFolder: boolean }[] })?.data
      if (!data) continue

      for (const item of data) {
        if (results.length >= MAX_FILES) break
        const relativePath = basePath && item.path.startsWith(basePath)
          ? item.path.slice(basePath.length).replace(/^\//, '')
          : item.path.replace(/^\//, '')
        const name = relativePath.split('/').pop() || relativePath
        results.push({ path: relativePath, name, isFolder: item.isFolder })
        if (item.isFolder && current.depth < MAX_DEPTH) {
          queue.push({ path: item.path, depth: current.depth + 1 })
        }
      }
    } catch {
      // skip inaccessible directories
    }
  }

  fileCache.set(cacheKey, { items: results, timestamp: Date.now() })
  return results
}

// ── Fuse.js search ───────────────────────────────────────────

function fuzzyFilter(items: FileItem[], query: string): FileItem[] {
  if (!query) return items.slice(0, 50) // show first 50 when no query
  const fuse = new Fuse(items, {
    keys: ['name', 'path'],
    threshold: 0.4,
    includeScore: true,
  })
  return fuse.search(query, { limit: 50 }).map((r) => r.item)
}

// ── Suggestion renderer ──────────────────────────────────────

interface SuggestionState {
  items: FileItem[]
  command: ((props: { id: string; label: string }) => void) | null
  clientRect: (() => DOMRect | null) | null
}

function createFileSuggestionRenderer(
  setMenuStateRef: React.MutableRefObject<React.Dispatch<React.SetStateAction<SuggestionState | null>>>,
  keyDownHandlerRef: React.MutableRefObject<((props: SuggestionKeyDownProps) => boolean) | null>,
) {
  return {
    onStart(props: SuggestionProps<FileItem>) {
      setMenuStateRef.current({
        items: props.items,
        command: props.command as SuggestionState['command'],
        clientRect: props.clientRect ?? null,
      })
    },
    onUpdate(props: SuggestionProps<FileItem>) {
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

// ── Component ────────────────────────────────────────────────

export const ExplorerAIEditor = forwardRef<ExplorerAIEditorHandle, ExplorerAIEditorProps>(
  function ExplorerAIEditor({ rootPath, currentPath, onSubmit, isDisabled, placeholder }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)

    // File items ref for suggestion callback
    const filesRef = useRef<FileItem[]>([])
    const rootPathRef = useRef(rootPath)
    const currentPathRef = useRef(currentPath)
    rootPathRef.current = rootPath
    currentPathRef.current = currentPath

    // Suggestion menu state
    const [menuState, setMenuState] = useState<SuggestionState | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const keyDownHandlerRef = useRef<((props: SuggestionKeyDownProps) => boolean) | null>(null)

    // Stable submit callback
    const submitRef = useRef(onSubmit)
    submitRef.current = onSubmit
    const isDisabledRef = useRef(isDisabled)
    isDisabledRef.current = isDisabled

    const handleEditorSubmit = useCallback(() => {
      if (isDisabledRef.current) return
      requestAnimationFrame(() => submitRef.current())
    }, [])

    // Stable refs for suggestion callbacks
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
          placeholder: placeholder || 'Type instruction… (@ for files)',
        }),
        createSubmitExtension(handleEditorSubmit),
        FileMention.configure({
          suggestion: {
            char: '@',
            pluginKey: FileMentionPluginKey,
            command: ({ editor: ed, range, props }: { editor: any; range: any; props: any }) => {
              const nodeAfter = ed.view.state.selection.$to.nodeAfter
              const overrideSpace = nodeAfter?.text?.startsWith(' ')
              if (overrideSpace) {
                range.to += 1
              }
              ed.chain()
                .focus()
                .insertContentAt(range, [
                  { type: 'fileMention', attrs: props },
                  { type: 'text', text: ' ' },
                ])
                .run()
              window.getSelection()?.collapseToEnd()
            },
            items: async ({ query }: { query: string }) => {
              // Fetch files on first trigger or if path changed
              if (filesRef.current.length === 0) {
                filesRef.current = await fetchAllFiles(rootPathRef.current, currentPathRef.current)
              }
              return fuzzyFilter(filesRef.current, query)
            },
            render: () =>
              createFileSuggestionRenderer(setMenuStateRef, keyDownHandlerRef),
          },
        }),
      ],
      editorProps: {
        attributes: {
          class:
            'explorer-ai-editor block relative w-full resize-none bg-transparent px-1.5 py-1 text-xs leading-[1.125rem] text-foreground focus:outline-none min-h-[28px] max-h-[260px] overflow-y-auto',
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

    // Invalidate file cache when path changes
    useEffect(() => {
      filesRef.current = []
    }, [rootPath, currentPath])

    // Keyboard handler for the file picker menu
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
            menuState.command({ id: item.path, label: item.name })
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
        setText: (text: string) => {
          editor?.commands.setContent(text)
          editor?.commands.focus('end')
        },
        insertContent: (text: string) => {
          editor?.commands.insertContent(text)
          editor?.commands.focus()
          // Show the start of the inserted text (cursor stays at end so
          // typing still appends to the prompt — see `scrollEditorToTop`).
          scrollEditorToTop()
        },
        getFileMentions: () => {
          if (!editor) return []
          return extractFileMentions(editor)
        },
        isEmpty: () => editor?.isEmpty ?? true,
      }),
      [editor, scrollEditorToTop],
    )

    return (
      <div ref={containerRef} className="flex-1 relative min-w-0">
        <EditorContent editor={editor} />

        {/* File picker suggestion menu */}
        {menuState && menuState.items.length > 0 && (
          <FilePickerMenu
            items={menuState.items}
            selectedIndex={selectedIndex}
            onSelect={(item) => {
              if (menuState.command) {
                menuState.command({ id: item.path, label: item.name })
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
    for (const node of block.content) {
      if (node.type === 'text') {
        line += node.text ?? ''
      } else if (node.type === 'fileMention') {
        // Include the file path in the text representation
        line += `@${node.attrs?.label ?? node.attrs?.id ?? ''}`
      }
    }
    lines.push(line)
  }
  return lines.join('\n')
}

function extractFileMentions(editor: Editor): string[] {
  const json = editor.getJSON()
  if (!json.content) return []
  const paths: string[] = []
  for (const block of json.content) {
    if (!block.content) continue
    for (const node of block.content) {
      if (node.type === 'fileMention' && node.attrs?.id) {
        paths.push(node.attrs.id)
      }
    }
  }
  return paths
}
