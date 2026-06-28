import { useCallback } from 'react'
import { KeyMod, KeyCode } from 'monaco-editor'
import type * as monaco from 'monaco-editor'

/**
 * Registers a Cmd/Ctrl+S action on the Monaco editor that triggers `onSave`,
 * mirroring the chapter editor's save shortcut handling.
 */
export function useWebpageEditorKeyboard(onSave: () => void) {
  const handleEditorMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editor.addAction({
        id: 'webpage-editor-save',
        label: 'Save Webpage',
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
        run: () => onSave(),
      })
    },
    [onSave],
  )

  return { handleEditorMount }
}
