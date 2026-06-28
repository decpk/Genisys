/** Props for the screenshot drop zone (drop / paste / file-picker target). */
export interface ScreenshotDropZoneProps {
  /** Ref for the hidden file input the "Choose image" button triggers. */
  fileInputRef: React.RefObject<HTMLInputElement | null>
  /** Drop handler; reads the first dropped image file. */
  onDrop: (event: React.DragEvent) => void
  /** Drag-over handler that enables dropping (preventDefault). */
  onDragOver: (event: React.DragEvent) => void
  /** Trigger the hidden file input. */
  onChooseImage: () => void
  /** Change handler for the hidden file input. */
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}
