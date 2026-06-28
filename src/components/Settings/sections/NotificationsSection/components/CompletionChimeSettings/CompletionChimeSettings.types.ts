export interface CompletionChimeSettingsData {
  playChimeOnCompletion: boolean
  chimeSuccessSound: string
  chimeErrorSound: string
  setPlayChimeOnCompletion: (enabled: boolean) => void
  setChimeSuccessSound: (soundId: string) => void
  setChimeErrorSound: (soundId: string) => void
}
