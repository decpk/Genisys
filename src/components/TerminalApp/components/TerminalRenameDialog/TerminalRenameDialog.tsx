import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useTerminalAppStore } from '@/store/terminal-app-store'
import { collectTabs } from '@/store/terminal-app-store/treeUtils'
import { useTerminalRenameStore } from '@/store/terminal-rename-store'

/**
 * Host for the Terminal app's "Rename Tab" modal. Reads the target tab id from
 * `useTerminalRenameStore` (set by a tab's context menu / double-click) and the
 * current title from the split-tree, then renders a radix dialog with a single
 * text input. Mounted once at the Terminal app root, mirroring `RemoteShareHost`.
 */
export function TerminalRenameDialog(): React.JSX.Element {
  const tabId = useTerminalRenameStore((s) => s.tabId)
  const close = useTerminalRenameStore((s) => s.close)
  const tree = useTerminalAppStore((s) => s.tree)

  const tab = tabId ? (collectTabs(tree).find((t) => t.id === tabId) ?? null) : null
  const open = tab !== null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
    >
      <DialogContent className="sm:max-w-md">
        {/* Gate the form on `open` so its local state is freshly seeded from the
            current title each time the dialog opens (avoids effect cascades). */}
        {open && tab && (
          <TerminalRenameForm tabId={tab.id} initialValue={tab.title} onClose={close} />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface TerminalRenameFormProps {
  tabId: string
  initialValue: string
  onClose: () => void
}

function TerminalRenameForm({
  tabId,
  initialValue,
  onClose,
}: TerminalRenameFormProps): React.JSX.Element {
  const renameTab = useTerminalAppStore((s) => s.renameTab)
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus + select once on mount so the user can immediately type to replace
  // the current name or accept it with Enter.
  useEffect(() => {
    const id = window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  const trimmed = value.trim()
  const canSubmit = trimmed.length > 0

  function handleSubmit(e?: React.FormEvent): void {
    e?.preventDefault()
    if (!canSubmit) return
    renameTab(tabId, trimmed)
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Rename Tab</DialogTitle>
        <DialogDescription>
          Give this terminal tab a custom name. It won&apos;t change when you switch folders.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          ref={inputRef}
          value={value}
          placeholder="Tab name"
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            Rename
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
