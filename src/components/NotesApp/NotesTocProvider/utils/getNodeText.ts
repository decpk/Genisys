import type { Node } from '@tiptap/pm/model'

export function getNodeText(node: Node): string {
  return node.textBetween(0, node.content.size, '\n', ' ')
}
