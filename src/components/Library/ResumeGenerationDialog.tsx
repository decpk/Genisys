import { useEffect, useRef, useState } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { BookOpen, Play, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLibraryStore } from '@/store/library-store'

import { useBookGeneratorContext } from './BookGeneratorContext'
import { InlineModelPicker } from './NewBookDialog/components/InlineModelPicker'

export function ResumeGenerationDialog(): React.JSX.Element | null {
  const [open, setOpen] = useState(false)
  const [model, setModel] = useState('')
  const checkedBookIdsRef = useRef<Set<string>>(new Set())

  const activeBook = useLibraryStore((s) => s.activeBook)
  const { phase, generateAllChapters, sessionBookIds } = useBookGeneratorContext()

  const isIdle = phase === 'idle'

  // Detect interrupted generation when a book is selected
  useEffect(() => {
    if (!activeBook || !isIdle) return

    const { book, chapters } = activeBook
    const bookId = book.id

    // Already checked or generated in this session
    if (checkedBookIdsRef.current.has(bookId)) return
    if (sessionBookIds.has(bookId)) return

    checkedBookIdsRef.current.add(bookId)

    // Check if there are incomplete chapters (pending, generating, or error)
    const incompleteChapters = chapters.filter(
      (c) => c.status === 'pending' || c.status === 'generating' || c.status === 'error'
    )

    // Only show if the book was mid-generation (has chapters but some are incomplete)
    const hasCompletedChapters = chapters.some((c) => c.status === 'completed')
    const hasIncomplete = incompleteChapters.length > 0

    if (chapters.length > 0 && hasIncomplete && (book.status === 'generating' || hasCompletedChapters)) {
      setModel(book.model || 'claude-sonnet-4')
      setOpen(true)
    }
  }, [activeBook?.book.id, isIdle])

  if (!activeBook) return null

  const { book, chapters } = activeBook
  const incompleteChapters = chapters.filter(
    (c) => c.status === 'pending' || c.status === 'generating' || c.status === 'error'
  )
  const completedCount = chapters.filter((c) => c.status === 'completed').length

  const handleResume = async (): Promise<void> => {
    // Reset any stuck 'generating' chapters to 'pending' before resuming
    const store = useLibraryStore.getState()
    for (const ch of chapters) {
      if (ch.status === 'generating') {
        await store.updateChapterStatus(ch.id, 'pending')
      }
    }

    // Persist model selection to the book
    if (model && model !== book.model) {
      await store.updateBook({ ...book, model })
    }

    setOpen(false)
    generateAllChapters(book.id, model)
  }

  const handleDismiss = (): void => {
    setOpen(false)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && handleDismiss()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-[50%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg duration-200',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95'
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-warning" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Resume Chapter Generation?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">{book.title}</span> has{' '}
                  {incompleteChapters.length} pending{' '}
                  {incompleteChapters.length === 1 ? 'chapter' : 'chapters'} that{' '}
                  {incompleteChapters.length === 1 ? 'was' : 'were'} not generated.
                </p>
              </div>
            </div>

            {/* Progress summary */}
            <div className="rounded-md bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Total chapters</span>
                <span className="font-medium text-foreground">{chapters.length}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Completed</span>
                <span className="font-medium text-success">{completedCount}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Remaining</span>
                <span className="font-medium text-warning">{incompleteChapters.length}</span>
              </div>
            </div>

            {/* Model selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Model</label>
              <InlineModelPicker selectedModelId={model} onModelChange={setModel} />
            </div>

            <div className="flex justify-end gap-2 mt-1">
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                <X size={14} className="mr-1" />
                Dismiss
              </Button>
              <Button size="sm" onClick={handleResume} className="gap-1.5">
                <Play size={12} />
                Resume Generation
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
