import type {
  ScreenshotImportStatus,
  ScreenshotImportView,
} from '../ScreenshotImportDialog.types'

/** Lookup map from status → view (no chained ternaries). */
const VIEW_BY_STATUS: Record<ScreenshotImportStatus, ScreenshotImportView> = {
  idle: 'drop',
  extracting: 'extracting',
  done: 'results',
  error: 'error',
}

/** Derive the single active view from the dialog's status. */
export function computeScreenshotView(
  status: ScreenshotImportStatus,
): ScreenshotImportView {
  return VIEW_BY_STATUS[status]
}
