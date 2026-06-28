import { useMemo } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { Database } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { APP_MONACO_SCROLLBAR_OPTIONS } from '@/lib/monaco-theme'
import { AppLoaderGlyph } from '@/components/AppLoader/AppLoaderGlyph'

import { DummyDataDialog } from '../DummyDataDialog'
import { useStaticResponseTabData } from './useStaticResponseTabData'
import { staticResponseTabStyles as styles } from './StaticResponseTab.styles'
import type { StaticResponseTabProps } from './StaticResponseTab.types'

loader.config({ monaco })

export function StaticResponseTab(props: StaticResponseTabProps) {
  const { value, onChange } = props
  const {
    themeId,
    editorFontSize,
    handleBeforeMount,
    handleEditorChange,
    isDummyDialogOpen,
    setIsDummyDialogOpen,
    openDummyDialog,
    handleApplyDummyData,
  } = useStaticResponseTabData(onChange)

  const monacoLoading = useMemo(
    () => (
      <div className={styles.loading}>
        <AppLoaderGlyph size={20} />
      </div>
    ),
    []
  )

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <Button variant="outline" size="xs" onClick={openDummyDialog}>
          <Database className="h-3 w-3" />
          Add dummy data
        </Button>
      </div>

      <div className={styles.editorWrap}>
        <Editor
          height="100%"
          language="json"
          theme={themeId}
          value={value}
          onChange={handleEditorChange}
          loading={monacoLoading}
          beforeMount={handleBeforeMount}
          options={{
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

      <DummyDataDialog
        open={isDummyDialogOpen}
        onOpenChange={setIsDummyDialogOpen}
        onApply={handleApplyDummyData}
      />
    </div>
  )
}
