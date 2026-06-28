import type {
  PostmanUrlEncodedParam,
  PostmanFormDataParam,
} from './postman.types'
import { isFileFormParam } from './isFileFormParam'

/**
 * Serialize Postman urlencoded/formdata params into a JSON string of
 * `{ key, value }` pairs, skipping disabled and file-type entries.
 */
export function serializeFormParams(
  params: Array<PostmanUrlEncodedParam | PostmanFormDataParam> | undefined,
): string {
  if (!Array.isArray(params)) return ''

  const pairs: Array<{ key: string; value: string }> = []

  for (const param of params) {
    if (param?.disabled === true) continue
    if (isFileFormParam(param)) continue

    const key = param?.key ?? ''
    if (!key) continue

    pairs.push({ key, value: param?.value ?? '' })
  }

  if (pairs.length === 0) return ''
  return JSON.stringify(pairs)
}
