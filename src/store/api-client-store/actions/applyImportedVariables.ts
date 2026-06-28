import type { ApiClientStore } from '../../api-client-store'
import type { NormalizedImportVariable } from '@/components/APIClient/utils/collection-import/collection-import.types'

/**
 * Creates a dedicated environment for the imported collection's variables
 * and adds each variable to it. Returns the number of variables created.
 * No environment is created when the collection has no variables.
 */
export async function applyImportedVariables(
  get: () => ApiClientStore,
  collectionName: string,
  variables: NormalizedImportVariable[]
): Promise<number> {
  if (variables.length === 0) return 0

  const env = await get().addEnvironment(`${collectionName} Variables`)

  let created = 0
  for (const variable of variables) {
    await get().addEnvironmentVariable(env.id, variable.key, variable.value)
    created++
  }

  return created
}
