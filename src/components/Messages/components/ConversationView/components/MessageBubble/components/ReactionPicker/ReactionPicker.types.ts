export interface ReactionPickerProps {
  // Adds (or toggles) the chosen emoji as the local user's reaction.
  onPick: (emoji: string) => void
  isOutgoing: boolean
}
