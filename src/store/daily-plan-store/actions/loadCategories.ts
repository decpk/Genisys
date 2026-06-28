import { DEFAULT_CATEGORIES } from '@/components/DailyPlan/constants'

type Set = (partial: any) => void

export async function loadCategoriesAction(set: Set): Promise<void> {
  try {
    const categories = await (window as any).api.dpLoadCategories()

    if (!categories || categories.length === 0) {
      const now = new Date().toISOString()
      const seeded = DEFAULT_CATEGORIES.map((c, i) => ({
        ...c,
        sortOrder: i,
        createdAt: now,
      }))
      for (const cat of seeded) {
        await (window as any).api.dpSaveCategory(cat)
      }
      set({ categories: seeded })
    } else {
      set({ categories })
    }
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}
