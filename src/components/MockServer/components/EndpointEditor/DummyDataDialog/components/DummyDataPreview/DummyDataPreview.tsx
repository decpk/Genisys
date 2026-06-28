import { useMemo } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { APP_MONACO_SCROLLBAR_OPTIONS } from '@/lib/monaco-theme'
import { AppLoaderGlyph } from '@/components/AppLoader/AppLoaderGlyph'

import { useDummyDataPreviewData } from './useDummyDataPreviewData'
import type { DummyDataPreviewProps } from './DummyDataPreview.types'

loader.config({ monaco })

export function DummyDataPreview(props: DummyDataPreviewProps) {
  const { json, onRegenerate } = props
  const { themeId, editorFontSize, handleBeforeMount } = useDummyDataPreviewData()

  const monacoLoading = useMemo(
    () => (
      <div className="flex h-full items-center justify-center rounded-md bg-background">
        <AppLoaderGlyph size={20} />
      </div>
    ),
    []
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Preview
        </span>
        <Button variant="ghost" size="xs" onClick={onRegenerate}>
          <RefreshCw className="h-3 w-3" />
          Regenerate
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border/40">
        <Editor
          height="100%"
          language="json"
          theme={themeId}
          value={json}
          loading={monacoLoading}
          beforeMount={handleBeforeMount}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            fontSize: editorFontSize,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 8 },
            scrollbar: APP_MONACO_SCROLLBAR_OPTIONS,
          }}
        />
      </div>
    </div>
  )
}
