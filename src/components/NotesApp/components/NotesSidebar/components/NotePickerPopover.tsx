import { lazy, Suspense, useState } from 'react'
import { Popover as PopoverPrimitive, Tabs as TabsPrimitive } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { Theme as EmojiTheme } from 'emoji-picker-react'

import { useNotesStore } from '@/store/notes-store'
import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import { useNoteSectionsStore } from '@/store/note-sections-store'
import { useNoteTopicsStore } from '@/store/note-topics-store'
import { useNoteProjectsStore } from '@/store/note-projects-store'
import { useThemeStore } from '@/store/theme-store'
import { THEMES } from '@/themes'

import type { TreeNode } from '../useNotesSidebarData'

const EmojiPicker = lazy(() => import('emoji-picker-react'))

const PRESET_COLORS: { value: string; label: string }[] = [
  { value: 'hsl(200 65% 48%)', label: 'Blue' },
  { value: 'hsl(145 55% 42%)', label: 'Green' },
  { value: 'hsl(280 55% 55%)', label: 'Purple' },
  { value: 'hsl(38 85% 50%)', label: 'Amber' },
  { value: 'hsl(0 70% 55%)', label: 'Red' },
  { value: 'hsl(340 70% 55%)', label: 'Pink' },
  { value: 'hsl(175 55% 42%)', label: 'Teal' },
  { value: 'hsl(220 15% 50%)', label: 'Slate' },
]

interface NotePickerPopoverProps {
  node: TreeNode
  children: React.ReactNode // the icon-slot trigger
}

export function NotePickerPopover({ node, children }: NotePickerPopoverProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const isDark = THEMES.find((t) => t.id === activeThemeId)?.isDark ?? false

  const applyColor = async (color: string | null) => {
    if (node.type === 'note') {
      const notes = useNotesStore.getState().notesByScope['notes-app::global::all'] ?? []
      const note = notes.find((n) => n.id === node.id)
      if (!note) return
      await useNotesStore.getState().updateNote({
        ...note,
        color,
        emoji: color ? null : note.emoji,
      })
    } else if (node.type === 'project') {
      await useNoteProjectsStore.getState().setProjectAppearance(node.id, { color })
    } else if (node.type === 'notebook') {
      await useNoteNotebooksStore.getState().setNotebookAppearance(node.id, { color })
    } else if (node.type === 'section') {
      await useNoteSectionsStore.getState().setSectionAppearance(node.id, { color })
    } else if (node.type === 'topic') {
      await useNoteTopicsStore.getState().setTopicAppearance(node.id, { color })
    }
    setOpen(false)
  }

  const applyEmoji = async (emoji: string | null) => {
    if (node.type === 'note') {
      const notes = useNotesStore.getState().notesByScope['notes-app::global::all'] ?? []
      const note = notes.find((n) => n.id === node.id)
      if (!note) return
      await useNotesStore.getState().updateNote({
        ...note,
        emoji,
        color: emoji ? null : note.color,
      })
    } else if (node.type === 'project') {
      await useNoteProjectsStore.getState().setProjectAppearance(node.id, { emoji })
    } else if (node.type === 'notebook') {
      await useNoteNotebooksStore.getState().setNotebookAppearance(node.id, { emoji })
    } else if (node.type === 'section') {
      await useNoteSectionsStore.getState().setSectionAppearance(node.id, { emoji })
    } else if (node.type === 'topic') {
      await useNoteTopicsStore.getState().setTopicAppearance(node.id, { emoji })
    }
    setOpen(false)
  }

  const handleClear = async () => {
    if (node.type === 'note') {
      const notes = useNotesStore.getState().notesByScope['notes-app::global::all'] ?? []
      const note = notes.find((n) => n.id === node.id)
      if (!note) return
      await useNotesStore.getState().updateNote({ ...note, color: null, emoji: null })
    } else if (node.type === 'project') {
      await useNoteProjectsStore.getState().setProjectAppearance(node.id, { color: null, emoji: null })
    } else if (node.type === 'notebook') {
      await useNoteNotebooksStore.getState().setNotebookAppearance(node.id, { color: null, emoji: null })
    } else if (node.type === 'section') {
      await useNoteSectionsStore.getState().setSectionAppearance(node.id, { color: null, emoji: null })
    } else if (node.type === 'topic') {
      await useNoteTopicsStore.getState().setTopicAppearance(node.id, { color: null, emoji: null })
    }
    setOpen(false)
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="shrink-0 rounded hover:ring-1 hover:ring-border/50 transition-all cursor-pointer grid place-items-center w-4 h-4"
          aria-label="Set color or emoji"
        >
          {children}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="z-50 w-[320px] rounded-lg border border-border bg-popover p-2 shadow-md animate-in fade-in-0 zoom-in-95"
          sideOffset={6}
          align="start"
          onClick={(e) => e.stopPropagation()}
        >
          <TabsPrimitive.Root defaultValue="color" className="flex flex-col gap-2">
            <TabsPrimitive.List className="flex gap-0.5 border-b border-border/50 pb-1">
              <TabsPrimitive.Trigger
                value="color"
                className="px-2 py-0.5 text-[11px] rounded cursor-pointer text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground transition-colors"
              >
                Color
              </TabsPrimitive.Trigger>
              <TabsPrimitive.Trigger
                value="emoji"
                className="px-2 py-0.5 text-[11px] rounded cursor-pointer text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground transition-colors"
              >
                Emoji
              </TabsPrimitive.Trigger>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleClear}
                className="ml-auto px-2 py-0.5 text-[11px]"
              >
                None
              </Button>
            </TabsPrimitive.List>

            <TabsPrimitive.Content value="color" className="focus:outline-none">
              <div className="grid grid-cols-8 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => applyColor(c.value)}
                    className="w-6 h-6 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-offset-popover hover:ring-border transition-all"
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </TabsPrimitive.Content>

            <TabsPrimitive.Content value="emoji" className="focus:outline-none">
              <Suspense
                fallback={
                  <div className="h-[360px] grid place-items-center text-[11px] text-muted-foreground">
                    Loading emojis…
                  </div>
                }
              >
                <div
                  className="genisys-emoji-scope"
                  style={{
                    // Map emoji-picker-react CSS vars onto app theme tokens
                    ['--epr-bg-color' as string]: 'var(--color-popover)',
                    ['--epr-category-label-bg-color' as string]: 'var(--color-popover)',
                    ['--epr-text-color' as string]: 'var(--color-popover-foreground)',
                    ['--epr-search-input-bg-color' as string]: 'var(--color-muted)',
                    ['--epr-search-input-text-color' as string]: 'var(--color-foreground)',
                    ['--epr-search-input-placeholder-color' as string]: 'var(--color-muted-foreground)',
                    ['--epr-picker-border-color' as string]: 'var(--color-border)',
                    ['--epr-category-label-text-color' as string]: 'var(--color-muted-foreground)',
                    ['--epr-hover-bg-color' as string]: 'var(--color-muted)',
                    ['--epr-focus-bg-color' as string]: 'var(--color-muted)',
                    ['--epr-highlight-color' as string]: 'var(--color-primary)',
                    ['--epr-category-icon-active-color' as string]: 'var(--color-primary)',
                  } as React.CSSProperties}
                >
                  <style>{`
                    .genisys-emoji-scope .EmojiPickerReact {
                      --epr-emoji-size: 22px;
                      --epr-emoji-padding: 4px;
                      --epr-emoji-gap: 2px;
                      --epr-horizontal-padding: 6px;
                      --epr-header-padding: 6px;
                      --epr-category-navigation-button-size: 22px;
                      --epr-category-label-height: 22px;
                      --epr-category-label-padding: 6px 8px;
                      --epr-search-input-height: 30px;
                      --epr-search-input-padding: 0 10px 0 28px;
                      --epr-search-input-border-radius: 6px;
                      --epr-search-input-text-color: var(--color-foreground);
                      font-size: 11px;
                      border: none !important;
                    }
                    .genisys-emoji-scope .epr-emoji-category-label {
                      font-size: 10px !important;
                      font-weight: 600 !important;
                      text-transform: uppercase;
                      letter-spacing: 0.04em;
                      padding: 4px 8px !important;
                    }
                    .genisys-emoji-scope .epr-category-nav {
                      padding: 4px 6px !important;
                    }
                    .genisys-emoji-scope .epr-search-container input.epr-search {
                      font-size: 11px !important;
                    }
                    .genisys-emoji-scope .epr-emoji-img,
                    .genisys-emoji-scope .epr-emoji-native {
                      font-size: 18px !important;
                    }
                  `}</style>
                  <EmojiPicker
                    onEmojiClick={(data: { emoji: string }) => applyEmoji(data.emoji)}
                    width={304}
                    height={360}
                    lazyLoadEmojis
                    previewConfig={{ showPreview: false }}
                    skinTonesDisabled
                    searchPlaceHolder="Search"
                    theme={isDark ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                  />
                </div>
              </Suspense>
            </TabsPrimitive.Content>
          </TabsPrimitive.Root>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
