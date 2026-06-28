import type { MockServerStoreState } from '@/components/MockServer/MockServer.types'

export async function loadProjectsAction(
  set: (partial: Partial<MockServerStoreState>) => void
): Promise<void> {
  try {
    const result = await (window as any).api.mockLoadProjects()
    if (result.success) {
      set({ projects: result.data })
    }
  } catch {
    // silently ignore — init loading will proceed regardless
  }
}
