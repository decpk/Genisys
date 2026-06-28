export const MERMAID_FONT_FAMILY = 'IBM Plex Sans Variable, system-ui, sans-serif'
export const MERMAID_FONT_SIZE = 14

export const ZOOM_LIMITS = {
  min: 0.25,
  max: 10,
} as const

export const ZOOM_STEP = {
  wheel: 0.1,
  button: 0.25,
} as const

export const COPY_FEEDBACK_DURATION_MS = 2000

export const DOWNLOAD_FILENAME = 'diagram.svg'
export const DOWNLOAD_MIME_TYPE = 'image/svg+xml'
