import type { BodyType } from '@/components/APIClient/APIClient.types'
import type { PostmanBody } from './postman.types'

interface MappedBody {
  bodyType: BodyType
  bodyContent: string
}

/**
 * Map a Postman `graphql` body into a JSON body containing the query and
 * its variables.
 */
export function mapPostmanGraphqlBody(body: PostmanBody): MappedBody {
  const graphql = body.graphql ?? {}
  const content = JSON.stringify({
    query: graphql.query ?? '',
    variables: graphql.variables ?? '',
  })

  return { bodyType: 'json', bodyContent: content }
}
