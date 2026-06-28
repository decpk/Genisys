import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'

export async function updateServerAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  id: string,
  name: string,
  port: number,
  projectId: string
): Promise<void> {
  const result = await (window as any).api.mockUpdateServer(id, name, port, projectId)
  if (result.success) {
    const updated = result.data ?? { id, name, port, project_id: projectId }
    set({
      servers: get().servers.map((s) => (s.id === id ? updated : s)),
    })
  }
}
