import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description: string
  itemName: string
  warnings?: string[]
  isLoading?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
}

export function DeleteConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  itemName,
  warnings = [],
  isLoading = false,
  confirmButtonText = 'Delete',
  cancelButtonText = 'Cancel',
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {description} <strong>"{itemName}"</strong>
              {warnings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {warnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-400">
                      <span className="mt-0.5">•</span>
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-xs text-muted-foreground">
                This action cannot be undone.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            {cancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="!bg-red-500/10 !text-red-500 hover:!bg-red-500/20"
          >
            {isLoading ? 'Deleting...' : confirmButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
