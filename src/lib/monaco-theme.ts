import * as monaco from 'monaco-editor'

import { hslToHex } from '@/components/DiffViewer/DiffViewer.utils'
import type { Theme } from '@/themes/themes.types'

/**
 * Shared scrollbar options for all Monaco editor instances.
 *
 * Monaco renders its scrollbar inside its own virtualized viewport
 * (we can't swap it for the browser's native scrollbar), so we
 * make Monaco's internal scrollbar visually match the app's
 * `::-webkit-scrollbar` rules in `src/assets/main.css`:
 *   - 6px thickness on both axes
 *   - no drop shadow
 *   - primary-tinted thumb (color comes from the theme entries below)
 */
export const APP_MONACO_SCROLLBAR_OPTIONS: monaco.editor.IEditorScrollbarOptions = {
  verticalScrollbarSize: 6,
  horizontalScrollbarSize: 6,
  verticalSliderSize: 6,
  horizontalSliderSize: 6,
  useShadows: false,
  alwaysConsumeMouseWheel: false,
}

export function defineAppMonacoTheme(
  themeId: string,
  appTheme: Theme,
  options?: { includeDiffColors?: boolean }
): void {
  const c = appTheme.colors
  const colors: Record<string, string> = {
    'editor.background': hslToHex(c.card),
    'editor.foreground': hslToHex(c.foreground),
    'editor.lineHighlightBackground': hslToHex(c.muted),
    'editorLineNumber.foreground': hslToHex(c['muted-foreground']),
    'editorLineNumber.activeForeground': hslToHex(c.foreground),
    'editor.selectionBackground': hslToHex(c.primary) + '55',
    'editor.inactiveSelectionBackground': hslToHex(c.primary) + '33',
    'editor.selectionHighlightBackground': hslToHex(c.primary) + '22',
    // Match app scrollbar (primary-tinted thumb, no shadow) — see main.css.
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': hslToHex(c.primary) + '4D', // ~30%
    'scrollbarSlider.hoverBackground': hslToHex(c.primary) + '8C', // ~55%
    'scrollbarSlider.activeBackground': hslToHex(c.primary) + 'B3' // ~70%
  }

  if (options?.includeDiffColors) {
    colors['editorWidget.background'] = hslToHex(c.popover)
    colors['editorWidget.foreground'] = hslToHex(c['popover-foreground'])
    colors['editorWidget.border'] = hslToHex(c.border)
    colors['diffEditor.insertedTextBackground'] = hslToHex(c.success) + '22'
    colors['diffEditor.removedTextBackground'] = hslToHex(c.destructive) + '22'
    colors['diffEditor.insertedLineBackground'] = hslToHex(c.success) + '18'
    colors['diffEditor.removedLineBackground'] = hslToHex(c.destructive) + '18'
  }

  monaco.editor.defineTheme(themeId, {
    base: appTheme.isDark ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [],
    colors
  })
  monaco.editor.setTheme(themeId)
}
