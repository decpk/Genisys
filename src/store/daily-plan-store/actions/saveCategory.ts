type Get = () => any
type Set = (partial: any) => void

export async function saveCategoryAction(get: Get, set: Set, category: any): Promise<void> {
  try {
    await (window as any).api.dpSaveCategory(category)

    const state = get()
    const categories = [...state.categories]
    const existingIdx = categories.findIndex((c: any) => c.id === category.id)
    if (existingIdx >= 0) {
      categories[existingIdx] = category
    } else {
      categories.push(category)
    }

    set({ categories })
  } catch (err) {
    console.error('Failed to save category:', err)
  }
}
