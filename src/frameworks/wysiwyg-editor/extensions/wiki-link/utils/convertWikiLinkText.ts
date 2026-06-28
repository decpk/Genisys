import { replaceWikiLinksInTextNode } from './replaceWikiLinksInTextNode'

const WIKI_LINK_PATTERN = /\[\[[^\]\n]+?\]\]/

/**
 * Walk the parsed markdown DOM and convert any `[[Title]]` text into wikiLink
 * span elements. Skips `pre`/`code` regions and already-converted spans so
 * fenced code and existing links are left untouched. Invoked from the node's
 * `markdown.parse.updateDOM` hook (mirrors the diagram-block pattern).
 */
export function convertWikiLinkText(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node): number {
      const parent = (node as Text).parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (parent.closest('pre, code')) return NodeFilter.FILTER_REJECT
      if (parent.closest('span[data-type="wikiLink"]')) {
        return NodeFilter.FILTER_REJECT
      }
      return WIKI_LINK_PATTERN.test(node.nodeValue ?? '')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    },
  })

  const targets: Text[] = []
  let current = walker.nextNode()
  while (current) {
    targets.push(current as Text)
    current = walker.nextNode()
  }

  for (const textNode of targets) {
    replaceWikiLinksInTextNode(textNode)
  }
}
