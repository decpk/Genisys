export interface UseSoundSettingsSectionDataResult {
  /** ID of the sound currently being previewed, or null when none. */
  previewingId: string | null
  /** Trigger a preview for the given sound id. Stops any previous preview. */
  previewSound: (soundId: string) => void
}
