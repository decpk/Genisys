export function extractPlainText(markdown: string): string {
  let text = markdown

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '')
  text = text.replace(/`([^`]+)`/g, '$1')

  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')

  // Convert links to just the text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Remove headers markers
  text = text.replace(/^#{1,6}\s+/gm, '')

  // Remove bold/italic markers
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  text = text.replace(/\*([^*]+)\*/g, '$1')
  text = text.replace(/__([^_]+)__/g, '$1')
  text = text.replace(/_([^_]+)_/g, '$1')
  text = text.replace(/~~([^~]+)~~/g, '$1')

  // Remove blockquote markers
  text = text.replace(/^>\s+/gm, '')

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '')

  // Remove list markers
  text = text.replace(/^[\s]*[-*+]\s+/gm, '')
  text = text.replace(/^[\s]*\d+\.\s+/gm, '')

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '')

  // Collapse multiple newlines
  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}
