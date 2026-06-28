import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'

export async function deleteProjectAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  id: string
): Promise<void> {
  const result = await (window as any).api.mockDeleteProject(id)
  if (result.success) {
    set({
      projects: get().projects.filter((p) => p.id !== id),
      servers: get().servers.map((s) =>
        s.project_id === id ? { ...s, project_id: '' } : s
      ),
    })
  }
}
