import type {
  MockServerStoreState,
  MockServerStoreActions,
} from '@/components/MockServer/MockServer.types'

export async function loadVariantsAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  endpointId: string
): Promise<void> {
  const result = await (window as any).api.mockLoadVariants(endpointId)
  if (result.success) {
    set({
      variants: { ...get().variants, [endpointId]: result.data },
    })
  }
}
