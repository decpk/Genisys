import type {
  PostmanUrlEncodedParam,
  PostmanFormDataParam,
} from './postman.types'

/**
 * Return true when a Postman form param represents a file upload,
 * which cannot be serialized as a plain text key/value pair.
 */
export function isFileFormParam(
  param: PostmanUrlEncodedParam | PostmanFormDataParam,
): boolean {
  return 'type' in param && (param as PostmanFormDataParam).type === 'file'
}
