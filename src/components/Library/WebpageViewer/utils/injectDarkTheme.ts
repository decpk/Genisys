export interface ThemeOverride {
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  card: string
  cardForeground: string
  isDark?: boolean
}

/**
 * Inject CSS overrides so the saved webpage adopts the app's current theme
 * colours for background, text, borders, and cards — while keeping images
 * untouched.
 */
export function injectThemeOverride(html: string, theme: ThemeOverride): string {
  const colorScheme = theme.isDark ? 'dark' : 'light'
  const css = `
    <style data-genisys-theme="override">
      :root {
        color-scheme: ${colorScheme};
      }
      html, body {
        background-color: ${theme.background} !important;
        color: ${theme.foreground} !important;
      }
      /* Override common container / card backgrounds */
      main, article, section, aside, nav, header, footer,
      div, ul, ol, li, table, thead, tbody, tr, th, td,
      details, summary, figure, figcaption, blockquote, pre,
      .post, .content, .container, .wrapper, .page, .entry,
      [class*="card"], [class*="Card"],
      [class*="panel"], [class*="Panel"],
      [class*="section"], [class*="Section"],
      [class*="block"], [class*="Block"],
      [class*="box"], [class*="Box"],
      [class*="item"], [class*="Item"],
      [class*="widget"], [class*="Widget"] {
        background-color: inherit !important;
        color: inherit !important;
      }
      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        color: ${theme.foreground} !important;
      }
      /* Paragraphs, spans, labels */
      p, span, label, small, strong, em, b, i, u, s,
      a, li, dt, dd, figcaption, cite, q {
        color: inherit !important;
      }
      /* Links keep a visible accent colour */
      a {
        color: ${theme.mutedForeground} !important;
        text-decoration-color: ${theme.border} !important;
      }
      a:hover {
        color: ${theme.foreground} !important;
      }
      /* Code / pre */
      pre, code, kbd, samp {
        background-color: ${theme.muted} !important;
        color: ${theme.foreground} !important;
        border-color: ${theme.border} !important;
      }
      /* Borders */
      hr {
        border-color: ${theme.border} !important;
      }
      table, th, td {
        border-color: ${theme.border} !important;
      }
      /* Form elements */
      input, textarea, select, button {
        background-color: ${theme.card} !important;
        color: ${theme.cardForeground} !important;
        border-color: ${theme.border} !important;
      }
      /* Blockquotes */
      blockquote {
        border-left-color: ${theme.border} !important;
        color: ${theme.mutedForeground} !important;
      }
      /* Ensure images / media stay untouched */
      img, video, picture, canvas, svg, iframe {
        filter: none !important;
      }
    </style>
  `

  if (html.includes('</head>')) {
    return html.replace('</head>', `${css}</head>`)
  }
  if (html.includes('</body>')) {
    return html.replace('</body>', `${css}</body>`)
  }
  return html + css
}
