/**
 * Parse half of the markdown round-trip. `tiptap-markdown` renders a
 * ```<language> fence (via markdown-it) into `<pre><code class="language-…">`
 * before ProseMirror parses the HTML. This `parse.updateDOM` helper rewrites
 * those `<pre>` blocks into `<div data-…-block data-source="…">` so the custom
 * atom node's `parseHTML` claims them instead of `CodeBlockLowlight`. Running
 * here (pre-ProseMirror-parse) is what lets the fence reconstruct as a LIVE
 * node rather than an editable code block.
 */
export function convertFenceToBlock(
  element: HTMLElement,
  language: string,
  blockAttr: string,
): void {
  const matches = element.querySelectorAll(`pre > code.language-${language}`)
  matches.forEach((code) => {
    const pre = code.parentElement
    if (!pre) return
    const source = (code.textContent ?? '').replace(/\n$/, '')
    const div = element.ownerDocument.createElement('div')
    div.setAttribute(blockAttr, '')
    div.setAttribute('data-source', source)
    pre.replaceWith(div)
  })
}
