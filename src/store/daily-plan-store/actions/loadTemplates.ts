import { BUILT_IN_TEMPLATES } from '@/components/DailyPlan/constants'

type Set = (partial: any) => void

export async function loadTemplatesAction(set: Set): Promise<void> {
  try {
    const templates = await (window as any).api.dpLoadTemplates()

    if (!templates || templates.length === 0) {
      const now = new Date().toISOString()
      const seeded = BUILT_IN_TEMPLATES.map((t) => ({
        ...t,
        createdAt: now,
        updatedAt: now,
      }))
      for (const tmpl of seeded) {
        await (window as any).api.dpSaveTemplate(tmpl)
      }
      set({ templates: seeded })
    } else {
      set({ templates })
    }
  } catch (err) {
    console.error('Failed to load templates:', err)
  }
}
