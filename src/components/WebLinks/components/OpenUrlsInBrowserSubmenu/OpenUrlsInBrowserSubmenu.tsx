import { Globe } from 'lucide-react'

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

import type { OpenUrlsInBrowserSubmenuProps } from './OpenUrlsInBrowserSubmenu.types'

/**
 * A dropdown submenu that opens a set of URLs in the system default browser or
 * any installed browser. Presentational only — the caller supplies the browser
 * list and the open handler.
 */
export function OpenUrlsInBrowserSubmenu(props: OpenUrlsInBrowserSubmenuProps): React.JSX.Element {
  const { browsers, disabled, onOpen } = props
  const hasBrowsers = browsers.length > 0

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={disabled}>
        <Globe />
        Open all in browser
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onSelect={() => onOpen()}>Default browser</DropdownMenuItem>
        {hasBrowsers && <DropdownMenuSeparator />}
        {browsers.map((browser) => (
          <DropdownMenuItem key={browser.id} onSelect={() => onOpen(browser)}>
            {browser.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
