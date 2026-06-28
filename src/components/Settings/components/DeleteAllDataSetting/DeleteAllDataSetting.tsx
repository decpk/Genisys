import { memo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { SettingRow } from '../SettingRow'

export const DeleteAllDataSetting = memo(function DeleteAllDataSetting(): React.JSX.Element {
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    await window.api.deleteAllData()
    window.location.reload()
  }

  return (
    <SettingRow
      label="Delete all data"
      description="Permanently delete all application data including history, projects, chat conversations, prompts, snippets, and dashboard projects. This action cannot be undone."
    >
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 />
            Delete all data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your data including history, projects, chat
              conversations, prompts, snippets, and dashboard projects. The app will reload
              after deletion. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingRow>
  )
})
