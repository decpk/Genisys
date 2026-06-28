type Get = () => any
type Set = (partial: any) => void

export async function removeTemplateAction(get: Get, set: Set, id: string): Promise<void> {
  try {
    await (window as any).api.dpRemoveTemplate(id)

    const state = get()
    set({
      templates: state.templates.filter((t: any) => t.id !== id),
    })
  } catch (err) {
    console.error('Failed to remove template:', err)
  }
}
