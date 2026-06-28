import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Share2, Sparkles, SplitSquareHorizontal, SplitSquareVertical, X } from 'lucide-react'
import { memo, useLayoutEffect, useMemo, useRef } from 'react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'
import { PromptPicker, stripPromptTemplate } from '@/components/PromptPicker'
import { useTerminalAppStore } from '@/store/terminal-app-store'
import { useRemoteTerminalStore } from '@/store/remote-terminal-store'
import { useTerminalRenameStore } from '@/store/terminal-rename-store'
import { useTerminalPromptStore } from '@/store/terminal-prompt-store'
import { useSettingsStore } from '@/store/settings-store'
import type { TermLeaf } from '@/store/terminal-app-store/types'

import { terminalAppStyles } from '../../TerminalApp.styles'
import { buildTerminalTabSortableId } from '../TerminalAppDnd/terminalAppDragIds'
import { TerminalAppPaneTabItem } from '../TerminalAppPaneTabItem/TerminalAppPaneTabItem'
import { focusSurface, pasteIntoSurface } from '../TerminalAppSurface/terminalAppSurfacePool'
import { TerminalGitToggleButton } from '../TerminalGitToggleButton'

interface Props {
  leaf: TermLeaf
}

/** Tab strip + pane actions (new tab, split right/down, close pane) for a leaf. */
export const TerminalAppPaneTabs = memo(function TerminalAppPaneTabs({ leaf }: Props) {
  const createTab = useTerminalAppStore((s) => s.createTab)
  const setActiveTab = useTerminalAppStore((s) => s.setActiveTab)
  const closeTab = useTerminalAppStore((s) => s.closeTab)
  const togglePinTab = useTerminalAppStore((s) => s.togglePinTab)
  const setTabTheme = useTerminalAppStore((s) => s.setTabTheme)
  const setTabFontFamily = useTerminalAppStore((s) => s.setTabFontFamily)
  const splitGroup = useTerminalAppStore((s) => s.splitGroup)
  const closeGroup = useTerminalAppStore((s) => s.closeGroup)
  const openRename = useTerminalRenameStore((s) => s.open)
  const openSharePanel = useRemoteTerminalStore((s) => s.openPanel)
  const sharing = useRemoteTerminalStore((s) => s.running)
  const promptGroupId = useTerminalPromptStore((s) => s.groupId)
  const openPrompt = useTerminalPromptStore((s) => s.open)
  const closePrompt = useTerminalPromptStore((s) => s.close)

  const sortableIds = useMemo(
    () => leaf.tabs.map((t) => buildTerminalTabSortableId(leaf.id, t.id)),
    [leaf.tabs, leaf.id],
  )

  // Keep the active tab visible whenever it changes (new tab via the + button /
  // Cmd+T, keyboard tab cycling, or activating a partially off-screen tab) so a
  // freshly created tab never lands off-screen in an overflowing, hidden-
  // scrollbar strip with no cue. Mirrors the ActivityBar's scroll-active-into-
  // view behaviour. Scoped to this pane's strip via the ref so split panes each
  // reveal only their own active tab.
  const tabsRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = tabsRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    el?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [leaf.activeTabId])

  return (
    <div className={terminalAppStyles.tabBar}>
      <div ref={tabsRef} className={terminalAppStyles.tabs} role="tablist">
        <SortableContext
          items={sortableIds}
          strategy={horizontalListSortingStrategy}
        >
          {leaf.tabs.map((t) => (
            <TerminalAppPaneTabItem
              key={t.id}
              tab={t}
              groupId={leaf.id}
              active={t.id === leaf.activeTabId}
              onActivate={(id) => setActiveTab(id, leaf.id)}
              onClose={(id) => void closeTab(id)}
              onTogglePin={(id) => togglePinTab(id)}
              onRename={(id) => openRename(id)}
              onSetTheme={(id, themeId) => setTabTheme(id, themeId)}
              onSetFont={(id, fontFamily) => setTabFontFamily(id, fontFamily)}
            />
          ))}
        </SortableContext>
      </div>
      <Tooltip content="New tab" triggerClassName="inline-flex shrink-0 ml-1">
        <button
          type="button"
          className={terminalAppStyles.tabNewBtn}
          onClick={() => void createTab({ groupId: leaf.id })}
          aria-label="New terminal tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
      <div className={terminalAppStyles.actions}>
        <TerminalGitToggleButton leafId={leaf.id} />
        <PromptPicker
          appId="terminal"
          side="bottom"
          align="end"
          open={promptGroupId === leaf.id}
          onOpenChange={(next) => (next ? openPrompt(leaf.id) : closePrompt())}
          trigger={
            <button
              type="button"
              className={terminalAppStyles.actionBtn}
              title="Insert prompt"
              aria-label="Insert a saved prompt into this terminal"
              disabled={!leaf.activeTabId}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          }
          onSelect={(prompt) => {
            const sessionId = leaf.activeTabId;
            if (!sessionId) return;
            const text = stripPromptTemplate(prompt.content);
            if (!text) return;
            pasteIntoSurface(sessionId, text, {
              run: useSettingsStore.getState().terminalInsertPromptAutoRun,
            });
            // Defer focus so it runs AFTER the popover's close returns focus to
            // the trigger button — otherwise focus lands on the button, not the
            // terminal the user just pasted into.
            requestAnimationFrame(() => focusSurface(sessionId));
          }}
        />
        <Tooltip
          content={
            sharing
              ? "Sharing terminal — open panel"
              : "Share terminal to a device (QR)"
          }
        >
          <button
            type="button"
            className={cn(
              terminalAppStyles.actionBtn,
              sharing && "text-emerald-500 hover:text-emerald-400",
            )}
            onClick={() => openSharePanel()}
            aria-label="Share terminal to a device on your network"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
        <Tooltip content="Split right">
          <button
            type="button"
            className={terminalAppStyles.actionBtn}
            onClick={() => void splitGroup(leaf.id, "horizontal")}
            aria-label="Split terminal right"
          >
            <SplitSquareHorizontal className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
        <Tooltip content="Split down">
          <button
            type="button"
            className={terminalAppStyles.actionBtn}
            onClick={() => void splitGroup(leaf.id, "vertical")}
            aria-label="Split terminal down"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
        <Tooltip content="Close pane">
          <button
            type="button"
            className={terminalAppStyles.actionBtn}
            onClick={() => void closeGroup(leaf.id)}
            aria-label="Close terminal pane"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
})
