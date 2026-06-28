export interface ImageLightboxProps {
  src: string
  fileName: string | null
  alt: string
  onLoad?: () => void
}
