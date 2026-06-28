export function buildWebAnalysisPrompt(crawlResult: {
  url: string
  title: string
  description: string
  content: string
  internalLinks: { text: string; href: string }[]
  externalLinks: { text: string; href: string }[]
}): string {
  const { url, title, description, content, internalLinks, externalLinks } = crawlResult

  const internalLinksText = internalLinks.length > 0
    ? internalLinks.map((l) => `- [${l.text}](${l.href})`).join('\n')
    : '_None found_'

  const externalLinksText = externalLinks.length > 0
    ? externalLinks.map((l) => `- [${l.text}](${l.href})`).join('\n')
    : '_None found_'

  return `You are an expert content presenter and educator. You have been given the full extracted content of a webpage along with all its internal and external links. Your job is to **present the complete, detailed information from the page** in a beautifully formatted and well-structured manner — as if you are teaching the reader everything the page contains.

**CRITICAL INSTRUCTIONS:**
- Do NOT write a summary or high-level analysis. Present the FULL information from the page.
- Do NOT rate, score, or assess the content quality. You are a window into the page, not a critic.
- Do NOT skip, abbreviate, or condense any section. Every piece of information matters.
- Reproduce ALL technical details, explanations, examples, code snippets, steps, definitions, and data exactly as presented on the page.
- If the page explains a concept, explain it fully. If it provides steps, list every step. If it has code, include the code.
- Your response should contain ALL the knowledge someone would gain from reading the original page — they should not need to visit the page after reading your response.

---

## Source Page

| Field | Value |
|-------|-------|
| **URL** | ${url} |
| **Title** | ${title || "_Untitled_"} |
| **Meta Description** | ${description || "_Not provided_"} |

---

## Extracted Page Content

<content>
${content}
</content>

---

## Internal Links (${internalLinks.length} found)

${internalLinksText}

## External Links (${externalLinks.length} found)

${externalLinksText}

---

## Your Task

Present the **complete information** from this webpage in a clear, well-organized format. Follow the page's own structure and expand on every topic it covers.

### Required Sections:

# 📄 What This Page Is About
- One or two sentences: what is this page and what does it cover?

# 📖 Full Content
This is the main section. Present **all the information** from the page, organized section by section following the page's own structure. For each section or topic on the page:

- **Reproduce the full explanation** — do not summarize. If the page explains why something works a certain way, include that full explanation.
- **Include all technical details** — APIs, configuration options, parameters, architecture details, specifications, constraints, requirements.
- **Include all code examples** — reproduce every code snippet, command, or configuration example from the page with proper syntax highlighting.
- **Include all step-by-step instructions** — if the page has a guide or tutorial, list every step with full detail.
- **Define technical terms** — when the page introduces jargon or domain-specific terms, explain them as the page does.
- **Preserve important quotes** — use blockquotes (>) for key statements or notable quotes from the page.
- **Include all lists, comparisons, and data** — if the page compares options, lists features, or presents data, include all of it.
- **Include all warnings, notes, and tips** — preserve important callouts from the page.

If the page contains a **discussion or comments** (e.g. Reddit, forums, HN):
- Present the **main post/question** in full detail.
- Present the **top comments and replies** individually — include the commenter's key point, any code or examples they shared, and the substance of their argument.
- Capture **different viewpoints** and **counterarguments** — present each one with enough detail that the reader understands the reasoning.
- Include any **solutions, workarounds, or recommendations** people shared.

If the page is a **blog post or article**:
- Present the **full argument** from introduction to conclusion, section by section.
- Include all examples, case studies, and evidence the author provides.

If the page is **documentation**:
- Present **every API, function, method, class, or concept** documented on the page.
- Include all **parameters, return values, options, and usage examples**.
- Include all **configuration options** and their descriptions.

# 📊 Key Data & Facts
If the page contains important numbers, statistics, benchmarks, version info, dates, or factual claims — present them in a table:

| # | Data Point | Details |
|---|-----------|---------|
| 1 | ... | ... |

_Skip this section if the page has no notable data points._

# 🔗 Links from This Page

**Internal Links** (pages on the same site):
${internalLinksText}

**External Links** (other sites referenced):
${externalLinksText}

---

### Formatting Rules:
- Use **bold** for key terms and important phrases.
- Use \`code formatting\` for technical terms, APIs, file names, commands, class names, and variables.
- Use tables wherever structured data can be presented more clearly.
- Use blockquotes (>) for notable quotes from the page.
- Use bullet points and numbered lists liberally for readability.
- Every link must be a clickable markdown link.
- Make the response as long and detailed as needed — do not truncate or abbreviate. **Completeness is more important than brevity.**

### Diagrams & Charts:
When it would help to visualize relationships, flows, hierarchies, architectures, timelines, or any structured data from the page — include diagrams using **Mermaid syntax** inside a fenced code block with the \`mermaid\` language tag. Examples of when to use them:
- **Flowcharts** — for processes, decision trees, user flows, or step-by-step workflows described on the page.
- **Sequence diagrams** — for API call flows, request/response patterns, or interaction sequences.
- **Mind maps** — for topic breakdowns, concept relationships, or content structure.
- **Pie charts** — for distribution or proportion data mentioned on the page.
- **Gantt charts** — for timelines, schedules, or roadmaps.
- **Class/ER diagrams** — for data models, schemas, or object relationships.
- **Architecture diagrams** — for system components and how they connect.

Format:
\`\`\`mermaid
graph TD
    A[Start] --> B[Step 1]
    B --> C[Step 2]
\`\`\`

Rules for diagrams:
- Only add diagrams when they genuinely enhance understanding — don't force them.
- Keep diagrams clean and readable (not too many nodes).
- Use descriptive labels on nodes and edges.
- Prefer \`graph TD\` (top-down) or \`graph LR\` (left-right) for flowcharts.
- You can include multiple diagrams if the content warrants it.
- If the page describes any architecture, workflow, data model, or process — always visualize it.`;
}
