import { useState, useEffect } from 'react'
import { Folders } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ModalState } from './useNotesSidebarModalsData'
import type { NoteNotebook } from '@/store/note-notebooks-store'
import type { NoteSection } from '@/store/note-sections-store'
import type { NoteTopic } from '@/store/note-topics-store'
import type { NoteProject } from '@/store/note-projects-store'
import { MoveModal } from './MoveModal'

interface NotesSidebarModalsProps {
  modalState: ModalState | null
  onClose: () => void
  onSave: (value: string) => void
  onDelete: () => void
  onMove: (notebookId: string | null, sectionId: string | null, topicId: string | null) => void
  notebooks: NoteNotebook[]
  sections: NoteSection[]
  topics: NoteTopic[]
  projects: NoteProject[]
}

const MODAL_TITLES: Record<string, string> = {
  'create-project': 'New Project',
  'create-notebook': 'New Notebook',
  'create-section': 'New Section',
  'create-topic': 'New Topic',
  'create-label': 'New Label',
  'rename-project': 'Rename Project',
  'rename-notebook': 'Rename Notebook',
  'rename-section': 'Rename Section',
  'rename-topic': 'Rename Topic',
  'rename-note': 'Rename Note',
}

const MODAL_PLACEHOLDERS: Record<string, string> = {
  'create-project': 'Project name',
  'create-notebook': 'Notebook name',
  'create-section': 'Section name',
  'create-topic': 'Topic name',
  'create-label': 'Label name',
  'rename-project': 'Project name',
  'rename-notebook': 'Notebook name',
  'rename-section': 'Section name',
  'rename-topic': 'Topic name',
  'rename-note': 'Note title',
}

export function NotesSidebarModals({
  modalState,
  onClose,
  onSave,
  onDelete,
  onMove,
  notebooks,
  sections,
  topics,
  projects,
}: NotesSidebarModalsProps): React.JSX.Element | null {
  if (!modalState) return null

  const isCreateOrRename =
    modalState.type.startsWith('create-') || modalState.type.startsWith('rename-')
  const isDelete = modalState.type === 'delete-confirm'
  const isMove =
    modalState.type === 'move-note' ||
    modalState.type === 'move-section' ||
    modalState.type === 'move-topic'
  const isMoveNotebook = modalState.type === 'move-notebook'

  if (isCreateOrRename) {
    return (
      <CreateRenameModal
        modalState={modalState}
        onClose={onClose}
        onSave={onSave}
      />
    )
  }

  if (isDelete) {
    return (
      <DeleteConfirmModal
        modalState={modalState}
        onClose={onClose}
        onDelete={onDelete}
      />
    )
  }

  if (isMoveNotebook) {
    return (
      <MoveNotebookModal
        modalState={modalState}
        onClose={onClose}
        onMove={onMove}
        projects={projects}
      />
    )
  }

  if (isMove) {
    return (
      <MoveModal
        modalState={modalState}
        onClose={onClose}
        onMove={onMove}
        notebooks={notebooks}
        sections={sections}
        topics={topics}
        projects={projects}
      />
    )
  }

  return null
}

// ── Create / Rename Modal ───────────────────────────────────────

function CreateRenameModal({
  modalState,
  onClose,
  onSave,
}: {
  modalState: ModalState
  onClose: () => void
  onSave: (value: string) => void
}) {
  const defaultValue = modalState.type.startsWith('rename-') ? (modalState.node?.name ?? '') : ''
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) onSave(value.trim())
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{MODAL_TITLES[modalState.type] ?? 'Edit'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={MODAL_PLACEHOLDERS[modalState.type] ?? 'Name'}
              autoFocus
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!value.trim()}>
              {modalState.type.startsWith('create-') ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Delete Confirm Modal ────────────────────────────────────────

function DeleteConfirmModal({
  modalState,
  onClose,
  onDelete,
}: {
  modalState: ModalState
  onClose: () => void
  onDelete: () => void
}) {
  const node = modalState.node
  const isProject = node?.type === 'project'
  const isContainer = node && node.type !== 'note'
  const typeName =
    node?.type === 'project' ? 'project'
    : node?.type === 'notebook' ? 'notebook'
    : node?.type === 'section' ? 'section'
    : node?.type === 'topic' ? 'topic'
    : 'note'

  return (
    <AlertDialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {typeName}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>"{node?.name}"</strong>?
            {isProject && (
              <> This will permanently delete every notebook, section, topic, and note inside this project. This action cannot be undone.</>
            )}
            {!isProject && isContainer && (
              <> This will also delete all contents inside this {typeName}. This action cannot be undone.</>
            )}
            {!isContainer && <> This action cannot be undone.</>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Move Notebook (to project) Modal ────────────────────────────

function MoveNotebookModal({
  modalState,
  onClose,
  onMove,
  projects,
}: {
  modalState: ModalState
  onClose: () => void
  onMove: (notebookId: string | null, sectionId: string | null, topicId: string | null) => void
  projects: NoteProject[]
}) {
  const currentProjectId = modalState.node?.projectId ?? null
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(currentProjectId)

  const handleSave = () => {
    // Re-use the first parameter slot to carry the destination project id
    onMove(selectedProjectId, null, null)
  }

  const noChange = selectedProjectId === currentProjectId

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move "{modalState.node?.name}" to project</DialogTitle>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto space-y-0.5 py-2">
          <button
            type="button"
            onClick={() => setSelectedProjectId(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-md cursor-pointer transition-colors ${
              selectedProjectId === null
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted/50 text-muted-foreground'
            }`}
          >
            <div className="w-[18px] shrink-0" />
            No project (top level)
          </button>
          {projects.map((p) => {
            const isSelected = selectedProjectId === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-md cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <div className="w-[18px] shrink-0" />
                <Folders size={14} className="shrink-0" />
                {p.name}
              </button>
            )
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={noChange}>Move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
