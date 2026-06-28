import type { Editor, Range } from '@tiptap/react'
import type { WikiLinkConfig, WikiLinkMenuItem } from '../WikiLinkExtension.types'

/**
 * Suggestion `command` handler: insert a `wikiLink` atom node for the chosen
 * item. When the item is a "Create …" row, kick off background creation of the
 * document so the link resolves immediately (fire-and-forget — we stay in the
 * current note).
 */
export function insertWikiLinkCommand(
  editor: Editor,
  range: Range,
  item: WikiLinkMenuItem,
  config: WikiLinkConfig,
): void {
  if (item.isCreate) {
    void config.createNote(item.title)
  }

  // Absorb a trailing space the suggestion plugin may leave behind.
  const nodeAfter = editor.view.state.selection.$to.nodeAfter
  const overrideSpace = nodeAfter?.text?.startsWith(' ')
  const insertRange = overrideSpace ? { from: range.from, to: range.to + 1 } : range

  editor
    .chain()
    .focus()
    .insertContentAt(insertRange, [
      { type: 'wikiLink', attrs: { label: item.title } },
      { type: 'text', text: ' ' },
    ])
    .run()

  window.getSelection()?.collapseToEnd()
}
