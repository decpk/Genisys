import { Globe } from 'lucide-react'

import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu'

import type { OpenUrlsInBrowserContextSubmenuProps } from './OpenUrlsInBrowserContextSubmenu.types'

/**
 * A context-menu submenu that opens a set of URLs in the system default browser
 * or any installed browser. Presentational only — the caller supplies the
 * browser list and the open handler. Mirror of `OpenUrlsInBrowserSubmenu` for
 * use inside a radix ContextMenu.
 */
export function OpenUrlsInBrowserContextSubmenu(
  props: OpenUrlsInBrowserContextSubmenuProps
): React.JSX.Element {
  const { browsers, disabled, onOpen } = props
  const hasBrowsers = browsers.length > 0

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger
        disabled={disabled}
        className="data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
      >
        <Globe />
        Open all in browser
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem onSelect={() => onOpen()}>Default browser</ContextMenuItem>
        {hasBrowsers && <ContextMenuSeparator />}
        {browsers.map((browser) => (
          <ContextMenuItem key={browser.id} onSelect={() => onOpen(browser)}>
            {browser.name}
          </ContextMenuItem>
        ))}
      </ContextMenuSubContent>
    </ContextMenuSub>
  )
}
