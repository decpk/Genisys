import type { PmFolder, PmCategory, PmPrompt } from '@/store/prompt-manager-store'

// ─── Share Format ───────────────────────────────────────────────

const SHARE_MAGIC = 'genisys-pm'
const SHARE_VERSION = 1

export interface PmSharePayload {
  _fmt: typeof SHARE_MAGIC
  _v: typeof SHARE_VERSION
  at: string
  kind: 'folder' | 'prompt'
  folder?: Omit<PmFolder, 'sortOrder'>
  categories?: Omit<PmCategory, 'folderId' | 'sortOrder'>[]
  prompts: Omit<PmPrompt, 'folderId' | 'categoryId' | 'sortOrder' | 'isPinned'>[]
  /** Maps exported category IDs → prompt IDs for reassembly */
  catMap?: Record<string, string[]>
}

// ─── Export ─────────────────────────────────────────────────────

export function exportFolder(
  folder: PmFolder,
  categories: PmCategory[],
  prompts: PmPrompt[],
): string {
  const folderCats = categories.filter((c) => c.folderId === folder.id)
  const folderPrompts = prompts.filter((p) => p.folderId === folder.id)

  const catMap: Record<string, string[]> = {}
  for (const cat of folderCats) {
    catMap[cat.id] = folderPrompts.filter((p) => p.categoryId === cat.id).map((p) => p.id)
  }

  const payload: PmSharePayload = {
    _fmt: SHARE_MAGIC,
    _v: SHARE_VERSION,
    at: new Date().toISOString(),
    kind: 'folder',
    folder: {
      id: folder.id,
      name: folder.name,
      color: folder.color,
      scopes: folder.scopes ?? [],
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    },
    categories: folderCats.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
    prompts: folderPrompts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      description: p.description,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    catMap,
  }

  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

export function exportPrompt(prompt: PmPrompt): string {
  const payload: PmSharePayload = {
    _fmt: SHARE_MAGIC,
    _v: SHARE_VERSION,
    at: new Date().toISOString(),
    kind: 'prompt',
    prompts: [
      {
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        description: prompt.description,
        createdAt: prompt.createdAt,
        updatedAt: prompt.updatedAt,
      },
    ],
  }

  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

// ─── Parse ──────────────────────────────────────────────────────

export function parseSharePayload(raw: string): PmSharePayload | null {
  try {
    // Try base64 first
    let json: string
    try {
      json = decodeURIComponent(escape(atob(raw.trim())))
    } catch {
      // Fall back to raw JSON
      json = raw.trim()
    }

    const parsed = JSON.parse(json)

    if (parsed?._fmt !== SHARE_MAGIC || parsed?._v !== SHARE_VERSION) return null
    if (!Array.isArray(parsed.prompts) || parsed.prompts.length === 0) return null
    if (parsed.kind !== 'folder' && parsed.kind !== 'prompt') return null

    return parsed as PmSharePayload
  } catch {
    return null
  }
}

// ─── Copy helpers ───────────────────────────────────────────────

import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('prompts')

export async function shareFolder(
  folder: PmFolder,
  categories: PmCategory[],
  prompts: PmPrompt[],
): Promise<void> {
  const encoded = exportFolder(folder, categories, prompts)
  await navigator.clipboard.writeText(encoded)
  const promptCount = prompts.filter((p) => p.folderId === folder.id).length
  toast.success('Folder copied to clipboard', {
    description: `"${folder.name}" — ${promptCount} prompt${promptCount !== 1 ? 's' : ''} ready to share`,
  })
}

export async function sharePrompt(prompt: PmPrompt): Promise<void> {
  const encoded = exportPrompt(prompt)
  await navigator.clipboard.writeText(encoded)
  toast.success('Prompt copied to clipboard', {
    description: `"${prompt.title}" ready to share`,
  })
}
