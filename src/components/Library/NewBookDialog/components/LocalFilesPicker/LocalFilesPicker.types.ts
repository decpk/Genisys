export interface LocalFilesPickerProps {
  files: string[]
  onBrowse: () => void
  onRemove: (filePath: string) => void
  /** Called with raw dropped paths (any extension) when a native OS drop lands inside the picker. */
  onFilesDropped: (paths: string[]) => void
  /** When false, drop listeners are torn down (e.g. picker is hidden behind another tab). */
  enabled: boolean
}
