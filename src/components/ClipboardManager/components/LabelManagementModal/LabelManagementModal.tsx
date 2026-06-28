import { Pencil, Plus, Trash2, Check, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { IconButton } from '@/components/ui/icon-button'
import type { LabelManagementModalProps } from './LabelManagementModal.types'
import { useLabelManagementModalData } from './useLabelManagementModalData'
import { LABEL_COLOR_OPTIONS } from './LabelManagementModal.constants'

export function LabelManagementModal(props: LabelManagementModalProps): React.JSX.Element {
  const { open, onOpenChange } = props
  const {
    labels,
    newName,
    setNewName,
    newColor,
    setNewColor,
    editingId,
    editName,
    setEditName,
    editColor,
    setEditColor,
    handleCreate,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
  } = useLabelManagementModalData()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Labels</DialogTitle>
        </DialogHeader>

        {/* Create new label */}
        <div className="space-y-2 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              placeholder="New label name..."
              className="flex-1 min-w-0 text-sm bg-muted/50 rounded-md px-3 py-1.5 border border-input outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
            />
            <IconButton
              onClick={handleCreate}
              disabled={!newName.trim()}
              size="sm"
            >
              <Plus size={16} />
            </IconButton>
          </div>
          <ColorPicker selectedColor={newColor} onSelectColor={setNewColor} />
        </div>

        {/* Label list */}
        <div className="max-h-64 overflow-y-auto space-y-1 py-1">
          {labels.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No labels yet. Create one above.
            </p>
          )}
          {labels.map((label) => {
            const isEditing = editingId === label.id;
            if (isEditing) {
              return (
                <div
                  key={label.id}
                  className="space-y-1.5 px-2 py-1.5 rounded-md bg-accent/50"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      className="flex-1 min-w-0 text-sm bg-transparent border-none outline-none text-foreground"
                      autoFocus
                    />
                    <IconButton
                      onClick={handleSaveEdit}
                      variant="subtle"
                      size="xs"
                    >
                      <Check size={14} />
                    </IconButton>
                    <IconButton
                      onClick={handleCancelEdit}
                      variant="ghost"
                      size="xs"
                    >
                      <X size={14} />
                    </IconButton>
                  </div>
                  <ColorPicker
                    selectedColor={editColor}
                    onSelectColor={setEditColor}
                  />
                </div>
              );
            }
            return (
              <div
                key={label.id}
                className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/30"
              >
                <span
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: label.color }}
                />
                <span className="flex-1 text-sm text-foreground truncate">
                  {label.name}
                </span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton
                    onClick={() =>
                      handleStartEdit(label.id, label.name, label.color)
                    }
                    variant="ghost"
                    size="xs"
                    showOnHover
                  >
                    <Pencil size={13} />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(label.id, label.name)}
                    variant="destructive"
                    size="xs"
                    showOnHover
                  >
                    <Trash2 size={13} />
                  </IconButton>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ColorPickerProps {
  selectedColor: string
  onSelectColor: (color: string) => void
}

function ColorPicker(props: ColorPickerProps): React.JSX.Element {
  const { selectedColor, onSelectColor } = props

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {LABEL_COLOR_OPTIONS.map((color) => {
        const isSelected = selectedColor === color;
        return (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            className="size-5 rounded-full border-2 transition-colors shrink-0"
            style={{
              backgroundColor: color,
              borderColor: isSelected ? "white" : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}
