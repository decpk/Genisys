export interface ContinueRequest {
  iterationsUsed: number
  totalToolCalls: number
}

export interface ContinuePanelProps {
  request: ContinueRequest
  onContinue: () => void
  onStop: () => void
}
