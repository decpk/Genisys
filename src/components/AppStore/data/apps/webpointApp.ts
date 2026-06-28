import {
  Download,
  Layers,
  MonitorPlay,
  Palette,
  Presentation,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wand2,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const webpointApp: AppCatalogEntry = {
  id: 'webpoint',
  name: 'WebPoint',
  tagline: 'AI-built presentations you can edit live.',
  description:
    'WebPoint turns a single prompt into a complete slide deck rendered in real HTML, CSS, and JavaScript — then hands you full control to shape every slide directly on the canvas. Select any element to edit its text, colour, gradient, font family, size, weight, alignment, and spacing, reposition and resize it freely, and add entrance animations like fade, slide, zoom, or bounce with custom duration and delay. A dedicated properties inspector fine-tunes per-slide backgrounds (solid or gradient), transition styles, and speaker notes, while a resizable thumbnail rail lets you reorder, add, and jump between slides at a glance. The built-in AI assistant always carries your full deck plus current-slide context, so you can ask it to generate a deck from scratch, append new slides, or refine the one you are on — pulling in data from connected sources as it goes. Every slide renders inside an isolated sandbox for safety, you can keep multiple presentations open and switch between them instantly, preview without the editing chrome, and run a full-screen presentation mode with speaker notes and keyboard navigation. When you are done, export the whole deck to a standalone HTML file that opens in any browser and prints straight to PDF. WebPoint is still in active development.',
  category: 'ai',
  icon: Presentation,
  accentColor: '#F97316',
  features: [
    {
      icon: Wand2,
      title: 'Prompt to deck',
      description: 'Generate a full slide deck from a single natural-language prompt.',
    },
    {
      icon: Palette,
      title: 'Edit on the slide',
      description:
        'Change text, colour, gradient, font, size, position, and animation in place.',
    },
    {
      icon: SlidersHorizontal,
      title: 'Properties inspector',
      description:
        'Fine-tune backgrounds, transitions, animations, and speaker notes.',
    },
    {
      icon: Layers,
      title: 'Live thumbnail rail',
      description: 'Reorder, add, and jump between slides from a resizable side panel.',
    },
    {
      icon: Sparkles,
      title: 'Context-aware assistant',
      description:
        'Ask the AI to generate or refine slides with your full deck as context.',
    },
    {
      icon: MonitorPlay,
      title: 'Presentation mode',
      description:
        'Run a full-screen slideshow with speaker notes and keyboard navigation.',
    },
    {
      icon: Download,
      title: 'Export to HTML',
      description: 'Save a standalone deck that opens in any browser and prints to PDF.',
    },
    {
      icon: ShieldCheck,
      title: 'Sandboxed rendering',
      description: 'Every slide renders inside an isolated sandbox for safety.',
    },
  ],
  whatsNew: [
    'Edit any slide directly on the canvas — text, colour, gradients, fonts, position, and animation.',
    'New properties inspector for per-slide backgrounds, transitions, and speaker notes.',
    'Full-screen presentation mode with speaker notes and keyboard navigation.',
    'Export presentations to a standalone HTML file you can open anywhere and print to PDF.',
    'Context-aware AI assistant that generates and refines slides using your full deck.',
  ],
  version: '1.0',
  status: 'in-development',
}
