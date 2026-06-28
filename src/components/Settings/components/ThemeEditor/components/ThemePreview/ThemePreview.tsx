import type { ThemePreviewProps } from '../../ThemeEditor.types'
import { STYLES } from '../../ThemeEditor.styles'
import { buildPreviewStyle } from '../../utils/buildPreviewStyle'
import { ThemePreviewSidebar } from '../ThemePreviewSidebar'
import { ThemePreviewContent } from '../ThemePreviewContent'
import { ThemePreviewToast } from '../ThemePreviewToast'
import { ThemePreviewTitleBar } from '../ThemePreviewTitleBar'
import { ThemePreviewToolbar } from '../ThemePreviewToolbar'

export function ThemePreview(props: ThemePreviewProps): React.JSX.Element {
  const { draft } = props
  const previewVars = buildPreviewStyle(draft)

  return (
    <div>
      <div className={STYLES.previewLabel}>Live preview</div>
      <div
        className={STYLES.previewWindow}
        style={{
          ...previewVars,
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-foreground)',
          borderColor: 'var(--color-border)',
        }}
      >
        <ThemePreviewTitleBar />
        <div className="flex" style={{ height: 320 }}>
          <ThemePreviewSidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <ThemePreviewToolbar />
            <ThemePreviewContent />
            <ThemePreviewToast />
          </div>
        </div>
      </div>
    </div>
  )
}
