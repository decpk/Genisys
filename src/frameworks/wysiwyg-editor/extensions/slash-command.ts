import { Extension } from '@tiptap/react'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from '@tiptap/suggestion'
import type { Editor, Range } from '@tiptap/react'

export const WysiwygSlashCommandPluginKey = new PluginKey('wysiwygSlashCommand')

export interface SlashCommandItem {
  id: string
  label: string
  description: string
  icon: string
  keywords: string[]
  command: (editor: Editor, range: Range) => void
}

export const WysiwygSlashCommand = Extension.create({
  name: 'wysiwygSlashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        pluginKey: WysiwygSlashCommandPluginKey,
        startOfLine: false,
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor
          range: Range
          props: SlashCommandItem
        }) => {
          props.command(editor, range)
        },
        items: (_opts: { query: string }): SlashCommandItem[] => [],
        render: (): {
          onStart: (props: SuggestionProps<SlashCommandItem>) => void
          onUpdate: (props: SuggestionProps<SlashCommandItem>) => void
          onKeyDown: (props: SuggestionKeyDownProps) => boolean
          onExit: () => void
        } => ({
          onStart: () => {},
          onUpdate: () => {},
          onKeyDown: () => false,
          onExit: () => {},
        }),
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
