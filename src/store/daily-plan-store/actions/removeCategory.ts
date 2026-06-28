type Get = () => any
type Set = (partial: any) => void

export async function removeCategoryAction(get: Get, set: Set, id: string): Promise<void> {
  try {
    await (window as any).api.dpRemoveCategory(id)

    const state = get()
    set({
      categories: state.categories.filter((c: any) => c.id !== id),
    })
  } catch (err) {
    console.error('Failed to remove category:', err)
  }
}
