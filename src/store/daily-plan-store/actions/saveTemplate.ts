type Get = () => any
type Set = (partial: any) => void

export async function saveTemplateAction(get: Get, set: Set, template: any): Promise<void> {
  try {
    await (window as any).api.dpSaveTemplate(template)

    const state = get()
    const templates = [...state.templates]
    const existingIdx = templates.findIndex((t: any) => t.id === template.id)
    if (existingIdx >= 0) {
      templates[existingIdx] = template
    } else {
      templates.push(template)
    }

    set({ templates })
  } catch (err) {
    console.error('Failed to save template:', err)
  }
}
