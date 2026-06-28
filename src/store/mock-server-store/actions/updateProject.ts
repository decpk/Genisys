import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'

export async function updateProjectAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  id: string,
  name: string,
  color: string
): Promise<void> {
  const result = await (window as any).api.mockUpdateProject(id, name, color)
  if (result.success) {
    set({
      projects: get().projects.map((p) => (p.id === id ? result.data : p)),
    })
  }
}
