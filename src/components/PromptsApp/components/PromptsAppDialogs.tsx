import { PromptDialog } from '@/components/PromptManager/PromptDialog'
import { FolderDialog } from '@/components/PromptManager/FolderDialog'
import { CategoryDialog } from '@/components/PromptManager/CategoryDialog'
import { MovePromptDialog } from '@/components/PromptManager/MovePromptDialog'
import { ImportDialog } from '@/components/PromptManager/ImportDialog'

import type { PromptsAppData } from '../PromptsApp.types'

interface PromptsAppDialogsProps {
  data: PromptsAppData
}

/**
 * Thin wrapper that mounts every dialog the Prompts app needs. Dialog
 * state lives in `usePromptsAppData`; this component just passes it
 * through to the individual radix-based dialogs imported from
 * PromptManager (the existing dialog suite is reused across surfaces).
 */
export function PromptsAppDialogs(props: PromptsAppDialogsProps): React.JSX.Element {
  const { data } = props
  const {
    dialogs,
    closeDialog,
  } = data

  return (
    <>
      <PromptDialog
        open={dialogs.promptDialog.open}
        prompt={dialogs.promptDialog.prompt}
        defaultCategoryId={dialogs.promptDialog.categoryId}
        defaultFolderId={dialogs.promptDialog.folderId}
        onClose={() => closeDialog('promptDialog')}
      />
      <FolderDialog
        open={dialogs.folderDialog.open}
        folder={dialogs.folderDialog.folder}
        onClose={() => closeDialog('folderDialog')}
      />
      <CategoryDialog
        open={dialogs.categoryDialog.open}
        folderId={dialogs.categoryDialog.folderId}
        category={dialogs.categoryDialog.category}
        onClose={() => closeDialog('categoryDialog')}
      />
      <MovePromptDialog
        open={dialogs.moveDialog.open}
        prompt={dialogs.moveDialog.prompt}
        onClose={() => closeDialog('moveDialog')}
      />
      <ImportDialog
        open={dialogs.importDialog}
        onClose={() => closeDialog('importDialog')}
      />
    </>
  )
}
