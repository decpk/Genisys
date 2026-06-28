import { useRef } from 'react'

import { useLocalFilesDrop } from '../../hooks/useLocalFilesDrop'

interface UseLocalFilesPickerDataArgs {
  enabled: boolean
  onFilesDropped: (paths: string[]) => void
}

interface UseLocalFilesPickerDataApi {
  dropzoneRef: React.RefObject<HTMLDivElement | null>
  isDragOver: boolean
}

/**
 * Picker-local "smart" hook. Owns the dropzone ref (used purely for drag-over
 * styling on the wrapper element) and composes the shared `useLocalFilesDrop`
 * hook so that the view stays purely declarative.
 */
export function useLocalFilesPickerData(
  args: UseLocalFilesPickerDataArgs,
): UseLocalFilesPickerDataApi {
  const { enabled, onFilesDropped } = args
  const dropzoneRef = useRef<HTMLDivElement>(null)

  const drop = useLocalFilesDrop({ enabled, onFilesDropped });

  return { dropzoneRef, isDragOver: drop.isDragOver }
}
