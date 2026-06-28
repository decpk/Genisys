import type { BodyType } from '@/components/APIClient/APIClient.types'
import type { PostmanBody } from './postman.types'
import { isJsonText } from './isJsonText'

interface MappedBody {
  bodyType: BodyType
  bodyContent: string
}

/**
 * Map a Postman `raw` body. Treated as JSON when the declared language is
 * `json` or the content itself parses as JSON; otherwise plain `raw`.
 */
export function mapPostmanRawBody(body: PostmanBody): MappedBody {
  const content = body.raw ?? ''
  const language = body.options?.raw?.language

  if (language === 'json' || isJsonText(content)) {
    return { bodyType: 'json', bodyContent: content }
  }

  return { bodyType: 'raw', bodyContent: content }
}
