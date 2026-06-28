import { useState, useCallback, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { generateId } from '../../utils/generateId'
import { DeleteConfirmationDialog } from '../dialogs/DeleteConfirmationDialog'
import { useDailyPlanConfirmation } from '@/hooks/useDailyPlanConfirmation'
import type { DPCategory } from '../../DailyPlan.types'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editCategory?: DPCategory | null
}

const PRESET_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#ef4444',
  '#a855f7',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
]

export function CategoryDialog({
  open,
  onOpenChange,
  editCategory,
}: CategoryDialogProps): React.JSX.Element {
  const saveCategory = useDailyPlanStore((s) => s.saveCategory)
  const removeCategory = useDailyPlanStore((s) => s.removeCategory)
  const categories = useDailyPlanStore((s) => s.categories)

  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [icon, setIcon] = useState('')
  
  const confirmation = useDailyPlanConfirmation()
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  useEffect(() => {
    if (open && editCategory) {
      setName(editCategory.name)
      setColor(editCategory.color)
      setIcon(editCategory.icon)
    } else if (open) {
      setName('')
      setColor(PRESET_COLORS[0])
      setIcon('')
    }
  }, [open, editCategory])

  const handleDeleteConfirm = async () => {
    if (pendingDelete) {
      await removeCategory(pendingDelete)
      setPendingDelete(null)
      confirmation.closeConfirmation()
      onOpenChange(false)
    }
  }

  const handleDeleteClick = () => {
    if (editCategory) {
      // Calculate affected tasks count
      const tasksWithThisCategory = 0 // Would need to calculate from store
      const warnings = tasksWithThisCategory > 0 
        ? [`${tasksWithThisCategory} task(s) will lose this category`]
        : []
      
      setPendingDelete(editCategory.id)
      confirmation.openConfirmation(
        'Delete Category',
        'Are you sure you want to delete',
        editCategory.name,
        handleDeleteConfirm,
        warnings
      )
    }
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!name.trim()) return

      const now = new Date().toISOString()
      const category: DPCategory = {
        id: editCategory?.id ?? generateId('cat'),
        name: name.trim(),
        color,
        icon: icon.trim(),
        sortOrder: editCategory?.sortOrder ?? 0,
        createdAt: editCategory?.createdAt ?? now,
      }

      saveCategory(category)
      onOpenChange(false)
    },
    [name, color, icon, editCategory, saveCategory, onOpenChange],
  )

  const isEditing = !!editCategory

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={confirmation.isOpen}
        onConfirm={confirmation.handleConfirm}
        onCancel={confirmation.handleCancel}
        title={confirmation.title}
        description={confirmation.description}
        itemName={confirmation.itemName}
        warnings={confirmation.warnings}
        isLoading={confirmation.isLoading}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'New Category'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the category details below.'
              : 'Create a new category to organize your tasks.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="category-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Personal, Health"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'size-7 rounded-full transition-all cursor-pointer',
                    color === c
                      ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                      : 'hover:scale-110',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category-icon" className="text-sm font-medium">
              Icon name
            </label>
            <Input
              id="category-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g. briefcase, heart, book"
            />
          </div>

          <DialogFooter className="flex-row gap-2 justify-between sm:justify-between">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="gap-2"
                >
                  <Trash2 size={16} />
                  Delete Category
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!name.trim()}>
                {isEditing ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
