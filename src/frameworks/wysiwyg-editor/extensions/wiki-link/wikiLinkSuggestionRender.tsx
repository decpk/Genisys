import { ReactRenderer } from '@tiptap/react'
import type {
  SuggestionProps,
  SuggestionKeyDownProps,
} from '@tiptap/suggestion'

import { WikiLinkMenu, type WikiLinkMenuHandle } from './components/WikiLinkMenu'
import { positionPopupNearRect } from './utils/positionPopupNearRect'
import type { WikiLinkMenuItem } from './WikiLinkExtension.types'

/**
 * Suggestion `render` factory for the `[[` autocomplete popup. Mounts a
 * `WikiLinkMenu` via `ReactRenderer` into a fixed-position container and
 * forwards keyboard events to it.
 */
export function wikiLinkSuggestionRender() {
  let component: ReactRenderer<WikiLinkMenuHandle> | null = null
  let popup: HTMLDivElement | null = null

  const destroy = () => {
    popup?.remove()
    popup = null
    component?.destroy()
    component = null
  }

  return {
    onStart: (props: SuggestionProps<WikiLinkMenuItem>) => {
      component = new ReactRenderer(WikiLinkMenu, {
        props: { items: props.items, command: props.command },
        editor: props.editor,
      })

      popup = document.createElement('div')
      popup.className = 'wiki-link-popup'
      document.body.appendChild(popup)
      popup.appendChild(component.element!)

      positionPopupNearRect(popup, props.clientRect)
    },

    onUpdate: (props: SuggestionProps<WikiLinkMenuItem>) => {
      component?.updateProps({ items: props.items, command: props.command })
      if (popup) positionPopupNearRect(popup, props.clientRect)
    },

    onKeyDown: (props: SuggestionKeyDownProps): boolean => {
      if (props.event.key === 'Escape') {
        destroy()
        return true
      }
      return component?.ref?.onKeyDown(props.event) ?? false
    },

    onExit: () => {
      destroy()
    },
  }
}
