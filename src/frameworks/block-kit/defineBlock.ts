import type { BlockDefinition, BlockDefinitionInput } from './types'
import { assertHyphenatedTag } from './utils/assertHyphenatedTag'

/**
 * Declare a custom block. Applies defaults and validates the tag. The returned
 * definition is registered into a `BlockRegistry` via `createBlockRegistry`.
 */
export function defineBlock(input: BlockDefinitionInput): BlockDefinition {
  assertHyphenatedTag(input.tag)
  return {
    attributes: [],
    childrenContent: 'markdown',
    ...input,
  }
}
