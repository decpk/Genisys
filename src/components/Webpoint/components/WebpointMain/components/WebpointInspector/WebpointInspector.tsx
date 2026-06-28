import { ElementInspector } from './components/ElementInspector'
import { SlideInspector } from './components/SlideInspector'
import { useWebpointInspectorData } from './useWebpointInspectorData'

export function WebpointInspector(): React.JSX.Element {
  const {
    slide,
    selectedElement,
    updateElement,
    deleteElement,
    addElement,
    updateBackground,
    updateTransition,
    updateNotes,
  } = useWebpointInspectorData()

  let body: React.ReactNode = null
  if (slide && selectedElement) {
    body = (
      <ElementInspector element={selectedElement} onChange={updateElement} onDelete={deleteElement} />
    )
  } else if (slide) {
    body = (
      <SlideInspector
        slide={slide}
        onAddElement={addElement}
        onChangeBackground={updateBackground}
        onChangeTransition={updateTransition}
        onChangeNotes={updateNotes}
      />
    )
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-border/40 bg-background">
      {body}
    </aside>
  )
}
