export const taskDescriptionStyles = {
  wrapper: 'select-text',
  // Compact markdown spacing for dense task surfaces (cards, timeline, hover cards).
  // Tightens the default article-like margins from the shared MarkdownRenderer.
  markdown:
    '[&_*:not(table):not(thead):not(tbody):not(tr):not(th):not(td)]:[overflow-wrap:anywhere] ' +
    '[&_p]:mb-0 [&_p:not(:first-child)]:mt-1 ' +
    '[&_ul]:my-1 [&_ol]:my-1 [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:my-0 ' +
    '[&_h1]:mt-1 [&_h1]:mb-0.5 [&_h2]:mt-1 [&_h2]:mb-0.5 [&_h3]:mt-0.5 [&_h3]:mb-0.5 ' +
    '[&_pre]:my-1 [&_blockquote]:my-1 [&_table]:my-1',
}
