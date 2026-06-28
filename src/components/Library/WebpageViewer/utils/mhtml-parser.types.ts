export interface MhtmlResource {
  contentType: string
  contentLocation: string
  data: string
}

export interface ParsedMhtml {
  html: string
  resources: MhtmlResource[]
}
