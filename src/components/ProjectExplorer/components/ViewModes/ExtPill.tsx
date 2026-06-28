import { memo } from 'react'

import { cn } from '@/lib/utils'

interface ExtPillProps {
  ext: string | null
  size?: 'xs' | 'sm'
  className?: string
}

const EXT_COLOR_MAP: Record<string, string> = {
  // documents
  docx: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  doc: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  pdf: 'bg-red-500/10 text-red-600 dark:text-red-400',
  md: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  mdx: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  txt: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
  // code
  ts: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  tsx: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  js: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  jsx: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  json: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rs: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  py: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  go: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  html: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  css: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  scss: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  // images / media
  png: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  jpg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  jpeg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  gif: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  svg: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
  webp: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  // archives
  zip: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300',
  tar: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300',
  gz: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300'
}

const PALETTE = [
  'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  'bg-lime-500/10 text-lime-700 dark:text-lime-400',
  'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  'bg-slate-500/10 text-slate-600 dark:text-slate-400'
]

function hashExt(ext: string): string {
  let h = 0
  for (let i = 0; i < ext.length; i++) {
    h = (h * 31 + ext.charCodeAt(i)) | 0
  }
  return PALETTE[Math.abs(h) % PALETTE.length]
}

export const ExtPill = memo(function ExtPill({
  ext,
  size = 'xs',
  className
}: ExtPillProps): React.JSX.Element | null {
  if (!ext) return null
  const color = EXT_COLOR_MAP[ext] ?? hashExt(ext)
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm font-medium tracking-tight lowercase",
        size === "xs" ? "text-[10px] px-1 py-0" : "text-[11px] px-1.5 py-0.5",
        color,
        className,
      )}
    >
      {ext}
    </span>
  );
})
