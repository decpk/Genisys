import type { BookLength } from '@/components/Library/book-prompt'

export const BOOK_LENGTH_INSTRUCTIONS: Record<BookLength, string> = {
  'micro': `BOOK LENGTH: MICRO (2 chapters)
- Generate exactly 2 chapters total.
- Target word count: 600–900 words per chapter (~1,200–1,800 total).
- Each chapter: brief Overview, 2–3 sections, one Practical Example, Summary.
- Skip Quiz, Bonus Deep Dive, Challenge, and Micro Quiz sections.
- Use when the topic is small or the reader wants a 5-minute primer.`,
  'one-pager': `BOOK LENGTH: ONE-PAGER
- Generate exactly 1 chapter that covers the entire topic in a single, concise overview.
- Target word count: 800–1,200 words per chapter.
- Include a brief overview, 3–5 key sections, one practical example, and a summary.
- Skip Quiz, Bonus Deep Dive, Challenge, and Micro Quiz sections.
- Focus on the most essential concepts only.`,
  'short': `BOOK LENGTH: SHORT (3–5 chapters)
- Generate 3–5 chapters total.
- Target word count: 1,000–2,000 words per chapter (~3,000–10,000 total).
- Include Overview, 4–6 sections, one Practical Example, a short Quiz (3–5 questions), and Chapter Summary.
- Skip Bonus Deep Dive, Challenge, and Micro Quiz sections.
- Cover core concepts without deep exploration.`,
  'medium': `BOOK LENGTH: MEDIUM (6–10 chapters)
- Generate 6–10 chapters total.
- Target word count: 2,000–3,500 words per chapter (~12,000–35,000 total).
- Include all sections: Overview, 6–8 sections, Practical Example, Challenge, Quiz (5–8 questions), Bonus Deep Dive, Micro Quiz, and Chapter Summary.
- Provide thorough coverage with good depth.`,
  'long': `BOOK LENGTH: LONG (11–20 chapters)
- Generate 11–20 chapters total.
- Target word count: 3,000–5,000 words per chapter (~33,000–100,000 total).
- Include all sections: Overview, 8–10 sections, Practical Example, Challenge, Quiz (5–8 questions), Bonus Deep Dive, Micro Quiz, and Chapter Summary.
- Provide comprehensive, in-depth coverage of every aspect of the topic.
- Include advanced topics, edge cases, and real-world patterns.`,
  'extended': `BOOK LENGTH: EXTENDED (21–30 chapters)
- Generate 21–30 chapters total.
- Target word count: 3,500–5,500 words per chapter (~75,000–165,000 total).
- Include all sections at full depth: Overview, 8–12 sections, Practical Example, Challenge, Quiz (6–10 questions), Bonus Deep Dive, Micro Quiz, and Chapter Summary.
- Treat the book as an authoritative learning path. Add chapters dedicated to ecosystem, tooling, performance, security, testing, and migration patterns where applicable.
- Include advanced topics, edge cases, real-world patterns, and a capstone-style final chapter.`,
  'definitive': `BOOK LENGTH: DEFINITIVE (31–50 chapters)
- Generate 31–50 chapters total.
- Target word count: 4,000–6,000 words per chapter (~125,000–300,000 total).
- Include all sections at maximum depth, plus periodic "Part" recap chapters that synthesize prior chapters.
- Treat the book as a reference-grade volume. Cover history, theory, internals, every major feature, anti-patterns, performance, scalability, ecosystem, and case studies.
- Add cross-referenced indexes between chapters where concepts repeat.
- Include advanced topics, edge cases, expert insights, and real-world production patterns.`,
  'article-tldr': `ARTICLE LENGTH: TL;DR EXPLAINER
- Generate exactly 1 chapter that delivers the gist of the topic in under 2 minutes of reading.
- Target word count: 250–450 words.
- Structure: One-line definition → 3 bullet "Key Points" → 1 short example or analogy → Key Takeaway.
- Skip Quiz, Bonus Deep Dive, Challenge, Micro Quiz, and Chapter Summary sections.
- Maximum clarity, minimum prose. Treat it like a great Stack Overflow accepted-answer summary.`,
  'article-simple-short': `ARTICLE LENGTH: SIMPLE SHORT EXPLANATION
- Generate exactly 1 chapter that provides a clear, concise explanation of the topic.
- Target word count: 500–800 words.
- Structure: Introduction → 3–4 Key Points (each with a brief explanation) → Quick Practical Example → Key Takeaway.
- Use simple language, analogies, and relatable comparisons.
- Skip Quiz, Bonus Deep Dive, Challenge, Micro Quiz, and Chapter Summary sections.
- Focus on making the reader "get it" fast — clarity over depth.`,
  'article-simple-long': `ARTICLE LENGTH: SIMPLE LONG EXPLANATION
- Generate exactly 1 chapter that provides an accessible but thorough explanation.
- Target word count: 1,500–2,500 words.
- Structure: Introduction → Context/Background → Core Explanation (5–6 sections) → 2–3 Practical Examples → Summary & Next Steps.
- Use clear language with analogies. Build understanding progressively.
- Include a brief Quiz (3–4 questions) and a Summary section.
- Skip Bonus Deep Dive, Challenge, and Micro Quiz sections.
- Balance accessibility with completeness — the reader should feel confident in the topic.`,
  'article-tutorial': `ARTICLE LENGTH: STEP-BY-STEP TUTORIAL
- Generate exactly 1 chapter that walks the reader through a hands-on tutorial.
- Target word count: 2,000–3,500 words.
- Structure: Introduction (what we'll build, why, prerequisites) → Setup → Numbered Steps (each with code, expected output, and "What just happened?" explainer) → Recap → Common pitfalls → Next steps.
- Every step MUST include runnable code with language-tagged code blocks.
- Include a short Quiz (3–5 questions) and a Practical Example block recapping the final result.
- Skip Bonus Deep Dive, Challenge, and Micro Quiz sections.
- Tone: friendly mentor at a whiteboard. Assume the reader will follow along, so be precise and unambiguous.`,
  'article-in-depth': `ARTICLE LENGTH: LONG & IN-DEPTH EXPLANATION
- Generate exactly 1 chapter that is a comprehensive deep-dive into the topic.
- Target word count: 3,000–5,000 words.
- Structure: Introduction → Background & History → Detailed Analysis (8–10 sections) → Advanced Considerations & Edge Cases → Real-World Examples & Case Studies → Conclusion & Further Reading.
- Include all sections: Practical Examples, Challenge (easy + medium tiers), Quiz (5–8 questions), Bonus Deep Dive, and Chapter Summary.
- Cover the topic exhaustively — history, theory, practice, pitfalls, and expert insights.
- Use <lib-callout> blocks (variants did-you-know, try-this, analogy) for engagement.`,
  'webpage-match': `BOOK LENGTH: WEBPAGE-MATCH (mirrors the source page)
- The number of chapters MUST match the natural top-level section structure of the SOURCE MATERIAL provided below.
- Walk the source from top to bottom. Each major heading (H1/H2 — whichever is the page's primary outline level) becomes ONE chapter.
- Chapter order MUST follow the exact order of the source page. Do NOT reorder, merge, or skip sections.
- Target word count per chapter: scale with the source — short source sections (~300 words on the page) become ~1,200-word chapters; long sections (~1,500 words on the page) become ~3,500-word chapters.
- Each chapter expands the source section into a teachable lesson: Overview, 3–6 sections, Practical Example, short Quiz (3–5 Q), and Chapter Summary.
- If the source has fewer than 3 sections, fall back to 3 chapters (Intro → Body → Wrap-up). If it has more than 25, group adjacent sub-sections into 25 chapters max while preserving order.
- Cite the original section title in each chapter's Overview (e.g., "This chapter expands the source's '<Section Title>' section.").`,
  'webpage-condensed': `BOOK LENGTH: WEBPAGE-CONDENSED (5–7 chapters)
- Generate 5–7 chapters total, distilled from the SOURCE MATERIAL provided below.
- Group adjacent sections of the source into thematic chapters. Preserve the original top-to-bottom order of ideas — never reorder.
- Target word count: 1,500–2,500 words per chapter.
- Each chapter: Overview, 4–6 sections, Practical Example, Quiz (3–5 Q), Chapter Summary.
- Skip Bonus Deep Dive, Challenge, and Micro Quiz sections.
- Use this length when the source page is dense and the reader wants a structured digest.`,
  'webpage-expanded': `BOOK LENGTH: WEBPAGE-EXPANDED (1 chapter per source section, with extra depth)
- Generate ONE chapter for EACH top-level section of the SOURCE MATERIAL provided below, in the SAME order as the source.
- Target word count: 2,500–4,000 words per chapter.
- Each chapter expands beyond the source's coverage: include Overview, 6–8 sections, Practical Example, Challenge (easy + medium tiers), Quiz (5–8 Q), Bonus Deep Dive, Micro Quiz, and Chapter Summary.
- Use the source as the spine — start each chapter from the source's section, then add real-world context, edge cases, and supporting examples the source did not include.
- Cite the original section title in each chapter's Overview.
- Cap at 25 chapters; if the source has more sections, group the smallest adjacent ones to fit.`,
}
