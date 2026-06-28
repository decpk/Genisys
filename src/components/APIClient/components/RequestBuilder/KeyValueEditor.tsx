import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Checkbox } from '@/components/ui/checkbox'
import type { KeyValuePair } from '../../APIClient.types'

interface KeyValueEditorProps {
  pairs: KeyValuePair[]
  onChange: (pairs: KeyValuePair[]) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
  readOnly?: boolean
}

type EditingCell = { id: string; field: 'key' | 'value' } | null

function EditableTextarea(props: {
  initialValue: string
  onCommit: (val: string) => void
  onCancel: () => void
}) {
  const { initialValue, onCommit, onCancel } = props
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [draft, setDraft] = useState(initialValue)

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      autoResize(el)
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [autoResize])

  return (
    <textarea
      ref={textareaRef}
      value={draft}
      rows={1}
      onChange={(e) => {
        setDraft(e.target.value)
        autoResize(e.target)
      }}
      onBlur={() => onCommit(draft)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onCommit(draft)
        } else if (e.key === 'Escape') {
          e.preventDefault()
          onCancel()
        }
      }}
      className="w-full text-xs bg-card border border-transparent shadow-sm focus-visible:border-input focus-visible:ring-1 focus-visible:ring-ring/20 focus:outline-none rounded px-1.5 py-1 font-sans resize-none overflow-hidden break-all"
    />
  )
}

function InlineEditCell(props: {
  value: string
  placeholder: string
  isEditing: boolean
  onDoubleClick: () => void
  onCommit: (val: string) => void
  onCancel: () => void
  className?: string
  disabled?: boolean
}) {
  const { value, placeholder, isEditing, onDoubleClick, onCommit, onCancel, className = '', disabled } = props

  if (isEditing && !disabled) {
    return (
      <EditableTextarea
        initialValue={value}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    )
  }

  return (
    <div
      onDoubleClick={disabled ? undefined : onDoubleClick}
      className={`min-h-[20px] flex items-center cursor-default select-none rounded px-1.5 py-0.5 ${
        disabled ? '' : 'hover:bg-muted/30'
      } ${className}`}
    >
      {value ? (
        <span className="break-all">{value}</span>
      ) : (
        <span className="text-muted-foreground/40 italic">{placeholder}</span>
      )}
    </div>
  )
}

export function KeyValueEditor(props: KeyValueEditorProps): React.JSX.Element {
  const {
    pairs,
    onChange,
    keyPlaceholder = 'Key',
    valuePlaceholder = 'Value',
    readOnly = false,
  } = props

  const [editingCell, setEditingCell] = useState<EditingCell>(null)

  const handleToggle = (id: string) => {
    onChange(pairs.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)))
  }

  const handleCommit = useCallback((id: string, field: 'key' | 'value', val: string) => {
    onChange(pairs.map((p) => (p.id === id ? { ...p, [field]: val } : p)))
    setEditingCell(null)
  }, [pairs, onChange])

  const handleCancel = useCallback(() => {
    setEditingCell(null)
  }, [])

  const handleRemove = (id: string) => {
    onChange(pairs.filter((p) => p.id !== id))
    if (editingCell?.id === id) setEditingCell(null)
  }

  const handleAdd = () => {
    const newId = crypto.randomUUID()
    onChange([...pairs, { id: newId, key: '', value: '', enabled: true }])
    setEditingCell({ id: newId, field: 'key' })
  }

  if (pairs.length === 0 && !readOnly) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-dashed border-border/50">
          <span className="text-xs text-muted-foreground/60">
            No {keyPlaceholder === 'Header' ? 'headers' : 'parameters'} yet
          </span>
          <Button
            onClick={handleAdd}
            variant="subtle"
            size="xs"
          >
            <Plus size={12} />
            Add {keyPlaceholder === 'Header' ? 'Header' : 'Parameter'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col text-xs">
      {/* Header row */}
      <div className="flex items-center gap-1 px-3 py-1 border-b border-border/40 sticky -top-px bg-background z-10">
        <div className="w-5 shrink-0" />
        <div className="w-1/3 text-2xs uppercase tracking-wider text-muted-foreground/60 font-medium">
          {keyPlaceholder === "Header" ? "Name" : keyPlaceholder}
        </div>
        <div className="flex-1 text-2xs uppercase tracking-wider text-muted-foreground/60 font-medium">
          Value
        </div>
        {!readOnly && <div className="w-6 shrink-0" />}
      </div>

      {/* Rows */}
      {pairs.map((pair, index) => (
        <div
          key={pair.id}
          className={`flex items-center gap-1 px-3 py-0.5 group transition-colors hover:bg-muted/20 border-b border-border/[0.08] ${
            !pair.enabled ? "opacity-40" : ""
          } ${index % 2 === 1 ? "bg-muted/[0.03]" : ""}`}
        >
          <div className="w-5 shrink-0 flex items-center">
            <Checkbox
              checked={pair.enabled}
              onCheckedChange={() => handleToggle(pair.id)}
              disabled={readOnly}
            />
          </div>
          <div className="w-1/3 shrink-0">
            <InlineEditCell
              value={pair.key}
              placeholder={keyPlaceholder}
              isEditing={
                editingCell?.id === pair.id && editingCell?.field === "key"
              }
              onDoubleClick={() =>
                setEditingCell({ id: pair.id, field: "key" })
              }
              onCommit={(val) => handleCommit(pair.id, "key", val)}
              onCancel={handleCancel}
              className="font-medium text-foreground"
              disabled={readOnly}
            />
          </div>
          <div className="flex-1">
            <InlineEditCell
              value={pair.value}
              placeholder={valuePlaceholder}
              isEditing={
                editingCell?.id === pair.id && editingCell?.field === "value"
              }
              onDoubleClick={() =>
                setEditingCell({ id: pair.id, field: "value" })
              }
              onCommit={(val) => handleCommit(pair.id, "value", val)}
              onCancel={handleCancel}
              className="text-muted-foreground font-sans"
              disabled={readOnly}
            />
          </div>
          {!readOnly && (
            <IconButton
              size="xs"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 shrink-0"
              onClick={() => handleRemove(pair.id)}
              tooltip="Remove"
            >
              <Trash2 size={12} />
            </IconButton>
          )}
        </div>
      ))}

      {/* Add button */}
      {!readOnly && (
        <div className="flex items-center justify-center py-[40px]">
          <Button
            onClick={handleAdd}
            variant="subtle"
            size="xs"
          >
            <Plus size={12} />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
