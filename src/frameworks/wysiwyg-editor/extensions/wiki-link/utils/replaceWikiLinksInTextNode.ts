/**
 * Replace every `[[Title]]` occurrence inside a single DOM text node with a
 * `<span data-type="wikiLink" data-label="Title">` element so ProseMirror's
 * `parseHTML` turns them into `wikiLink` nodes when loading markdown.
 */
export function replaceWikiLinksInTextNode(textNode: Text): void {
  const text = textNode.nodeValue ?? ''
  const re = /\[\[([^\]\n]+?)\]\]/g

  let match: RegExpExecArray | null
  let lastIndex = 0
  let found = false
  const fragment = document.createDocumentFragment()

  while ((match = re.exec(text)) !== null) {
    found = true
    const [full, rawLabel] = match
    if (match.index > lastIndex) {
      fragment.appendChild(
        document.createTextNode(text.slice(lastIndex, match.index)),
      )
    }
    const span = document.createElement('span')
    span.setAttribute('data-type', 'wikiLink')
    span.setAttribute('data-label', rawLabel.trim())
    span.textContent = full
    fragment.appendChild(span)
    lastIndex = match.index + full.length
  }

  if (!found) return

  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)))
  }
  textNode.parentNode?.replaceChild(fragment, textNode)
}
