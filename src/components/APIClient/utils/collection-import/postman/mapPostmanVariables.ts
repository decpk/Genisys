import type { NormalizedImportVariable } from '@/components/APIClient/utils/collection-import/collection-import.types'
import type { PostmanVariable } from './postman.types'

/**
 * Map collection-level Postman variables to normalized variables,
 * skipping disabled entries. `{{var}}` placeholders inside values
 * are preserved literally.
 */
export function mapPostmanVariables(
  variables: PostmanVariable[] | undefined,
): NormalizedImportVariable[] {
  if (!Array.isArray(variables)) return []

  const result: NormalizedImportVariable[] = []

  for (const variable of variables) {
    if (variable?.disabled === true) continue

    const key = variable?.key ?? ''
    if (!key) continue

    result.push({
      key,
      value: variable?.value ?? '',
    })
  }

  return result
}
