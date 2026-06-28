import { create } from 'zustand'

import { createBlankSlide } from '@/store/webpoint-store/factories/createBlankSlide'
import type {
  PresentationMeta,
  PresentationWithSlides,
  Slide,
  SlideData,
  SlideInput,
} from '@/store/webpoint-store/types'

interface WebpointState {
  presentations: PresentationMeta[]
  isLoaded: boolean
  activePresentationId: string | null
  activePresentation: PresentationWithSlides | null
  activeSlideId: string | null
  selectedElementId: string | null
  isLoadingPresentation: boolean
}

interface WebpointActions {
  loadPresentations: () => Promise<void>
  createPresentation: (title?: string, description?: string) => Promise<PresentationMeta>
  updatePresentation: (presentation: PresentationMeta) => Promise<void>
  renamePresentation: (presentationId: string, title: string) => Promise<void>
  removePresentation: (presentationId: string) => Promise<void>
  selectPresentation: (presentationId: string | null) => Promise<void>
  reloadPresentation: (presentationId: string) => Promise<void>
  addSlide: (presentationId: string) => Promise<Slide | null>
  updateSlide: (slide: Slide) => Promise<void>
  updateSlideData: (slideId: string, data: SlideData) => Promise<void>
  removeSlide: (slideId: string, presentationId: string) => Promise<void>
  reorderSlides: (presentationId: string, orderedSlideIds: string[]) => Promise<void>
  replaceSlides: (presentationId: string, inputs: SlideInput[], title?: string) => Promise<void>
  appendSlides: (presentationId: string, inputs: SlideInput[]) => Promise<Slide[]>
  selectSlide: (slideId: string | null) => void
  setSelectedElement: (elementId: string | null) => void
}

const slideSaveTimers = new Map<string, ReturnType<typeof setTimeout>>()

function scheduleSlideSave(slide: Slide): void {
  const existing = slideSaveTimers.get(slide.id)
  if (existing) clearTimeout(existing)
  slideSaveTimers.set(
    slide.id,
    setTimeout(() => {
      slideSaveTimers.delete(slide.id)
      void window.api.saveSlide(slide)
    }, 350)
  )
}

export const useWebpointStore = create<WebpointState & WebpointActions>()((set, get) => ({
  presentations: [],
  isLoaded: false,
  activePresentationId: null,
  activePresentation: null,
  activeSlideId: null,
  selectedElementId: null,
  isLoadingPresentation: false,

  loadPresentations: async () => {
    const presentations = (await window.api.loadPresentations()) as PresentationMeta[]
    set({ presentations, isLoaded: true })
  },

  createPresentation: async (title = 'Untitled Presentation', description = '') => {
    const now = new Date().toISOString()
    const presentation: PresentationMeta = {
      id: crypto.randomUUID(),
      title,
      description,
      slideCount: 1,
      theme: 'default',
      createdAt: now,
      updatedAt: now,
    }
    const firstSlide = createBlankSlide(presentation.id, 0)
    await window.api.savePresentation(presentation)
    await window.api.saveSlide(firstSlide)
    set((s) => ({
      presentations: [presentation, ...s.presentations],
      activePresentationId: presentation.id,
      activePresentation: { presentation, slides: [firstSlide] },
      activeSlideId: firstSlide.id,
      selectedElementId: null,
      isLoadingPresentation: false,
    }))
    return presentation
  },

  updatePresentation: async (presentation) => {
    const updated: PresentationMeta = { ...presentation, updatedAt: new Date().toISOString() }
    set((s) => ({
      presentations: s.presentations.map((p) => (p.id === updated.id ? updated : p)),
      activePresentation:
        s.activePresentation && s.activePresentation.presentation.id === updated.id
          ? { ...s.activePresentation, presentation: updated }
          : s.activePresentation,
    }))
    await window.api.savePresentation(updated)
  },

  renamePresentation: async (presentationId, title) => {
    const meta = get().presentations.find((p) => p.id === presentationId)
    if (!meta) return
    await get().updatePresentation({ ...meta, title })
  },

  removePresentation: async (presentationId) => {
    set((s) => {
      const isActive = s.activePresentationId === presentationId
      return {
        presentations: s.presentations.filter((p) => p.id !== presentationId),
        activePresentationId: isActive ? null : s.activePresentationId,
        activePresentation: isActive ? null : s.activePresentation,
        activeSlideId: isActive ? null : s.activeSlideId,
      }
    })
    await window.api.removePresentation(presentationId)
  },

  selectPresentation: async (presentationId) => {
    if (!presentationId) {
      set({ activePresentationId: null, activePresentation: null, activeSlideId: null, selectedElementId: null })
      return
    }
    if (presentationId === get().activePresentationId) return
    set({ activePresentationId: presentationId, isLoadingPresentation: true, activeSlideId: null, selectedElementId: null })
    try {
      const result = (await window.api.loadPresentationWithSlides(
        presentationId
      )) as PresentationWithSlides | null
      set({
        activePresentation: result ?? null,
        isLoadingPresentation: false,
        activeSlideId: result?.slides?.[0]?.id ?? null,
      })
    } catch {
      set({ activePresentation: null, isLoadingPresentation: false })
    }
  },

  reloadPresentation: async (presentationId) => {
    if (get().activePresentationId !== presentationId) return
    const result = (await window.api.loadPresentationWithSlides(
      presentationId
    )) as PresentationWithSlides | null
    if (!result) return
    set((s) => ({
      activePresentation: result,
      presentations: s.presentations.map((p) =>
        p.id === presentationId ? result.presentation : p
      ),
    }))
  },

  addSlide: async (presentationId) => {
    const current = get().activePresentation
    if (!current || current.presentation.id !== presentationId) return null
    const slide = createBlankSlide(presentationId, current.slides.length)
    await window.api.saveSlide(slide)
    set((s) => {
      if (!s.activePresentation || s.activePresentation.presentation.id !== presentationId) return s
      const slides = [...s.activePresentation.slides, slide]
      const presentation: PresentationMeta = {
        ...s.activePresentation.presentation,
        slideCount: slides.length,
        updatedAt: slide.updatedAt,
      }
      return {
        activePresentation: { presentation, slides },
        presentations: s.presentations.map((p) => (p.id === presentationId ? presentation : p)),
        activeSlideId: slide.id,
      }
    })
    return slide
  },

  updateSlide: async (slide) => {
    const updated: Slide = { ...slide, updatedAt: new Date().toISOString() }
    set((s) => {
      if (!s.activePresentation) return s
      return {
        activePresentation: {
          ...s.activePresentation,
          slides: s.activePresentation.slides.map((sl) => (sl.id === updated.id ? updated : sl)),
        },
      }
    })
    await window.api.saveSlide(updated)
  },

  updateSlideData: async (slideId, data) => {
    const current = get().activePresentation
    if (!current) return
    const slide = current.slides.find((sl) => sl.id === slideId)
    if (!slide) return
    const updated: Slide = { ...slide, data, updatedAt: new Date().toISOString() }
    set((s) =>
      s.activePresentation
        ? {
            activePresentation: {
              ...s.activePresentation,
              slides: s.activePresentation.slides.map((sl) => (sl.id === updated.id ? updated : sl)),
            },
          }
        : s
    )
    scheduleSlideSave(updated)
  },

  removeSlide: async (slideId, presentationId) => {
    set((s) => {
      if (!s.activePresentation || s.activePresentation.presentation.id !== presentationId) return s
      const slides = s.activePresentation.slides
        .filter((sl) => sl.id !== slideId)
        .map((sl, i) => ({ ...sl, sortOrder: i }))
      const presentation: PresentationMeta = {
        ...s.activePresentation.presentation,
        slideCount: slides.length,
      }
      const nextActiveSlideId =
        s.activeSlideId === slideId ? (slides[0]?.id ?? null) : s.activeSlideId
      return {
        activePresentation: { presentation, slides },
        presentations: s.presentations.map((p) => (p.id === presentationId ? presentation : p)),
        activeSlideId: nextActiveSlideId,
        selectedElementId: null,
      }
    })
    await window.api.removeSlide(slideId)
    const after = get().activePresentation
    if (after && after.presentation.id === presentationId) {
      await window.api.reorderSlides(
        presentationId,
        after.slides.map((sl) => sl.id)
      )
    }
  },

  reorderSlides: async (presentationId, orderedSlideIds) => {
    set((s) => {
      if (!s.activePresentation || s.activePresentation.presentation.id !== presentationId) return s
      const byId = new Map(s.activePresentation.slides.map((sl) => [sl.id, sl]))
      const slides = orderedSlideIds
        .map((id, i) => {
          const sl = byId.get(id)
          return sl ? { ...sl, sortOrder: i } : null
        })
        .filter((sl): sl is Slide => sl !== null)
      return { activePresentation: { ...s.activePresentation, slides } }
    })
    await window.api.reorderSlides(presentationId, orderedSlideIds)
  },

  replaceSlides: async (presentationId, inputs, title) => {
    const pres = get().activePresentation
    if (!pres || pres.presentation.id !== presentationId) return
    const now = new Date().toISOString()
    const oldIds = pres.slides.map((sl) => sl.id)
    const slides: Slide[] = inputs.map((input, i) => ({
      id: crypto.randomUUID(),
      presentationId,
      sortOrder: i,
      title: input.title ?? `Slide ${i + 1}`,
      notes: input.notes ?? '',
      data: input.data,
      createdAt: now,
      updatedAt: now,
    }))
    const presentation: PresentationMeta = {
      ...pres.presentation,
      slideCount: slides.length,
      title: title ?? pres.presentation.title,
      updatedAt: now,
    }
    set((s) => ({
      activePresentation: { presentation, slides },
      presentations: s.presentations.map((p) => (p.id === presentationId ? presentation : p)),
      activeSlideId: slides[0]?.id ?? null,
      selectedElementId: null,
    }))
    await window.api.savePresentation(presentation)
    for (const slide of slides) {
      await window.api.saveSlide(slide)
    }
    for (const oldId of oldIds) {
      await window.api.removeSlide(oldId)
    }
  },

  appendSlides: async (presentationId, inputs) => {
    const pres = get().activePresentation
    if (!pres || pres.presentation.id !== presentationId) return []
    const now = new Date().toISOString()
    const base = pres.slides.length
    const newSlides: Slide[] = inputs.map((input, i) => ({
      id: crypto.randomUUID(),
      presentationId,
      sortOrder: base + i,
      title: input.title ?? `Slide ${base + i + 1}`,
      notes: input.notes ?? '',
      data: input.data,
      createdAt: now,
      updatedAt: now,
    }))
    const slides = [...pres.slides, ...newSlides]
    const presentation: PresentationMeta = {
      ...pres.presentation,
      slideCount: slides.length,
      updatedAt: now,
    }
    set((s) => ({
      activePresentation: { presentation, slides },
      presentations: s.presentations.map((p) => (p.id === presentationId ? presentation : p)),
      activeSlideId: newSlides[0]?.id ?? s.activeSlideId,
    }))
    for (const slide of newSlides) {
      await window.api.saveSlide(slide)
    }
    return newSlides
  },

  selectSlide: (slideId) => {
    set({ activeSlideId: slideId, selectedElementId: null })
  },

  setSelectedElement: (elementId) => {
    set({ selectedElementId: elementId })
  },
}))
