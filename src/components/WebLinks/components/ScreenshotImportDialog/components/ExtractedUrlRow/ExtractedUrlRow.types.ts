/** Props for a single extracted-URL row. */
export interface ExtractedUrlRowProps {
  /** The extracted URL to display and act on. */
  url: string
  /** Open the URL in the default browser. */
  onOpen: (url: string) => void
  /** Save the URL into the collection. */
  onSave: (url: string) => void
}
