import { useState, useEffect, useCallback } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('chat')

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCommandStore, type ChatCommand } from '@/store/command-store'

interface CommandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingCommand: ChatCommand | null
}

export function CommandDialog({
  open,
  onOpenChange,
  editingCommand,
}: CommandDialogProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [toolName, setToolName] = useState('')
  const [argsTemplate, setArgsTemplate] = useState('')
  const [nameError, setNameError] = useState('')

  const commands = useCommandStore((s) => s.commands)
  const addCommand = useCommandStore((s) => s.addCommand)
  const updateCommand = useCommandStore((s) => s.updateCommand)

  useEffect(() => {
    if (open) {
      setName(editingCommand?.name ?? '')
      setDescription(editingCommand?.description ?? '')
      setToolName(editingCommand?.toolName ?? '')
      setArgsTemplate(editingCommand?.argsTemplate ?? '')
      setNameError('')
    }
  }, [open, editingCommand])

  const validateName = useCallback(
    (value: string): boolean => {
      const normalized = value.toLowerCase().replace(/\s+/g, '-')
      if (!normalized) {
        setNameError('Name is required')
        return false
      }
      if (!/^[a-z0-9-]+$/.test(normalized)) {
        setNameError('Only letters, numbers, and hyphens allowed')
        return false
      }
      const duplicate = commands.find(
        (c) => c.name === normalized && c.id !== editingCommand?.id,
      )
      if (duplicate) {
        setNameError(`"/${normalized}" already exists`)
        return false
      }
      setNameError('')
      return true
    },
    [commands, editingCommand],
  )

  const handleSave = useCallback(async () => {
    if (!validateName(name)) return
    if (!toolName.trim()) return

    if (editingCommand) {
      await updateCommand(editingCommand.id, {
        name: name.trim(),
        description: description.trim(),
        toolName: toolName.trim(),
        argsTemplate: argsTemplate.trim(),
      })
      toast.success('Command updated', { duration: 1500 })
    } else {
      await addCommand(name.trim(), description.trim(), toolName.trim(), argsTemplate.trim())
      toast.success('Command created', { duration: 1500 })
    }
    onOpenChange(false)
  }, [name, description, toolName, argsTemplate, editingCommand, validateName, updateCommand, addCommand, onOpenChange])

  const isValid = name.trim() && toolName.trim() && !nameError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingCommand ? "Edit Command" : "New Command"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Name <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground font-mono">/</span>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) validateName(e.target.value);
                }}
                placeholder="command-name"
                autoFocus
                className="font-mono"
                disabled={editingCommand?.isBuiltIn}
              />
            </div>
            {nameError && (
              <p className="text-[11px] text-destructive mt-1">{nameError}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this command does"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Tool Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="e.g. crawl_webpage, read_file, grep_search"
              className="font-mono"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              The tool the AI should request to run when this command is used
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Args Template
            </label>
            <textarea
              value={argsTemplate}
              onChange={(e) => setArgsTemplate(e.target.value)}
              placeholder='{"key": "value"}'
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent dark:bg-card px-3 py-2 text-sm shadow-xs focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 outline-none resize-y leading-relaxed"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Default arguments template (JSON). Text after the command in chat
              will override these.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {editingCommand ? "Save Changes" : "Create Command"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
