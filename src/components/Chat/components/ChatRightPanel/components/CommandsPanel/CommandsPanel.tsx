import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Terminal, Shield } from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('chat')

import { IconButton } from '@/components/ui/icon-button'
import { PanelHeading } from '@/components/ui/panel-heading'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchInput } from '@/components/ui/search-input'
import { Tooltip } from '@/components/Tooltip'
import { Badge } from '@/components/ui/badge'
import { useCommandStore, type ChatCommand } from '@/store/command-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'

import { CommandDialog } from './CommandDialog'

export function CommandsPanel(): React.JSX.Element {
  const commands = useCommandStore((s) => s.commands)
  const isLoaded = useCommandStore((s) => s.isLoaded)
  const loadCommands = useCommandStore((s) => s.loadCommands)
  const removeCommand = useCommandStore((s) => s.removeCommand)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCommand, setEditingCommand] = useState<ChatCommand | null>(null)

  useEffect(() => {
    if (!isLoaded) loadCommands()
  }, [isLoaded, loadCommands])

  const filtered = useMemo(() => {
    if (!search.trim()) return commands
    const q = search.toLowerCase()
    return commands.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.toolName.toLowerCase().includes(q),
    )
  }, [commands, search])

  const handleEdit = useCallback((command: ChatCommand) => {
    setEditingCommand(command)
    setDialogOpen(true)
  }, [])

  const handleCreate = useCallback(() => {
    setEditingCommand(null)
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      openConfirmDialog({
        title: 'Delete command',
        description: 'Are you sure you want to delete this command? This action cannot be undone.',
        onConfirm: () => {
          removeCommand(id)
          toast.success('Command deleted', { duration: 1500 })
        },
      })
    },
    [removeCommand, openConfirmDialog],
  )

  const builtIn = filtered.filter((c) => c.isBuiltIn)
  const custom = filtered.filter((c) => !c.isBuiltIn)

  return (
    <div className="flex flex-col h-full">
      <PanelHeading icon={Terminal} title="Commands" count={commands.length} className="px-3 h-9">
        <IconButton tooltip="New Command" tooltipSide="bottom" size="sm" onClick={handleCreate}>
          <Plus size={14} />
        </IconButton>
      </PanelHeading>

      {commands.length > 0 && (
        <div className="px-3 pb-2">
          <SearchInput placeholder="Search commands..." value={search} onChange={setSearch} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {!isLoaded ? (
          <p className="text-xs text-muted-foreground text-center py-8">Loading…</p>
        ) : commands.length === 0 ? (
          <EmptyState
            message="No commands configured. Add a command to get started!"
            icon={Terminal}
            className="py-12"
          />
        ) : filtered.length === 0 ? (
          <EmptyState message="No commands match your search" icon={Search} className="py-12" />
        ) : (
          <div className="space-y-1">
            {builtIn.length > 0 && (
              <>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1 pt-2 pb-1">
                  Built-in
                </p>
                {builtIn.map((cmd) => (
                  <CommandItem key={cmd.id} command={cmd} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </>
            )}
            {custom.length > 0 && (
              <>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1 pt-3 pb-1">
                  Custom
                </p>
                {custom.map((cmd) => (
                  <CommandItem key={cmd.id} command={cmd} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <CommandDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingCommand={editingCommand}
      />
    </div>
  )
}

// ── Single Command Item ─────────────────────────────────────────

function CommandItem({
  command,
  onEdit,
  onDelete,
}: {
  command: ChatCommand
  onEdit: (c: ChatCommand) => void
  onDelete: (id: string) => void
}): React.JSX.Element {
  return (
    <div className="group flex items-start gap-2 rounded-lg px-2.5 py-2 hover:bg-secondary/50 transition-colors">
      <Terminal size={14} className="shrink-0 mt-0.5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-[13px] text-foreground">
            /{command.name}
          </span>
          {command.isBuiltIn && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
              <Shield size={8} className="mr-0.5" />
              built-in
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
          {command.description}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">
          → {command.toolName}
        </p>
      </div>
      {!command.isBuiltIn && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Tooltip content="Edit" side="bottom">
            <button
              onClick={() => onEdit(command)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <Pencil size={12} />
            </button>
          </Tooltip>
          <Tooltip content="Delete" side="bottom">
            <button
              onClick={() => onDelete(command.id)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
