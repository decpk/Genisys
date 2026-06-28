import type { SlideData, SlideElement } from '@/store/webpoint-store/types'

/** Return new slide data with the element of the same id replaced. */
export function replaceSlideElement(data: SlideData, element: SlideElement): SlideData {
  return {
    ...data,
    elements: data.elements.map((el) => (el.id === element.id ? element : el)),
  }
}
