import {
  AppWindow,
  BookPlus,
  Clipboard,
  ClipboardCopy,
  ClipboardPaste,
  Copy,
  ExternalLink,
  FileCode,
  FilePlus,
  FolderInput,
  FolderOpen,
  FolderPlus,
  History,
  Info,
  Link,
  Pencil,
  Scissors,
  Share2,
  Terminal,
  Trash2,
  Type
} from 'lucide-react'

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuShortcut
} from '@/components/ui/context-menu'

import { ExplorerItemDialogs } from "../ExplorerItemDialogs";
import type { ExplorerContextMenuProps } from './ExplorerContextMenu.types'
import { useExplorerContextMenuData } from './useExplorerContextMenuData'
import { EXPLORER_TEMPLATES } from './templates'
import { EXPLORER_SHORTCUT_LABELS } from './shortcutLabels'

export function ExplorerContextMenu(props: ExplorerContextMenuProps): React.JSX.Element {
  const { children } = props
  const data = useExplorerContextMenuData(props)

  if (!data.isLocal) {
    const showFileOnlyActions = !data.item.isFolder && (!!data.onFileHistory || data.isMd)

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={data.onCopyBaseName}>
            <Type className="size-4" />
            Copy name
          </ContextMenuItem>
          {showFileOnlyActions && (
            <>
              <ContextMenuSeparator />
              {data.onFileHistory && (
                <ContextMenuItem onClick={data.onShowFileHistory}>
                  <History className="size-4" />
                  File History
                </ContextMenuItem>
              )}
              {data.isMd && (
                <ContextMenuItem onClick={data.onAddToLibrary}>
                  <BookPlus className="size-4" />
                  Add in Library
                </ContextMenuItem>
              )}
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="max-h-[min(70vh,520px)] overflow-y-auto">
          <ContextMenuLabel>Open</ContextMenuLabel>
          <ContextMenuItem onClick={data.onOpenInDefaultApp}>
            <ExternalLink className="size-4" />
            Open in default app
          </ContextMenuItem>
          <ContextMenuItem onClick={data.onRevealInFinder}>
            <FolderOpen className="size-4" />
            Reveal in Finder
          </ContextMenuItem>
          <ContextMenuItem onClick={data.onOpenInVSCode}>
            <AppWindow className="size-4" />
            Open in VS Code
          </ContextMenuItem>
          {data.item.isFolder && (
            <ContextMenuItem onClick={data.onOpenInTerminal}>
              <Terminal className="size-4" />
              Open in Terminal
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />
          <ContextMenuLabel>Edit</ContextMenuLabel>
          <ContextMenuItem onClick={data.onCut}>
            <Scissors className="size-4" />
            Cut
            <ContextMenuShortcut>
              {EXPLORER_SHORTCUT_LABELS.cut}
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={data.onCopy}>
            <Copy className="size-4" />
            Copy
            <ContextMenuShortcut>
              {EXPLORER_SHORTCUT_LABELS.copy}
            </ContextMenuShortcut>
          </ContextMenuItem>
          {data.hasClipboard && (
            <ContextMenuItem onClick={data.onPaste}>
              <ClipboardPaste className="size-4" />
              {data.item.isFolder ? "Paste here" : "Paste"}
              <ContextMenuShortcut>
                {EXPLORER_SHORTCUT_LABELS.paste}
              </ContextMenuShortcut>
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={data.onDuplicate}>
            <ClipboardCopy className="size-4" />
            Duplicate
            <ContextMenuShortcut>
              {EXPLORER_SHORTCUT_LABELS.duplicate}
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => data.setActiveDialog({ type: "rename" })}
          >
            <Pencil className="size-4" />
            Rename…
            <ContextMenuShortcut>
              {EXPLORER_SHORTCUT_LABELS.rename}
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              data.setActiveDialog({ type: "moveCopy", mode: "move" })
            }
          >
            <FolderInput className="size-4" />
            Move…
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              data.setActiveDialog({ type: "moveCopy", mode: "copy" })
            }
          >
            <FolderInput className="size-4" />
            Copy to…
          </ContextMenuItem>
          <ContextMenuItem onClick={data.onSoftDelete}>
            <Trash2 className="size-4" />
            Move to Trash
            <ContextMenuShortcut>
              {EXPLORER_SHORTCUT_LABELS.softDelete}
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => data.setActiveDialog({ type: "delete" })}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4 text-destructive" />
            Delete
            <ContextMenuShortcut>
              {EXPLORER_SHORTCUT_LABELS.deletePermanent}
            </ContextMenuShortcut>
          </ContextMenuItem>

          {data.item.isFolder && (
            <>
              <ContextMenuSeparator />
              <ContextMenuLabel>Create</ContextMenuLabel>
              <ContextMenuItem
                onClick={() =>
                  data.setActiveDialog({ type: "newItem", variant: "file" })
                }
              >
                <FilePlus className="size-4" />
                New File…
                <ContextMenuShortcut>
                  {EXPLORER_SHORTCUT_LABELS.newFile}
                </ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  data.setActiveDialog({ type: "newItem", variant: "folder" })
                }
              >
                <FolderPlus className="size-4" />
                New Folder…
                <ContextMenuShortcut>
                  {EXPLORER_SHORTCUT_LABELS.newFolder}
                </ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <FileCode className="size-4" />
                  New from template…
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {EXPLORER_TEMPLATES.map((tpl) => (
                    <ContextMenuItem
                      key={tpl.id}
                      onClick={() => data.onNewFromTemplate(tpl)}
                    >
                      {tpl.label}
                    </ContextMenuItem>
                  ))}
                </ContextMenuSubContent>
              </ContextMenuSub>
            </>
          )}

          <ContextMenuSeparator />
          <ContextMenuLabel>Copy to clipboard</ContextMenuLabel>
          <ContextMenuItem onClick={data.onCopyFullPath}>
            <Clipboard className="size-4" />
            Copy full path
            <ContextMenuShortcut>
              {EXPLORER_SHORTCUT_LABELS.copyFullPath}
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={data.onCopyRelPath}>
            <Clipboard className="size-4" />
            Copy relative path
          </ContextMenuItem>
          <ContextMenuItem onClick={data.onCopyBaseName}>
            <Type className="size-4" />
            Copy name
          </ContextMenuItem>
          {!data.item.isFolder && (
            <ContextMenuItem onClick={data.onCopyFileUrl}>
              <Link className="size-4" />
              Copy file URL
            </ContextMenuItem>
          )}

          {!data.item.isFolder && (
            <>
              <ContextMenuSeparator />
              <ContextMenuLabel>Send</ContextMenuLabel>
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <Share2 className="size-4" />
                  Send to…
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {data.isMd && (
                    <ContextMenuItem onClick={data.onAddToLibrary}>
                      <BookPlus className="size-4" />
                      Add to Library
                    </ContextMenuItem>
                  )}
                  <ContextMenuItem onClick={data.onCopyMarkdownLink}>
                    <Link className="size-4" />
                    Copy as Markdown link
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </>
          )}

          {!data.item.isFolder && data.onFileHistory && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={data.onShowFileHistory}>
                <History className="size-4" />
                File History
              </ContextMenuItem>
            </>
          )}

          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => data.setActiveDialog({ type: "properties" })}
          >
            <Info className="size-4" />
            Properties
            <ContextMenuShortcut>
              {EXPLORER_SHORTCUT_LABELS.properties}
            </ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ExplorerItemDialogs data={data} />
    </>
  );
}
