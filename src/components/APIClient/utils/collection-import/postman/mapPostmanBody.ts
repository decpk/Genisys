import type { BodyType } from '@/components/APIClient/APIClient.types'
import type { PostmanBody } from './postman.types'
import { serializeFormParams } from './serializeFormParams'
import { mapPostmanRawBody } from './mapPostmanRawBody'
import { mapPostmanGraphqlBody } from './mapPostmanGraphqlBody'

interface MappedBody {
  bodyType: BodyType
  bodyContent: string
}

const NONE_BODY: MappedBody = { bodyType: 'none', bodyContent: '' }

/**
 * Map a Postman request body onto the normalized `{ bodyType, bodyContent }`.
 * Unknown/empty bodies default gracefully to `none`.
 */
export function mapPostmanBody(body: PostmanBody | undefined): MappedBody {
  if (!body || !body.mode) return NONE_BODY

  if (body.mode === 'raw') return mapPostmanRawBody(body)
  if (body.mode === 'graphql') return mapPostmanGraphqlBody(body)
  if (body.mode === 'urlencoded') {
    return { bodyType: 'form-data', bodyContent: serializeFormParams(body.urlencoded) }
  }
  if (body.mode === 'formdata') {
    return { bodyType: 'form-data', bodyContent: serializeFormParams(body.formdata) }
  }

  return NONE_BODY
}
