import { MOCK_SERVER_EVENTS } from './mockServerEvents.constants'

export function emitCreateServer(): void {
  window.dispatchEvent(new CustomEvent(MOCK_SERVER_EVENTS.createServer))
}
