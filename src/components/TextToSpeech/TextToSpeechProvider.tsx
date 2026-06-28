import { TextToSpeechContext } from './TextToSpeechContext'
import { useTextToSpeechData } from './hooks/useTextToSpeechData'

function TextToSpeechProvider(props: { children: React.ReactNode }) {
  const { children } = props
  const tts = useTextToSpeechData()

  return (
    <TextToSpeechContext.Provider value={tts}>
      {children}
    </TextToSpeechContext.Provider>
  )
}

export { TextToSpeechProvider }
