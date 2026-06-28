import { ReactRenderer } from '@tiptap/react'
import { type SuggestionProps, type SuggestionKeyDownProps } from '@tiptap/suggestion'
import {
  SlashCommandMenu,
  type SlashCommandMenuHandle,
} from '../components/SlashCommandMenu'
import { filterSlashItems } from './slash-command-items'
import type { SlashCommandItem } from './slash-command'

export function slashSuggestionOptions() {
  return {
    items: ({ query }: { query: string }): SlashCommandItem[] => {
      return filterSlashItems(query)
    },

    render: () => {
      let component: ReactRenderer<SlashCommandMenuHandle>
      let popup: HTMLDivElement | null = null

      return {
        onStart: (props: SuggestionProps<SlashCommandItem>) => {
          component = new ReactRenderer(SlashCommandMenu, {
            props: {
              items: props.items,
              command: props.command,
            },
            editor: props.editor,
          })

          popup = document.createElement('div')
          popup.className = 'slash-command-popup'
          document.body.appendChild(popup)
          popup.appendChild(component.element!)

          updatePosition(popup, props.clientRect)
        },

        onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
          component?.updateProps({
            items: props.items,
            command: props.command,
          })

          if (popup) {
            updatePosition(popup, props.clientRect)
          }
        },

        onKeyDown: (props: SuggestionKeyDownProps) => {
          if (props.event.key === 'Escape') {
            popup?.remove()
            popup = null
            component?.destroy()
            return true
          }
          return component?.ref?.onKeyDown(props.event) ?? false
        },

        onExit: () => {
          popup?.remove()
          popup = null
          component?.destroy()
        },
      }
    },
  }
}

function updatePosition(
  popup: HTMLDivElement,
  clientRect: (() => DOMRect | null) | null | undefined,
) {
  const rect = clientRect?.()
  if (!rect) return

  const gap = 4

  // Default: position below cursor
  Object.assign(popup.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.bottom + gap}px`,
    zIndex: '9999',
  })

  // Defer boundary adjustment until after React renders so measurements are accurate
  requestAnimationFrame(() => {
    const popupHeight = popup.offsetHeight
    const popupWidth = popup.offsetWidth
    if (!popupHeight) return

    let top = rect.bottom + gap
    let left = rect.left

    // Flip above if overflowing bottom and enough space above
    if (top + popupHeight > window.innerHeight) {
      const aboveTop = rect.top - popupHeight - gap
      if (aboveTop >= 0) {
        top = aboveTop
      } else {
        // Neither fits fully — pick whichever side has more space
        top = rect.top > window.innerHeight - rect.bottom
          ? Math.max(0, rect.top - popupHeight - gap)
          : window.innerHeight - popupHeight
      }
    }

    // Clamp horizontally
    if (left + popupWidth > window.innerWidth) {
      left = window.innerWidth - popupWidth - 8
    }
    left = Math.max(0, left)

    popup.style.top = `${top}px`
    popup.style.left = `${left}px`
  })
}
