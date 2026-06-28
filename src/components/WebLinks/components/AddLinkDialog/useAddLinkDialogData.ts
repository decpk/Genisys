import { useCallback, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'
import { isValidUrl } from '@/components/WebLinks/utils/isValidUrl'
import { scopedToast } from '@/frameworks/notification'

import type { AddLinkDialogViewModel } from './AddLinkDialog.types'

const toast = scopedToast('weblinks')

/**
 * Manages the quick-add link form inside the dialog. Submitting fetches the
 * URL's link metadata and saves it straight into the collection — into the
 * selected folder when one is active, otherwise unfiled — then closes the
 * dialog on success. The input resets each time the dialog opens.
 */
export function useAddLinkDialogData(
  open: boolean,
  onOpenChange: (open: boolean) => void,
): AddLinkDialogViewModel {
  const addLink = useWebLinksStore((state) => state.addLink)
  const selectedFolder = useWebLinksStore((state) => state.selectedFolder)

  const [inputValue, setInputValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [prevOpen, setPrevOpen] = useState(open)

  // Reset the form each time the dialog opens (render-phase pattern).
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setInputValue('')
      setIsAdding(false)
    }
  }

  const canSubmit = !isAdding && isValidUrl(inputValue)

  const onInputChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value)
  }, [])

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault()
      if (isAdding || !isValidUrl(inputValue)) return

      const targetFolderId =
        selectedFolder !== 'all' && selectedFolder !== 'unfiled' ? selectedFolder : null

      setIsAdding(true)
      void (async (): Promise<void> => {
        try {
          const saved = await addLink(inputValue, targetFolderId)
          toast.success(`Saved "${saved.title || saved.url}"`, { duration: 1800 })
          onOpenChange(false)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to add link.'
          toast.error(message)
        } finally {
          setIsAdding(false)
        }
      })()
    },
    [addLink, inputValue, isAdding, selectedFolder, onOpenChange],
  )

  return {
    inputValue,
    isAdding,
    canSubmit,
    onInputChange,
    onSubmit,
  }
}
