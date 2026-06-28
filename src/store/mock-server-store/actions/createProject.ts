import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'

export async function createProjectAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  name: string,
  color: string
): Promise<void> {
  const result = await (window as any).api.mockCreateProject(name, color)
  if (result.success) {
    set({ projects: [...get().projects, result.data] })
  }
}
