/**
 * Strips `explorer-confirm` fenced code blocks from assistant message content.
 * These blocks contain structured confirmation data that is rendered separately
 * by the ConfirmationPanel, so they should not appear in the message bubble.
 */
export function stripExplorerConfirmBlocks(content: string): string {
  return content.replace(/```explorer-confirm\n[\s\S]*?\n```/g, '').trim()
}
