import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'

export async function createServerAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  projectId: string,
  name: string,
  port: number
): Promise<void> {
  const result = await (window as any).api.mockCreateServer(projectId, name, port)
  if (result.success) {
    set({ servers: [...get().servers, result.data] })
  }
}
