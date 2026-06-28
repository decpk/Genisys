import { noteEditorStyles } from '../Notes.styles'
import { useNoteEditorData } from './useNoteEditorData'
import { WysiwygEditor } from '@/frameworks/wysiwyg-editor'
import type { NoteEditorProps } from './NoteEditor.types'

export function NoteEditor(props: NoteEditorProps): React.JSX.Element {
  const { note, onUpdateNote } = props
  const { title, handleTitleChange, handleContentChange } = useNoteEditorData(note, onUpdateNote)

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Note title…"
        className={noteEditorStyles.titleInput}
        spellCheck={false}
      />
      <div className={`${noteEditorStyles.editorContainer} ${noteEditorStyles.proseMirror}`}>
        <WysiwygEditor
          key={note.id}
          value={note.content}
          onChange={handleContentChange}
          placeholder="Start writing…"
          enableAIAutocomplete
        />
      </div>
    </div>
  )
}
