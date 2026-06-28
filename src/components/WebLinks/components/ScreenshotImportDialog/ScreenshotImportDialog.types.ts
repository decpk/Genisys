/** Status of the screenshot-import state machine. */
export type ScreenshotImportStatus = 'idle' | 'extracting' | 'done' | 'error'

/**
 * The single active view of the dialog, derived from `status` via
 * `computeScreenshotView` (no chained ternaries). Exactly one is rendered.
 */
export type ScreenshotImportView = 'drop' | 'extracting' | 'results' | 'error'

/** Props for the controlled screenshot-import dialog. */
export interface ScreenshotImportDialogProps {
  /** Whether the dialog is open. */
  open: boolean
  /** Controlled open-change handler. */
  onOpenChange: (open: boolean) => void
}

/** View-model returned by `useScreenshotImportDialogData`. */
export interface ScreenshotImportDialogViewModel {
  /** The active view to render. */
  view: ScreenshotImportView
  /** The acquired image as a base64 data URL, or null before one is chosen. */
  imageDataUrl: string | null
  /** Candidate URLs extracted from the image. */
  urls: string[]
  /** Error surfaced from reading the image or the vision backend, or null. */
  error: string | null
  /** Ref for the hidden file input behind the "Choose image" button. */
  fileInputRef: React.RefObject<HTMLInputElement | null>
  /** Paste handler (attached to the dialog content) reading clipboard images. */
  onPaste: (event: React.ClipboardEvent) => void
  /** Drop handler for the drop zone; reads the first dropped image file. */
  onDrop: (event: React.DragEvent) => void
  /** Drag-over handler that enables dropping (preventDefault). */
  onDragOver: (event: React.DragEvent) => void
  /** Trigger the hidden file input. */
  onChooseImage: () => void
  /** Change handler for the hidden file input. */
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Open a single extracted URL in the default browser. */
  onOpenUrl: (url: string) => void
  /** Save a single extracted URL into the collection, then close the dialog. */
  onSaveUrl: (url: string) => void
  /** Open every extracted URL in the default browser. */
  onOpenAll: () => void
  /** Reset back to the drop view to scan another image. */
  onReset: () => void
}
