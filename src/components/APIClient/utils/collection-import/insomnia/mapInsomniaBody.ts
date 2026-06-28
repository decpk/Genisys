import type { BodyType } from '../../../APIClient.types'
import type { InsomniaBody } from './insomnia.types'

/**
 * Map an Insomnia request body to a normalized body type and content.
 * Form bodies are serialized as JSON of {key,value} pairs so the
 * downstream form-data editor can rehydrate them.
 */
export function mapInsomniaBody(
  body: InsomniaBody | undefined
): { bodyType: BodyType; bodyContent: string } {
  const mimeType = (body?.mimeType ?? '').toLowerCase()

  if (mimeType.includes('application/json')) {
    return { bodyType: 'json', bodyContent: body?.text ?? '' }
  }

  if (mimeType.includes('application/xml') || mimeType.includes('text/xml')) {
    return { bodyType: 'xml', bodyContent: body?.text ?? '' }
  }

  if (isFormMimeType(mimeType)) {
    return { bodyType: 'form-data', bodyContent: serializeFormParams(body) }
  }

  if (body?.text) {
    return { bodyType: 'raw', bodyContent: body.text }
  }

  return { bodyType: 'none', bodyContent: '' }
}

function isFormMimeType(mimeType: string): boolean {
  return (
    mimeType.includes('application/x-www-form-urlencoded') ||
    mimeType.includes('multipart/form-data')
  )
}

function serializeFormParams(body: InsomniaBody | undefined): string {
  const pairs = (body?.params ?? []).map((param) => ({
    key: param.name ?? '',
    value: param.value ?? '',
  }))
  return JSON.stringify(pairs)
}
