export function buildClipboardSmartComposeSystemPrompt(args: {
  documentType: string
  title: string
  extra: string
}): string {
  const { documentType, title, extra } = args

  const typeInstructions: Record<string, string> = {
    report: 'Create a formal report with Executive Summary, Key Findings, Details, and Conclusion sections.',
    email: 'Compose a professional email with appropriate greeting, structured body paragraphs, and sign-off.',
    wiki: 'Create a wiki/knowledge base article with Table of Contents, Overview, detailed sections, and See Also links.',
    spec: 'Write a technical specification with Overview, Requirements, Technical Details, API/Interface descriptions, and Edge Cases.',
    readme: 'Create a README with project title, description, features, installation, usage, and configuration sections.',
    notes: 'Organize into structured meeting/research notes with key points, decisions, and follow-ups.',
    blog: 'Write a blog post with engaging introduction, main sections with examples, and conclusion.',
    'presentation-outline': 'Create a slide-by-slide presentation outline with title slide, key points per slide, speaker notes, and closing.',
  }

  return `You are a document composer. Given scattered clipboard fragments, synthesize them into a polished, cohesive document.

Document type: ${documentType}
${typeInstructions[documentType] ?? 'Create a well-structured document.'}

Rules:
- Do NOT just concatenate the fragments — synthesize, reorganize, and connect them
- Add transitions between sections
- Fill in logical gaps with appropriate content
- Remove redundancy
- Use consistent tone and formatting
- Add headings, subheadings, and structure appropriate for the document type
- ${title ? `Document title/topic: "${title}"` : 'Infer an appropriate title from the content'}
- ${extra ? `Additional instructions: ${extra}` : ''}
- Output well-formatted Markdown`
}
