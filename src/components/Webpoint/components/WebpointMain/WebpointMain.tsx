import { useState } from 'react'

import { AppLoader } from '@/components/AppLoader'
import { useWebpointAIStore } from '@/store/webpoint-ai-store'

import { WebpointEditorCanvas } from './components/WebpointEditorCanvas'
import { WebpointInspector } from './components/WebpointInspector'
import { WebpointStage } from './components/WebpointStage'
import { WebpointToolbar, type WebpointEditorMode } from './components/WebpointToolbar'
import { useWebpointMainData } from './useWebpointMainData'

export function WebpointMain(): React.JSX.Element {
  const { isLoading, presentationTitle, activeSlide, onBack } = useWebpointMainData()
  const [mode, setMode] = useState<WebpointEditorMode>('edit')
  const inspectorOpen = useWebpointAIStore((s) => s.inspectorOpen)

  if (isLoading) {
    return <AppLoader />
  }

  let body: React.ReactNode
  if (mode === 'preview') {
    body = <WebpointStage slide={activeSlide} />
  } else {
    body = (
      <div className="flex min-h-0 flex-1">
        <WebpointEditorCanvas slide={activeSlide} />
        {inspectorOpen && <WebpointInspector />}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <WebpointToolbar
        title={presentationTitle}
        mode={mode}
        onBack={onBack}
        onModeChange={setMode}
      />
      {body}
    </div>
  )
}
