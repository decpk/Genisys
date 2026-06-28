import type { ExportFormat, ExportOptions } from '../types'
import {
  splitContentIntoSegments,
  type QuizQuestion,
  type QuizSegment,
} from '../../quiz-parser'
import { inlineCachedImagesInMarkdown } from '../../utils/inlineCachedImagesInMarkdown'

// ─── Styles for the self-contained HTML book ────────────────────

const HTML_STYLES = /* css */ `
  :root {
    --bg: #ffffff;
    --bg-secondary: #f8f9fa;
    --text: #222222;
    --text-muted: #555555;
    --text-subtle: #888888;
    --border: #e0e0e0;
    --primary: #2563eb;
    --primary-hover: #1d4ed8;
    --success: #16a34a;
    --error: #dc2626;
    --code-bg: #f5f5f5;
    --blockquote-border: #bbb;
    --shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  [data-theme="dark"] {
    --bg: #1a1a2e;
    --bg-secondary: #16213e;
    --text: #e0e0e0;
    --text-muted: #a0a0a0;
    --text-subtle: #777;
    --border: #333;
    --primary: #60a5fa;
    --primary-hover: #3b82f6;
    --success: #4ade80;
    --error: #f87171;
    --code-bg: #0f1729;
    --blockquote-border: #555;
    --shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html { overflow-x: hidden; }

  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 16px;
    line-height: 1.8;
    color: var(--text);
    background: var(--bg);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* ── Layout ── */
  .book-wrapper {
    display: flex;
    min-height: 100vh;
  }

  /* ── Sidebar / TOC ── */
  .book-sidebar {
    position: fixed;
    top: 44px;
    left: 0;
    width: 280px;
    height: calc(100vh - 44px);
    overflow-y: auto;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    padding: 16px 0;
    z-index: 100;
    transition: transform 0.3s ease;
  }

  .book-sidebar.collapsed {
    transform: translateX(-280px);
  }

  .sidebar-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    padding: 0 20px 16px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 8px;
  }

  .sidebar-nav a {
    display: block;
    padding: 8px 20px;
    font-size: 13px;
    color: var(--text-muted);
    text-decoration: none;
    border-left: 3px solid transparent;
    transition: all 0.15s ease;
    line-height: 1.4;
  }

  .sidebar-nav a:hover {
    background: var(--bg);
    color: var(--text);
  }

  .sidebar-nav a.active {
    color: var(--primary);
    border-left-color: var(--primary);
    font-weight: 600;
    background: var(--bg);
  }

  .sidebar-nav .chapter-sections a {
    padding-left: 36px;
    font-size: 12px;
    opacity: 0.85;
  }

  /* ── Toggle sidebar button ── */
  .sidebar-toggle {
    position: fixed;
    top: 8px;
    left: 16px;
    z-index: 200;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 16px;
    color: var(--text-muted);
    box-shadow: var(--shadow);
    transition: all 0.2s;
  }

  .sidebar-toggle:hover {
    color: var(--text);
    background: var(--bg);
  }

  .sidebar-open .sidebar-toggle { left: 296px; }

  /* ── Main content ── */
  .book-content {
    margin-left: 280px;
    padding: 60px 64px 80px;
    transition: margin-left 0.3s ease;
    overflow-x: hidden;
    min-width: 0;
  }

  .sidebar-collapsed .book-content {
    margin-left: 0;
    padding: 60px 80px 80px;
  }

  /* ── Width modes ── */
  .book-content-inner {
    max-width: none;
    margin: 0 auto;
    transition: max-width 0.3s ease;
    overflow-wrap: break-word;
    word-break: break-word;
    min-width: 0;
  }
  .width-narrow .book-content-inner { max-width: 640px; }
  .width-medium .book-content-inner { max-width: 900px; }
  .width-wide .book-content-inner { max-width: 1200px; }
  .width-full-inset .book-content-inner { max-width: none; padding-left: 24px; padding-right: 24px; }
  .width-full .book-content-inner { max-width: none; }

  /* ── Cover page ── */
  .book-cover {
    text-align: center;
    padding: 120px 20px 80px;
    border-bottom: 2px solid var(--border);
    margin-bottom: 48px;
  }

  .book-cover h1 {
    font-size: 36px;
    color: var(--text);
    margin-bottom: 16px;
    letter-spacing: -0.5px;
  }

  .book-cover .subtitle {
    font-size: 17px;
    color: var(--text-muted);
    max-width: 720px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .book-cover .meta {
    margin-top: 24px;
    font-size: 13px;
    color: var(--text-subtle);
  }

  /* ── Chapter wrapper ── */
  .chapter {
    margin-bottom: 64px;
    padding-bottom: 48px;
    border-bottom: 1px solid var(--border);
  }

  .chapter:last-child {
    border-bottom: none;
  }

  .chapter-header {
    margin-bottom: 28px;
  }

  .chapter-header h1 {
    font-size: 28px;
    color: var(--text);
    margin-bottom: 4px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border);
    line-height: 1.3;
  }

  /* ── Headings ── */
  h2 { font-size: 22px; margin-top: 32px; margin-bottom: 14px; color: var(--text); }
  h3 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; color: var(--text); }
  h4, h5, h6 { font-size: 15px; margin-top: 18px; margin-bottom: 10px; color: var(--text-muted); }

  /* ── Text ── */
  p { margin-bottom: 14px; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  a { color: var(--primary); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* ── Code ── */
  pre {
    background: var(--code-bg);
    padding: 16px 18px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.55;
    margin: 16px 0;
    border: 1px solid var(--border);
    position: relative;
    max-width: 100%;
    white-space: pre;
    word-break: normal;
    overflow-wrap: normal;
  }

  pre .copy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 11px;
    color: var(--text-muted);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s;
  }

  pre:hover .copy-btn { opacity: 1; }
  pre .copy-btn:hover { color: var(--text); background: var(--bg); }

  pre .lang-badge {
    position: absolute;
    top: 8px;
    left: 12px;
    font-size: 10px;
    color: var(--text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: system-ui, sans-serif;
  }

  pre.has-badge { padding-top: 32px; }

  code {
    font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
    font-size: 13px;
  }
  :not(pre) > code {
    background: var(--code-bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    border: 1px solid var(--border);
  }

  /* ── Tables ── */
  .table-wrapper { overflow-x: auto; margin: 16px 0; max-width: 100%; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; table-layout: auto; }
  th, td { border: 1px solid var(--border); padding: 10px 14px; text-align: left; word-break: break-word; }
  th { background: var(--bg-secondary); font-weight: 600; }

  /* ── Blockquotes ── */
  blockquote {
    border-left: 3px solid var(--blockquote-border);
    padding: 12px 18px;
    margin: 16px 0;
    color: var(--text-muted);
    font-style: italic;
    background: var(--bg-secondary);
    border-radius: 0 6px 6px 0;
  }

  /* ── Lists ── */
  ul, ol { padding-left: 28px; margin-bottom: 14px; }
  li { margin-bottom: 6px; }

  /* ── Misc ── */
  img { max-width: 100%; height: auto; border-radius: 6px; cursor: zoom-in; transition: opacity 0.3s; }
  hr { border: none; border-top: 1px solid var(--border); margin: 28px 0; }

  /* ── Image figure ── */
  figure {
    margin: 24px 0;
    position: relative;
  }

  figure img {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: var(--shadow);
  }

  figcaption {
    text-align: center;
    font-size: 13px;
    color: var(--text-subtle);
    margin-top: 10px;
    font-style: italic;
    line-height: 1.5;
  }

  /* ── Image lightbox ── */
  .lightbox-overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(8px);
    align-items: center;
    justify-content: center;
    padding: 32px;
    cursor: zoom-out;
  }

  .lightbox-overlay.active { display: flex; }

  .lightbox-overlay img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    cursor: default;
  }

  .lightbox-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(255,255,255,0.1);
    border: none;
    color: rgba(255,255,255,0.7);
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .lightbox-close:hover { background: rgba(255,255,255,0.2); color: white; }

  .lightbox-caption {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 600px;
    text-align: center;
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(8px);
    padding: 8px 16px;
    border-radius: 8px;
  }

  /* ── Callout blocks ── */
  .callout {
    margin: 20px 0;
    padding: 14px 18px;
    border-radius: 10px;
    border: 1px solid;
  }

  .callout-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: system-ui, sans-serif;
  }

  .callout-body {
    font-size: 15px;
    line-height: 1.7;
    color: var(--text);
  }

  .callout-body code {
    font-size: 13px;
  }

  .callout.did-you-know {
    background: color-mix(in srgb, #f59e0b 6%, transparent);
    border-color: color-mix(in srgb, #f59e0b 25%, transparent);
  }
  .callout.did-you-know .callout-header { color: #d97706; }

  .callout.try-this {
    background: color-mix(in srgb, #3b82f6 6%, transparent);
    border-color: color-mix(in srgb, #3b82f6 25%, transparent);
  }
  .callout.try-this .callout-header { color: #2563eb; }

  .callout.war-story {
    background: color-mix(in srgb, #ef4444 6%, transparent);
    border-color: color-mix(in srgb, #ef4444 25%, transparent);
  }
  .callout.war-story .callout-header { color: #dc2626; }

  .callout.analogy {
    background: color-mix(in srgb, #8b5cf6 6%, transparent);
    border-color: color-mix(in srgb, #8b5cf6 25%, transparent);
  }
  .callout.analogy .callout-header { color: #7c3aed; }

  .callout.challenge-hint {
    background: color-mix(in srgb, #10b981 6%, transparent);
    border-color: color-mix(in srgb, #10b981 25%, transparent);
  }
  .callout.challenge-hint .callout-header { color: #059669; }

  @media (prefers-color-scheme: dark) {
    .callout.did-you-know .callout-header { color: #fbbf24; }
    .callout.try-this .callout-header { color: #60a5fa; }
    .callout.war-story .callout-header { color: #f87171; }
    .callout.analogy .callout-header { color: #a78bfa; }
    .callout.challenge-hint .callout-header { color: #34d399; }
  }

  /* ── Challenge section ── */
  .challenge-section {
    margin: 28px 0;
    padding: 24px;
    background: var(--bg-secondary);
    border-radius: 10px;
    border: 1px solid var(--border);
  }

  .challenge-section h2 {
    font-size: 20px;
    margin-top: 0;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .challenge-section h2::before { content: "⚔️"; }

  .challenge-card {
    background: var(--bg);
    border-radius: 10px;
    margin-bottom: 16px;
    border: 1px solid var(--border);
    overflow: hidden;
  }

  .challenge-card:last-child { margin-bottom: 0; }

  .challenge-header {
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .challenge-emoji { font-size: 18px; line-height: 1; }

  .challenge-tier {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: system-ui, sans-serif;
  }

  .challenge-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
  }

  .tier-easy .challenge-tier { color: #16a34a; }
  .tier-medium .challenge-tier { color: #d97706; }
  .tier-hard .challenge-tier { color: #dc2626; }
  .tier-boss .challenge-tier { color: #7c3aed; }

  .tier-easy { border-color: color-mix(in srgb, #16a34a 20%, var(--border)); }
  .tier-medium { border-color: color-mix(in srgb, #d97706 20%, var(--border)); }
  .tier-hard { border-color: color-mix(in srgb, #dc2626 20%, var(--border)); }
  .tier-boss { border-color: color-mix(in srgb, #7c3aed 20%, var(--border)); }

  .challenge-body {
    padding: 0 18px 14px;
    font-size: 14px;
    line-height: 1.7;
  }

  .challenge-body pre { margin: 12px 0; }

  /* details / summary (for challenge solutions) */
  details {
    border-top: 1px solid var(--border);
  }

  details summary {
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    user-select: none;
    font-family: system-ui, sans-serif;
    transition: color 0.15s;
  }

  details summary:hover { color: var(--text); }

  details[open] summary { border-bottom: 1px solid var(--border); }

  details > div, details > p, details > pre {
    padding: 14px 18px;
  }

  /* ── Quiz Section ── */
  .quiz-section {
    margin: 28px 0;
    padding: 24px;
    background: var(--bg-secondary);
    border-radius: 10px;
    border: 1px solid var(--border);
  }

  .quiz-section h2 {
    font-size: 20px;
    margin-top: 0;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .quiz-section h2::before { content: "📝"; }

  .quiz-question {
    background: var(--bg);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    border: 1px solid var(--border);
  }

  .quiz-question:last-child { margin-bottom: 0; }

  .quiz-question-text {
    font-weight: 600;
    margin-bottom: 14px;
    font-size: 15px;
    line-height: 1.5;
  }

  .quiz-question-text code {
    font-size: 13px;
  }

  .quiz-question-text pre {
    margin-top: 10px;
  }

  .quiz-options { list-style: none; padding: 0; margin: 0 0 14px; }

  .quiz-option {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
    margin-bottom: 6px;
    border-radius: 6px;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 14px;
    user-select: none;
  }

  .quiz-option:hover:not(.revealed) {
    background: var(--bg-secondary);
    border-color: var(--primary);
  }

  .quiz-option.selected:not(.revealed) {
    background: color-mix(in srgb, var(--primary) 8%, transparent);
    border-color: var(--primary);
  }

  .quiz-option .indicator {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border);
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
    font-size: 12px;
    transition: all 0.15s;
  }

  .quiz-option.selected .indicator {
    border-color: var(--primary);
    background: var(--primary);
    color: white;
  }

  .quiz-option.multi-select .indicator { border-radius: 4px; }

  /* Revealed states */
  .quiz-option.revealed.correct {
    background: color-mix(in srgb, var(--success) 10%, transparent);
    border-color: var(--success);
  }

  .quiz-option.revealed.correct .indicator {
    border-color: var(--success);
    background: var(--success);
    color: white;
  }

  .quiz-option.revealed.incorrect.selected {
    background: color-mix(in srgb, var(--error) 10%, transparent);
    border-color: var(--error);
  }

  .quiz-option.revealed.incorrect.selected .indicator {
    border-color: var(--error);
    background: var(--error);
    color: white;
  }

  .quiz-option.revealed { cursor: default; }

  .quiz-check-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .quiz-check-btn:hover { background: var(--primary-hover); }
  .quiz-check-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .quiz-feedback {
    margin-top: 14px;
    padding: 14px 16px;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
  }

  .quiz-feedback.correct {
    background: color-mix(in srgb, var(--success) 10%, transparent);
    border: 1px solid var(--success);
    color: var(--text);
  }

  .quiz-feedback.incorrect {
    background: color-mix(in srgb, var(--error) 10%, transparent);
    border: 1px solid var(--error);
    color: var(--text);
  }

  .quiz-feedback strong { font-weight: 700; }

  .quiz-score {
    margin-top: 20px;
    padding: 16px;
    text-align: center;
    background: var(--bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    font-size: 15px;
  }

  .quiz-score .score-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--primary);
  }

  /* ── Header toolbar ── */
  .book-header {
    position: fixed;
    top: 0;
    left: 280px;
    right: 0;
    height: 44px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
    z-index: 150;
    gap: 6px;
    transition: left 0.3s ease;
  }

  .sidebar-collapsed .book-header { left: 0; }

  .header-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .header-divider {
    width: 1px;
    height: 20px;
    background: var(--border);
    margin: 0 6px;
  }

  .header-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    font-family: system-ui, sans-serif;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    position: relative;
  }

  .header-btn:hover {
    color: var(--text);
    background: var(--bg);
    border-color: var(--text-subtle);
  }

  .header-btn.active {
    color: var(--primary);
    background: color-mix(in srgb, var(--primary) 8%, transparent);
    border-color: var(--primary);
  }

  .header-btn svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Font size buttons */
  .font-size-btn {
    width: 28px;
    height: 28px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    font-family: system-ui, sans-serif;
  }

  .font-size-label {
    font-size: 11px;
    color: var(--text-subtle);
    font-family: system-ui, sans-serif;
    min-width: 30px;
    text-align: center;
  }

  /* Dropdown menu */
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-menu {
    display: none;
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 150px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    z-index: 1000;
  }

  .dropdown.open .dropdown-menu { display: block; }

  .dropdown-item {
    display: block;
    width: 100%;
    padding: 6px 12px;
    border: none;
    background: none;
    text-align: left;
    font-size: 12px;
    color: var(--text-muted);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.1s;
    font-family: system-ui, sans-serif;
  }

  .dropdown-item:hover {
    background: var(--bg-secondary);
    color: var(--text);
  }

  .dropdown-item.selected {
    color: var(--primary);
    font-weight: 600;
    background: color-mix(in srgb, var(--primary) 8%, transparent);
  }

  /* ── Reading progress bar ── */
  .reading-progress {
    position: fixed;
    top: 44px;
    left: 0;
    width: 0%;
    height: 3px;
    background: var(--primary);
    z-index: 300;
    transition: width 0.15s ease;
  }

  /* ── Back to top ── */
  .back-to-top {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    opacity: 0;
    transition: opacity 0.2s, transform 0.2s;
    transform: translateY(10px);
    z-index: 200;
  }

  .back-to-top.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .back-to-top:hover { transform: scale(1.1); }

  /* ── Print styles ── */
  @media print {
    .book-sidebar, .sidebar-toggle, .back-to-top, .reading-progress,
    .book-header, .copy-btn, .quiz-check-btn { display: none !important; }
    .book-content { margin-left: 0 !important; max-width: 100% !important; padding: 20px !important; padding-top: 20px !important; }
    .chapter { page-break-after: always; }
    .quiz-option { cursor: default; }
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .book-sidebar { transform: translateX(-280px); }
    .book-sidebar:not(.collapsed) { transform: translateX(0); }
    .book-content { margin-left: 0; padding: 60px 20px 60px; }
    .book-header { left: 0; }
    .sidebar-toggle { left: 12px; }
  }

  @media (min-width: 1400px) {
    .book-content { padding: 60px 96px 80px; }
  }
`

// ─── JavaScript for interactivity ───────────────────────────────

const HTML_SCRIPT = /* js */ `
(function() {
  // ── Sidebar toggle ──
  const sidebar = document.getElementById('sidebar');
  const wrapper = document.getElementById('book-wrapper');
  const toggleBtn = document.getElementById('sidebar-toggle');

  function toggleSidebar() {
    const isCollapsed = sidebar.classList.contains('collapsed');
    if (isCollapsed) {
      sidebar.classList.remove('collapsed');
      wrapper.classList.remove('sidebar-collapsed');
      wrapper.classList.add('sidebar-open');
    } else {
      sidebar.classList.add('collapsed');
      wrapper.classList.remove('sidebar-open');
      wrapper.classList.add('sidebar-collapsed');
    }
  }

  toggleBtn.addEventListener('click', toggleSidebar);

  // ── Active TOC highlight on scroll ──
  const tocLinks = document.querySelectorAll('.sidebar-nav a');
  const headings = [];
  tocLinks.forEach(link => {
    const id = link.getAttribute('href')?.slice(1);
    if (id) {
      const el = document.getElementById(id);
      if (el) headings.push({ el, link });
    }
  });

  function updateActiveHeading() {
    let current = null;
    for (const { el, link } of headings) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= 120) current = link;
    }
    tocLinks.forEach(l => l.classList.remove('active'));
    if (current) current.classList.add('active');
  }

  // ── Reading progress ──
  const progressBar = document.getElementById('reading-progress');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  // ── Back to top ──
  const backToTop = document.getElementById('back-to-top');
  function updateBackToTop() {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Combined scroll handler ──
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveHeading();
        updateProgress();
        updateBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  });

  // ── Smooth scroll for TOC links ──
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href')?.slice(1);
      const target = id && document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // On mobile, close sidebar after navigation
        if (window.innerWidth <= 900) {
          sidebar.classList.add('collapsed');
          wrapper.classList.remove('sidebar-open');
          wrapper.classList.add('sidebar-collapsed');
        }
      }
    });
  });

  // ── Copy code buttons ──
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('pre');
      const code = pre.querySelector('code');
      const text = code ? code.textContent : pre.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = orig; }, 1500);
      });
    });
  });

  // ── Quiz interactivity ──
  document.querySelectorAll('.quiz-question').forEach(questionEl => {
    const options = questionEl.querySelectorAll('.quiz-option');
    const checkBtn = questionEl.querySelector('.quiz-check-btn');
    const feedbackEl = questionEl.querySelector('.quiz-feedback');
    const isMulti = questionEl.dataset.multiSelect === 'true';
    const selected = new Set();

    options.forEach((opt, idx) => {
      opt.addEventListener('click', () => {
        if (opt.classList.contains('revealed')) return;

        if (isMulti) {
          if (selected.has(idx)) {
            selected.delete(idx);
            opt.classList.remove('selected');
          } else {
            selected.add(idx);
            opt.classList.add('selected');
          }
        } else {
          selected.clear();
          options.forEach(o => o.classList.remove('selected'));
          selected.add(idx);
          opt.classList.add('selected');
        }

        if (checkBtn) checkBtn.disabled = selected.size === 0;
      });
    });

    if (checkBtn) {
      checkBtn.addEventListener('click', () => {
        let allCorrect = true;

        options.forEach((opt, idx) => {
          const isCorrectOption = opt.dataset.correct === 'true';
          const isSelected = selected.has(idx);
          opt.classList.add('revealed');

          if (isCorrectOption) {
            opt.classList.add('correct');
          }
          if (isSelected && !isCorrectOption) {
            opt.classList.add('incorrect');
            allCorrect = false;
          }
          if (!isSelected && isCorrectOption) {
            allCorrect = false;
          }
        });

        checkBtn.style.display = 'none';

        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          feedbackEl.classList.add(allCorrect ? 'correct' : 'incorrect');
        }

        // Update score if all questions in this quiz section are answered
        const section = questionEl.closest('.quiz-section');
        if (section) {
          const allQuestions = section.querySelectorAll('.quiz-question');
          const answeredQuestions = section.querySelectorAll('.quiz-question .quiz-option.revealed');
          const allAnswered = Array.from(allQuestions).every(q =>
            q.querySelector('.quiz-option.revealed')
          );

          if (allAnswered) {
            const scoreEl = section.querySelector('.quiz-score');
            if (scoreEl) {
              let correct = 0;
              allQuestions.forEach(q => {
                const opts = q.querySelectorAll('.quiz-option');
                const isQCorrect = Array.from(opts).every(o => {
                  const isC = o.dataset.correct === 'true';
                  const isSel = o.classList.contains('selected');
                  return isC === isSel;
                });
                if (isQCorrect) correct++;
              });
              scoreEl.querySelector('.score-value').textContent =
                correct + ' / ' + allQuestions.length;
              scoreEl.style.display = 'block';
            }
          }
        }
      });
    }
  });

  // ── Font controls ──
  const FONTS = {
    'system': { family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'Sans' },
    'serif': { family: 'Georgia, "Times New Roman", "Palatino Linotype", serif', label: 'Serif' },
    'mono': { family: '"SF Mono", "Fira Code", "JetBrains Mono", Menlo, Consolas, monospace', label: 'Mono' },
  };

  const WIDTHS = [
    { id: 'narrow', label: 'Narrow' },
    { id: 'medium', label: 'Medium' },
    { id: 'wide', label: 'Wide' },
    { id: 'full-inset', label: 'Full width (inset)' },
    { id: 'full', label: 'Full' },
  ];

  let currentFont = 'serif';
  let currentFontSize = 16;
  let currentWidth = 'full';
  const content = document.querySelector('.book-content');
  const fontLabel = document.getElementById('font-label');
  const widthLabel = document.getElementById('width-label');
  const sizeLabel = document.getElementById('size-label');

  function applyFont(fontKey) {
    currentFont = fontKey;
    const f = FONTS[fontKey];
    content.style.fontFamily = f.family;
    fontLabel.textContent = f.label;
    // Update dropdown selection
    document.querySelectorAll('#font-dropdown .dropdown-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.value === fontKey);
    });
    closeAllDropdowns();
  }

  function applyFontSize(size) {
    size = Math.max(12, Math.min(24, size));
    currentFontSize = size;
    content.style.fontSize = size + 'px';
    sizeLabel.textContent = size + 'px';
  }

  function applyWidth(widthId) {
    currentWidth = widthId;
    wrapper.className = wrapper.className.replace(/\\bwidth-[\\w-]+/g, '');
    wrapper.classList.add('width-' + widthId);
    if (!wrapper.classList.contains('sidebar-collapsed') && !wrapper.classList.contains('sidebar-open')) {
      wrapper.classList.add('sidebar-open');
    }
    widthLabel.textContent = WIDTHS.find(w => w.id === widthId)?.label || widthId;
    document.querySelectorAll('#width-dropdown .dropdown-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.value === widthId);
    });
    closeAllDropdowns();
  }

  // ── Dropdown handling ──
  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
  }

  document.querySelectorAll('.dropdown > .header-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = btn.parentElement;
      const wasOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!wasOpen) dropdown.classList.add('open');
    });
  });

  document.addEventListener('click', () => closeAllDropdowns());

  // Font dropdown items
  document.querySelectorAll('#font-dropdown .dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      applyFont(item.dataset.value);
    });
  });

  // Width dropdown items
  document.querySelectorAll('#width-dropdown .dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      applyWidth(item.dataset.value);
    });
  });

  // Font size buttons
  document.getElementById('font-size-dec')?.addEventListener('click', () => applyFontSize(currentFontSize - 1));
  document.getElementById('font-size-inc')?.addEventListener('click', () => applyFontSize(currentFontSize + 1));

  // ── Theme toggle ──
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const iconSun = document.getElementById('theme-icon-sun');
  const iconMoon = document.getElementById('theme-icon-moon');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      iconSun.style.display = 'none';
      iconMoon.style.display = '';
      themeLabel.textContent = 'Dark';
    } else {
      iconSun.style.display = '';
      iconMoon.style.display = 'none';
      themeLabel.textContent = 'Light';
    }
  }

  applyTheme('light');

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ── Initial state ──
  applyFont('serif');
  applyFontSize(16);
  applyWidth('full');
  updateActiveHeading();
  updateProgress();

  // ── Image lightbox ──
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('figure img').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        if (lightboxCaption) {
          if (img.alt) {
            lightboxCaption.textContent = img.alt;
            lightboxCaption.style.display = 'block';
          } else {
            lightboxCaption.style.display = 'none';
          }
        }
        lightbox.classList.add('active');
      });
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.closest('.lightbox-close')) {
        lightbox.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') lightbox.classList.remove('active');
    });
  }

  // ── Challenge solution toggles ──
  document.querySelectorAll('.challenge-card details').forEach(det => {
    det.addEventListener('toggle', () => {
      const summary = det.querySelector('summary');
      if (summary) {
        summary.textContent = det.open ? 'Hide Solution' : 'Show Solution';
      }
    });
  });
})();
`

// ─── Helpers ────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Convert markdown to HTML with enhanced rendering.
 * Handles headings, code blocks, tables, lists, blockquotes, inline formatting.
 */
function markdownToHtml(md: string, chapterSlug: string): string {
  const lines = md.split('\n')
  const output: string[] = []
  let i = 0
  let inList: 'ul' | 'ol' | null = null

  const closeList = () => {
    if (inList) {
      output.push(inList === 'ul' ? '</ul>' : '</ol>')
      inList = null
    }
  }

  const inlineFormat = (text: string): string => {
    return text
      // Images: ![alt](src)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt: string, src: string) => {
        const safeAlt = escapeHtml(alt)
        const safeSrc = escapeHtml(src)
        const caption = safeAlt ? `<figcaption>${safeAlt}</figcaption>` : ''
        return `<figure><img src="${safeSrc}" alt="${safeAlt}" loading="lazy" referrerpolicy="no-referrer">${caption}</figure>`
      })
      // Bold + italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  }

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    const codeMatch = line.match(/^```(\w*)/)
    if (codeMatch) {
      closeList()
      const lang = codeMatch[1] || ''
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      const badgeHtml = lang
        ? `<span class="lang-badge">${escapeHtml(lang)}</span>`
        : ''
      const classAttr = lang ? ' class="has-badge"' : ''
      output.push(
        `<pre${classAttr}>${badgeHtml}<button class="copy-btn">Copy</button><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`,
      )
      continue
    }

    // Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      closeList()
      const tableRows: string[] = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        tableRows.push(lines[i])
        i++
      }
      if (tableRows.length >= 2) {
        output.push('<div class="table-wrapper"><table>')
        // Header row
        const headerCells = tableRows[0].split('|').filter((c) => c.trim())
        output.push('<thead><tr>')
        headerCells.forEach((c) => output.push(`<th>${inlineFormat(c.trim())}</th>`))
        output.push('</tr></thead>')
        // Body rows (skip separator)
        output.push('<tbody>')
        for (let r = 2; r < tableRows.length; r++) {
          const cells = tableRows[r].split('|').filter((c) => c.trim())
          output.push('<tr>')
          cells.forEach((c) => output.push(`<td>${inlineFormat(c.trim())}</td>`))
          output.push('</tr>')
        }
        output.push('</tbody></table></div>')
      }
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      closeList()
      const level = headingMatch[1].length
      const text = headingMatch[2]
      const id = `${chapterSlug}-${slugify(text)}`
      output.push(`<h${level} id="${id}">${inlineFormat(text)}</h${level}>`)
      i++
      continue
    }

    // lib-callout / lib-summary blocks
    const libBlockMatch = line.match(/^\s*<lib-(callout|summary)\b([^>]*)>/i)
    if (libBlockMatch) {
      closeList()
      const kind = libBlockMatch[1].toLowerCase()
      const closeRe = new RegExp(`</lib-${kind}>`, 'i')
      const blockLines: string[] = []
      while (i < lines.length) {
        blockLines.push(lines[i])
        const done = closeRe.test(lines[i])
        i++
        if (done) break
      }
      const inner = blockLines
        .join('\n')
        .replace(/^\s*<lib-(?:callout|summary)\b[^>]*>/i, '')
        .replace(/<\/lib-(?:callout|summary)>\s*$/i, '')
        .trim()
      const variantMatch = libBlockMatch[2].match(/variant\s*=\s*"([^"]*)"/i)
      const cssClass = kind === 'summary' ? 'summary' : (variantMatch?.[1] ?? 'note')
      const labels: Record<string, { icon: string; label: string }> = {
        'did-you-know': { icon: '💡', label: 'Did You Know?' },
        'try-this': { icon: '⚡', label: 'Try This Now' },
        'war-story': { icon: '🔥', label: 'War Story' },
        'analogy': { icon: '🧩', label: 'Analogy' },
        'hint': { icon: '✨', label: 'Hint' },
        'summary': { icon: '📘', label: 'Chapter Summary' },
      }
      const { icon, label } = labels[cssClass] ?? { icon: '💡', label: cssClass }
      const bodyHtml = markdownToHtml(inner, chapterSlug)
      output.push(
        `<div class="callout ${cssClass}"><div class="callout-header">${icon} ${escapeHtml(label)}</div><div class="callout-body">${bodyHtml}</div></div>`,
      )
      continue
    }

    // Blockquote
    if (line.startsWith('> ') || line === '>') {
      closeList()
      const quoteLines: string[] = []
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      output.push(`<blockquote>${inlineFormat(quoteLines.join('<br>'))}</blockquote>`)
      continue
    }

    // <details>/<summary> blocks (for challenge solutions)
    if (/^\s*<details>/i.test(line)) {
      closeList()
      const detailLines: string[] = []
      let summaryText = 'Details'
      i++ // skip <details>
      while (i < lines.length && !/^\s*<\/details>/i.test(lines[i])) {
        const summaryMatch = lines[i].match(/^\s*<summary>(.*?)<\/summary>/i)
        if (summaryMatch) {
          summaryText = summaryMatch[1]
          i++
          continue
        }
        detailLines.push(lines[i])
        i++
      }
      if (i < lines.length) i++ // skip </details>
      const detailContent = markdownToHtml(detailLines.join('\n'), chapterSlug)
      output.push(`<details><summary>${escapeHtml(summaryText)}</summary><div>${detailContent}</div></details>`)
      continue
    }

    // Image line: ![alt](src)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/)
    if (imgMatch) {
      closeList()
      const alt = escapeHtml(imgMatch[1])
      const src = escapeHtml(imgMatch[2])
      const caption = alt ? `<figcaption>${alt}</figcaption>` : ''
      output.push(`<figure><img src="${src}" alt="${alt}" loading="lazy" referrerpolicy="no-referrer">${caption}</figure>`)
      i++
      continue
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      if (inList !== 'ul') {
        closeList()
        output.push('<ul>')
        inList = 'ul'
      }
      output.push(`<li>${inlineFormat(line.replace(/^[-*]\s/, ''))}</li>`)
      i++
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      if (inList !== 'ol') {
        closeList()
        output.push('<ol>')
        inList = 'ol'
      }
      output.push(`<li>${inlineFormat(line.replace(/^\d+\.\s/, ''))}</li>`)
      i++
      continue
    }

    // Horizontal rule
    if (/^---\s*$/.test(line)) {
      closeList()
      output.push('<hr>')
      i++
      continue
    }

    // Empty line
    if (line.trim() === '') {
      closeList()
      i++
      continue
    }

    // Regular paragraph
    closeList()
    const paraLines: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('> ') &&
      !lines[i].startsWith('- ') &&
      !lines[i].startsWith('* ') &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^---\s*$/.test(lines[i]) &&
      !(lines[i].includes('|') && lines[i].trim().startsWith('|'))
    ) {
      paraLines.push(lines[i])
      i++
    }
    output.push(`<p>${inlineFormat(paraLines.join(' '))}</p>`)
  }

  closeList()
  return output.join('\n')
}

/** Build the quiz HTML for a quiz segment with interactive options */
function buildQuizHtml(quiz: QuizSegment): string {
  const questionsHtml = quiz.questions
    .map((q: QuizQuestion, qi: number) => {
      const optionsHtml = q.options
        .map(
          (opt, oi) => `
          <div class="quiz-option${q.isMultiSelect ? ' multi-select' : ''}"
               data-correct="${opt.isCorrect}" data-idx="${oi}">
            <span class="indicator">${q.isMultiSelect ? '' : ''}</span>
            <span>${escapeHtml(opt.label)}</span>
          </div>`,
        )
        .join('')

      // Render question text (may contain code blocks)
      const questionHtml = q.questionMarkdown
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')

      const feedbackHtml = `
        <div class="quiz-feedback" style="display:none">
          ${q.answer ? `<strong>Answer:</strong> ${escapeHtml(q.answer)}<br>` : ''}
          ${q.explanation ? `<strong>Explanation:</strong> ${escapeHtml(q.explanation)}` : ''}
        </div>`

      return `
        <div class="quiz-question" data-multi-select="${q.isMultiSelect}" data-qidx="${qi}">
          <div class="quiz-question-text">${questionHtml}</div>
          <div class="quiz-options">${optionsHtml}</div>
          <button class="quiz-check-btn" disabled>Check Answer</button>
          ${feedbackHtml}
        </div>`
    })
    .join('')

  return `
    <div class="quiz-section">
      <h2>${escapeHtml(quiz.title)}</h2>
      ${questionsHtml}
      <div class="quiz-score" style="display:none">
        Score: <span class="score-value">0 / ${quiz.questions.length}</span>
      </div>
    </div>`
}

/** Build the challenge HTML for a challenge segment */
function buildChallengeHtml(challenges: import('../../quiz-parser').ChallengeItem[], chapterSlug: string): string {
  const tierConfig: Record<string, { emoji: string; label: string }> = {
    easy: { emoji: '🟢', label: 'Easy' },
    medium: { emoji: '🟡', label: 'Medium' },
    hard: { emoji: '🔴', label: 'Hard' },
    boss: { emoji: '💀', label: 'Boss' },
  }

  const cardsHtml = challenges.map((c) => {
    const tier = tierConfig[c.tier] ?? tierConfig.easy
    const bodyHtml = markdownToHtml(c.bodyMarkdown, chapterSlug)
    const solutionHtml = c.solutionMarkdown
      ? `<details><summary>Show Solution</summary><div>${markdownToHtml(c.solutionMarkdown, chapterSlug)}</div></details>`
      : ''

    return `
      <div class="challenge-card tier-${c.tier}">
        <div class="challenge-header">
          <span class="challenge-emoji">${tier.emoji}</span>
          <div>
            <div class="challenge-tier">${tier.label}</div>
            <div class="challenge-title">${escapeHtml(c.title)}</div>
          </div>
        </div>
        <div class="challenge-body">${bodyHtml}</div>
        ${solutionHtml}
      </div>`
  }).join('')

  return `
    <div class="challenge-section">
      <h2>Challenge</h2>
      ${cardsHtml}
    </div>`
}

// ─── Build chapter content with quiz & challenge support ────────

function buildChapterContentHtml(
  content: string,
  chapterSlug: string,
): string {
  const segments = splitContentIntoSegments(content)
  return segments
    .map((seg) => {
      if (seg.type === 'quiz') {
        return buildQuizHtml(seg)
      }
      if (seg.type === 'challenge') {
        return buildChallengeHtml(seg.challenges, chapterSlug)
      }
      return markdownToHtml(seg.content, chapterSlug)
    })
    .join('\n')
}

// ─── Build sidebar TOC ────────────────────────────────────────

interface TocEntry {
  id: string
  label: string
  level: 'chapter' | 'section'
}

function extractTocEntries(
  content: string,
  chapterSlug: string,
): TocEntry[] {
  const entries: TocEntry[] = []
  for (const line of content.split('\n')) {
    const m = line.match(/^##\s+(.+)/)
    if (m) {
      const text = m[1]
      // Skip quiz and challenge headings in sidebar
      if (/^(Micro\s+)?Quiz$/i.test(text)) continue
      if (/^Challenge$/i.test(text)) continue
      entries.push({
        id: `${chapterSlug}-${slugify(text)}`,
        label: text,
        level: 'section',
      })
    }
  }
  return entries
}

// ─── Main HTML generator ────────────────────────────────────────

async function generateHtmlBlob(options: ExportOptions): Promise<Blob> {
  const chaptersHtml: string[] = []
  const tocHtml: string[] = []

  console.log(`[HTML Export] Building ${options.chapters.length} chapters`)

  // Build each chapter
  for (const ch of options.chapters) {
    const chapterSlug = `ch-${ch.chapterNumber}`
    const chapterId = `chapter-${ch.chapterNumber}`
    // Inline any offline-cached images as base64 data URLs so the
    // exported HTML is fully self-contained and viewable without Genisys.
    const inlinedMarkdown = await inlineCachedImagesInMarkdown(ch.content)
    const contentHtml = buildChapterContentHtml(inlinedMarkdown, chapterSlug)

    console.log(
      `[HTML Export] Ch${ch.chapterNumber}: md=${ch.content.length} chars, html=${contentHtml.length} chars`,
    )

    chaptersHtml.push(`
      <div class="chapter" id="${chapterId}">
        <div class="chapter-header">
          <h1>Chapter ${ch.chapterNumber}: ${escapeHtml(ch.title)}</h1>
        </div>
        ${contentHtml}
      </div>
    `)

    // TOC entry for chapter
    tocHtml.push(
      `<a href="#${chapterId}">Chapter ${ch.chapterNumber}: ${escapeHtml(ch.title)}</a>`,
    )

    // Sub-sections
    const sections = extractTocEntries(ch.content, chapterSlug)
    if (sections.length > 0) {
      tocHtml.push('<div class="chapter-sections">')
      for (const s of sections) {
        tocHtml.push(`<a href="#${s.id}">${escapeHtml(s.label)}</a>`)
      }
      tocHtml.push('</div>')
    }
  }

  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.bookTitle)}</title>
  <style>${HTML_STYLES}</style>
</head>
<body>
  <div class="reading-progress" id="reading-progress"></div>

  <button class="sidebar-toggle" id="sidebar-toggle" title="Toggle sidebar">☰</button>

  <div class="book-wrapper sidebar-open width-full" id="book-wrapper">
    <nav class="book-sidebar" id="sidebar">
      <div class="sidebar-title">${escapeHtml(options.bookTitle)}</div>
      <div class="sidebar-nav">
        <a href="#cover">Cover</a>
        ${tocHtml.join('\n        ')}
      </div>
    </nav>

    <header class="book-header">
      <div class="header-group">
        <div class="dropdown" id="font-dropdown">
          <button class="header-btn">
            <svg viewBox="0 0 24 24"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
            <span id="font-label">Serif</span>
            <svg viewBox="0 0 24 24" style="width:10px;height:10px"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="dropdown-menu">
            <button class="dropdown-item" data-value="system" style="font-family:system-ui,sans-serif">Sans</button>
            <button class="dropdown-item selected" data-value="serif" style="font-family:Georgia,serif">Serif</button>
            <button class="dropdown-item" data-value="mono" style="font-family:'SF Mono',Menlo,monospace">Mono</button>
          </div>
        </div>
      </div>

      <div class="header-divider"></div>

      <div class="header-group">
        <button class="header-btn font-size-btn" id="font-size-dec" title="Decrease font size">A-</button>
        <span class="font-size-label" id="size-label">16px</span>
        <button class="header-btn font-size-btn" id="font-size-inc" title="Increase font size">A+</button>
      </div>

      <div class="header-divider"></div>

      <div class="header-group">
        <button class="header-btn" id="theme-toggle" title="Toggle theme">
          <svg id="theme-icon-sun" viewBox="0 0 24 24" style="display:none"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <svg id="theme-icon-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          <span id="theme-label">Dark</span>
        </button>
      </div>

      <div class="header-divider"></div>

      <div class="header-group">
        <div class="dropdown" id="width-dropdown">
          <button class="header-btn">
            <svg viewBox="0 0 24 24"><path d="M21 3H3v18h18V3z"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
            <span id="width-label">Full</span>
            <svg viewBox="0 0 24 24" style="width:10px;height:10px"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="dropdown-menu">
            <button class="dropdown-item" data-value="narrow">Narrow</button>
            <button class="dropdown-item" data-value="medium">Medium</button>
            <button class="dropdown-item" data-value="wide">Wide</button>
            <button class="dropdown-item" data-value="full-inset">Full width (inset)</button>
            <button class="dropdown-item selected" data-value="full">Full</button>
          </div>
        </div>
      </div>
    </header>

    <main class="book-content">
      <div class="book-content-inner">
      <div class="book-cover" id="cover">
        <h1>${escapeHtml(options.bookTitle)}</h1>
        ${options.bookDescription ? `<p class="subtitle">${escapeHtml(options.bookDescription)}</p>` : ''}
        <p class="meta">${options.chapters.length} chapter${options.chapters.length !== 1 ? 's' : ''} · Exported on ${exportDate}</p>
      </div>

      ${chaptersHtml.join('\n')}
      </div>
    </main>
  </div>

  <button class="back-to-top" id="back-to-top" title="Back to top">↑</button>

  <div class="lightbox-overlay" id="lightbox">
    <button class="lightbox-close" title="Close">✕</button>
    <img id="lightbox-img" src="" alt="">
    <div class="lightbox-caption" id="lightbox-caption"></div>
  </div>

  <script>${HTML_SCRIPT}</script>
</body>
</html>`

  console.log(
    `[HTML Export] Final HTML: ${(fullHtml.length / 1024).toFixed(1)} KB, ${chaptersHtml.length} chapter blocks`,
  )

  return new Blob([fullHtml], { type: 'text/html' })
}

// ─── Exported format descriptor ────────────────────────────────

export const htmlExporter: ExportFormat = {
  id: 'html',
  label: 'HTML Document',
  description: 'Export as a self-contained HTML file with interactive quizzes',
  extension: 'html',
  mimeType: 'text/html',
  export: generateHtmlBlob,
}
