// WebPoint slide data model.
//
// Coordinates (`x`, `y`, `w`, `h`) are percentages (0–100) of the slide canvas,
// so a slide scales responsively to any container size. `fontSize` and other
// pixel measurements are expressed against the base 1280×720 canvas and scaled
// by the renderer. Backgrounds are solid colours or gradients only (no images).

export interface GradientStop {
  /** CSS colour value. */
  color: string
  /** Stop position along the gradient, 0–100. */
  position: number
}

export interface GradientSpec {
  kind: 'linear' | 'radial'
  /** Angle in degrees for linear gradients (ignored for radial). */
  angle: number
  stops: GradientStop[]
}

export type SlideBackground =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; gradient: GradientSpec }

export type ElementAnimationType =
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom'
  | 'bounce'

export interface ElementAnimation {
  type: ElementAnimationType
  /** Duration in milliseconds. */
  duration: number
  /** Delay before the animation starts, in milliseconds. */
  delay: number
}

export type TextAlign = 'left' | 'center' | 'right'

export interface TextStyle {
  color: string
  /** Pixel size against the base 1280×720 canvas. */
  fontSize: number
  fontFamily: string
  fontWeight: number
  fontStyle: 'normal' | 'italic'
  textAlign: TextAlign
  lineHeight: number
  letterSpacing: number
  backgroundColor?: string
}

export interface ShapeStyle {
  fill: string
  stroke?: string
  strokeWidth?: number
  borderRadius?: number
  opacity?: number
}

export interface ImageStyle {
  borderRadius?: number
  opacity?: number
  objectFit?: 'cover' | 'contain' | 'fill'
}

export type SlideElementType = 'text' | 'shape' | 'image'

export interface SlideElementBase {
  id: string
  type: SlideElementType
  /** Position/size as percentages (0–100) of the slide canvas. */
  x: number
  y: number
  w: number
  h: number
  rotation?: number
  zIndex?: number
  animation?: ElementAnimation
}

export interface TextElement extends SlideElementBase {
  type: 'text'
  content: string
  style: TextStyle
}

export type ShapeKind = 'rectangle' | 'ellipse' | 'line'

export interface ShapeElement extends SlideElementBase {
  type: 'shape'
  shape: ShapeKind
  style: ShapeStyle
}

export interface ImageElement extends SlideElementBase {
  type: 'image'
  /** Data URL or other self-contained source (no remote fetch in the sandbox). */
  src: string
  style: ImageStyle
}

export type SlideElement = TextElement | ShapeElement | ImageElement

export type SlideTransition = 'none' | 'fade' | 'slide' | 'zoom' | 'flip'

export interface SlideData {
  background: SlideBackground
  elements: SlideElement[]
  transition: SlideTransition
  /** Optional advanced escape hatch: extra CSS injected into the compiled slide. */
  customCss?: string
  /** Optional advanced escape hatch: JS executed inside the sandboxed slide frame. */
  customJs?: string
}

export interface Slide {
  id: string
  presentationId: string
  sortOrder: number
  title: string
  /** Speaker notes shown in present mode's presenter view. */
  notes: string
  data: SlideData
  createdAt: string
  updatedAt: string
}

export interface PresentationMeta {
  id: string
  title: string
  description: string
  slideCount: number
  theme: string
  createdAt: string
  updatedAt: string
}

export interface PresentationWithSlides {
  presentation: PresentationMeta
  slides: Slide[]
}

/** Loose slide shape used when applying AI-generated decks (ids are assigned by the store). */
export interface SlideInput {
  title?: string
  notes?: string
  data: SlideData
}
