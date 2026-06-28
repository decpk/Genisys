import { useCallEngine } from './useCallEngine'
import { useEphemeralReaper } from './useEphemeralReaper'
import { useMessagesBoot } from './useMessagesBoot'
import { useMessagesControl } from './useMessagesControl'
import { useMessagesSubscriptions } from './useMessagesSubscriptions'

// Orchestrator: boots the messaging runtime, wires live event
// subscriptions, mounts the audio/video call engine, the app-control
// (reactions / disappearing-timer) channel, and the ephemeral reaper.
// Returns whether the runtime has started (for the loader).
export function useMessagesData(): { isStarted: boolean } {
  const { isStarted } = useMessagesBoot()
  useMessagesSubscriptions()
  useCallEngine()
  useMessagesControl()
  useEphemeralReaper()
  return { isStarted }
}
