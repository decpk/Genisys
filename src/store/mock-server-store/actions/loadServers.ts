import type { MockServerStoreState } from '@/components/MockServer/MockServer.types'

export async function loadServersAction(
  set: (partial: Partial<MockServerStoreState>) => void
): Promise<void> {
  try {
    const result = await (window as any).api.mockLoadServers()
    if (result.success) {
      set({ servers: result.data })
    }
  } catch {
    // silently ignore — init loading will proceed regardless
  }
}
