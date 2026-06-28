import { MOCK_SERVER_EVENTS } from './mockServerEvents.constants'

export function emitCreateProject(): void {
  window.dispatchEvent(new CustomEvent(MOCK_SERVER_EVENTS.createProject))
}
