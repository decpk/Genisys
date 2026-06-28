import { Globe } from "lucide-react";

import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";

import type { OpenUrlsInBrowserSubmenuProps } from "./OpenUrlsInBrowserSubmenu.types";

export function OpenUrlsInBrowserSubmenu(
  props: OpenUrlsInBrowserSubmenuProps,
): React.JSX.Element {
  const { browsers, onOpen } = props;
  const hasBrowsers = browsers.length > 0;

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <Globe className="size-4" />
        Open all URLs in browser
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem onClick={() => onOpen()}>
          Default browser
        </ContextMenuItem>
        {hasBrowsers && <ContextMenuSeparator />}
        {browsers.map((browser) => (
          <ContextMenuItem key={browser.id} onClick={() => onOpen(browser)}>
            {browser.name}
          </ContextMenuItem>
        ))}
      </ContextMenuSubContent>
    </ContextMenuSub>
  );
}
