import { EditableElement } from './components/EditableElement'
import { useWebpointEditorCanvasData } from './useWebpointEditorCanvasData'
import type { WebpointEditorCanvasProps } from './WebpointEditorCanvas.types'

export function WebpointEditorCanvas(props: WebpointEditorCanvasProps): React.JSX.Element {
  const { slide } = props
  const { canvasRef, background, elements, selectedElementId, onSelect, onDeselect, onChangeElement } =
    useWebpointEditorCanvasData(slide)

  if (!slide) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No slide selected
      </div>
    )
  }

  const handlePointerDown = (e: React.PointerEvent): void => {
    if (e.target === e.currentTarget) onDeselect()
  }

  const canvasStyle: React.CSSProperties = { containerType: 'inline-size', background }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted/20 p-6">
      <div
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={canvasStyle}
        className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-lg border border-border/40 shadow-lg"
      >
        {elements.map((element) => (
          <EditableElement
            key={element.id}
            element={element}
            isSelected={element.id === selectedElementId}
            canvasRef={canvasRef}
            onSelect={onSelect}
            onChange={onChangeElement}
          />
        ))}
      </div>
    </div>
  )
}
