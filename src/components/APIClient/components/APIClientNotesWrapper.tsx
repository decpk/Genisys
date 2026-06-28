import { NotesPanelDataProvider } from '@/right-panels/Notes'

import { useAPIClientNotesData } from '../hooks/useAPIClientNotesData'

export function APIClientNotesWrapper(props: {
  children: React.ReactNode
}): React.JSX.Element {
  const { children } = props
  const { data, actions } = useAPIClientNotesData()

  return (
    <NotesPanelDataProvider data={data} actions={actions}>
      {children}
    </NotesPanelDataProvider>
  )
}
